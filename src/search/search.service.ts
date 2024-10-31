import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchKeyword, User } from '@prisma/client';
import { redis } from '../config/redis.config';
import { FilterSearchDto } from './dto/filter-search.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  async saveKeyword({ keyword, ip, email }: CreateSearchDto): Promise<SearchKeyword> {
    const expiration = 24 * 60 * 60 * 1000;
    let user: User;
    if (email) {
      user = await this.prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        throw new NotFoundException(
          `해당 이메일에 대한 회원 정보를 찾을 수 없습니다. 이메일: ${email}`
        );
      }
    }
    return await this.prisma.$transaction(async (prisma) => {

      const result = await prisma.searchKeyword.create({
        data: user ? {
          keyword: keyword.trim(),
          user: {
            connect: {
              id: user.id
            }
          },
          gender: user.gender,
          region: user.region,
          age: user.age
        } :
          {
            keyword: keyword.trim(),
            ip: ip
          }
      });

      await redis.zincrby('trending:keywords', 1, keyword.trim());

      if (user) {
        await redis.hset(`search:${keyword.trim()}:filter`, 'age', user.age.toString());
        await redis.hset(`search:${keyword.trim()}:filter`, 'gender', user.gender);
        await redis.hset(`search:${keyword.trim()}:filter`, 'region', user.region);
      }

      await redis.rpush(`search:${keyword.trim()}:time`, Date.now());
      await redis.expire(`search:${keyword.trim()}:time`, expiration);

    // 현재 키워드의 순위를 가져옴
    const currentRank = await redis.zrank('trending:keywords', keyword.trim()) + 1;

    // 현재 순위를 Redis에 저장
    await redis.hset(`search:${keyword.trim()}:rank`, 'current', currentRank);

      return result;
    });
  }
  async findTrendingKeywords({ age, gender, region }: FilterSearchDto) {
    // 현재 시각과 24시간 전 시각 계산
    const expiration = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const past24Hours = now - expiration;
  
    // Redis에서 인기 검색어 가져오기
    let trendingKeywords = await redis.zrevrange('trending:keywords', 0, -1, 'WITHSCORES');
  
    // 인기 검색어와 그에 대한 점수(횟수)를 매핑
    let keywordsWithScores = this.mapKeywordsWithScores(trendingKeywords);
  
    // 필터링 조건이 있을 경우 필터링하고, 24시간 내로 카운팅 된 데이터로 업데이트 및 상위 10개 데이터 바로 결과로 반환
    if (age || gender || region) {
      keywordsWithScores = await this.filterKeywords(keywordsWithScores, age, gender, region);
      const resultWithFilter = await this.updateKeywordCounts(keywordsWithScores, past24Hours);
      return resultWithFilter;
    } 
  
    // 필터링 없는 경우 24시간 내에 카운팅된 데이터로 업데이트 및 상위 10개 데이터 반환 (순위 포함)
    const updatedKeywords = await this.updateKeywordCounts(keywordsWithScores, past24Hours);
  
    // 인기 검색어 변동 순위 계산
    const result = await this.calculateRankChanges(updatedKeywords);
  
    return result;
  }
  
  private mapKeywordsWithScores(trendingKeywords: string[]): { keyword: string; score: number }[] {
    const keywordsWithScores = [];
    for (let i = 0; i < trendingKeywords.length; i += 2) {
      keywordsWithScores.push({
        keyword: trendingKeywords[i],
        score: parseInt(trendingKeywords[i + 1], 10),
      });
    }
    return keywordsWithScores;
  }
  
  private async filterKeywords(
    keywordsWithScores: { keyword: string; score: number }[],
    age?: string,
    gender?: string,
    region?: string,
  ) {
    const filteredResults = [];
  
    for (const { keyword, score } of keywordsWithScores) {
      const filters = await redis.hgetall(`search:${keyword}:filter`);
  
      if (
        (age && !this.isAgeInRange(filters.age, age)) ||
        (gender && filters.gender !== gender) ||
        (region && filters.region !== region)
      ) {
        continue; // 필터링 조건에 맞지 않으면 생략
      }
  
      filteredResults.push({ keyword, score });
    }
  
    return filteredResults;
  }
  
  private async updateKeywordCounts(keywordsWithScores: { keyword: string; score: number }[], past24Hours: number) {
    const updatedResults = [];
  
    for (const { keyword } of keywordsWithScores) {
      const timestampList = await redis.lrange(`search:${keyword}:time`, 0, -1);
      const validCounts = timestampList.filter(ts => Number(ts) >= past24Hours).length;
  
      updatedResults.push({
        keyword,
        score: validCounts, // 24시간 내에 카운팅된 횟수로 업데이트
      });
    }
  
    // 점수 기준으로 정렬 후 순위와 함께 상위 10개 반환
    return updatedResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item, index) => ({ ...item, currentRank: index + 1 })); // currentRank 추가
  }
  
  private isAgeInRange(userAge: string, filterAge: string): boolean {
    const userAgeNum = parseInt(userAge, 10);
    const filterAgeNum = parseInt(filterAge, 10);
  
    // 필터링 기준: 0~9세는 0, 10~19세는 10, 20~29세는 20 ...
    const minAge = filterAgeNum;
    const maxAge = filterAgeNum + 9;
  
    return userAgeNum >= minAge && userAgeNum <= maxAge; // 사용자 나이가 필터링 조건 내에 있는지 확인
  }
  
  private async calculateRankChanges(updatedKeywords: { keyword: string; score: number; currentRank: number }[]) {
    const result = [];
  
    for (const { keyword, score, currentRank } of updatedKeywords) {
      // 이전 순위를 Redis에서 가져옴
      const previousRank = await redis.hget(`search:${keyword.trim()}:rank`, 'current');
  
      // 현재 순위를 Redis에 저장
      await redis.hset(`search:${keyword.trim()}:rank`, 'current', currentRank);
  
      // 현재 순위와 이전 순위의 변동 계산
      const rankChange = previousRank !== null ? Number(previousRank) - currentRank : null;

      result.push({
        keyword,
        score,
        currentRank,
        rankChange,
      });
    }
  
    return result.sort((a, b) => b.score - a.score); // 점수 기준으로 내림차순 정렬
  }  
}