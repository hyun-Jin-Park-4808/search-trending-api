import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchKeyword, User } from '@prisma/client';
import { redis } from '../config/redis.config';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async saveKeyword({keyword, ip, email}: CreateSearchDto): Promise<SearchKeyword> {
    const expiration = 24 * 60 * 60 * 1000;
    let user: User; 
    if(email) {
      user = await this.prisma.user.findUnique({
        where: {email: email}
      });

      if(!user) {
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

      if(user) {
        await redis.hset(`search:${keyword.trim()}:filter`, 'age', user.age.toString());
        await redis.hset(`search:${keyword.trim()}:filter`, 'gender', user.gender);
        await redis.hset(`search:${keyword.trim()}:filter`, 'region', user.region);
      }
      
      await redis.rpush(`search:${keyword.trim()}:time`, Date.now());
      await redis.expire(`search:${keyword.trim()}:time`, expiration);

      return result;
    });
  }

  findAll() {
    return `This action returns all search`;
  }

  findOne(id: number) {
    return `This action returns a #${id} search`;
  }

}
