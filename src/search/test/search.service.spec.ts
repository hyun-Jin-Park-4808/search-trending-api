import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../search.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSearchDto } from '../dto/create-search.dto';
import { Gender, Region, User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { redis } from '../../config/redis.config';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  searchKeyword: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

const mockRedis = {
  zincrby: jest.fn(),
  hset: jest.fn(),
  rpush: jest.fn(),
  expire: jest.fn(),
  quit: jest.fn(),
  zrank: jest.fn(),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    (redis as any) = mockRedis; // Redis 모킹
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 모킹 초기화
  });

  describe('saveKeyword', () => {
    it('성공 케이스 - 회원 검색어 저장', async () => {
      const createSearchDto: CreateSearchDto = {
        keyword: '청바지',
        ip: '127.0.0.1',
        email: 'user@example.com',
      };

      const mockUser: User = {
        id: 1, age: 25, gender: Gender.MALE, region: Region.SEJONG,
        email: 'test@email.com',
        userName: '홍길동',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.searchKeyword.create.mockResolvedValue({
        id: 1,
        keyword: createSearchDto.keyword,
        user: { connect: { id: mockUser.id } },
      });

      const result = await service.saveKeyword(createSearchDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createSearchDto.email },
      });
      expect(mockPrismaService.searchKeyword.create).toHaveBeenCalled();
      expect(mockRedis.zincrby).toHaveBeenCalledWith('trending:keywords', 1, '청바지');
      expect(mockRedis.hset).toHaveBeenCalledWith(`search:청바지:filter`, 'age', '25');
      expect(mockRedis.hset).toHaveBeenCalledWith(`search:청바지:filter`, 'gender', 'MALE');
      expect(mockRedis.hset).toHaveBeenCalledWith(`search:청바지:filter`, 'region', 'SEJONG');
      expect(mockRedis.rpush).toHaveBeenCalledWith(`search:청바지:time`, expect.any(Number));
      expect(result).toEqual({
        id: 1,
        keyword: createSearchDto.keyword,
        user: { connect: { id: mockUser.id } },
      });
    });

    it('성공 케이스 - 비회원 검색어 저장', async () => {
      const createSearchDto: CreateSearchDto = {
        keyword: '청바지',
        ip: '127.0.0.1'
      };

      mockPrismaService.searchKeyword.create.mockResolvedValue({
        id: 2,
        keyword: createSearchDto.keyword,
        ip: createSearchDto.ip,
      });

      const result = await service.saveKeyword(createSearchDto);

      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled(); // 이메일이 없으므로 호출되지 않음
      expect(mockPrismaService.searchKeyword.create).toHaveBeenCalled();
      expect(mockRedis.zincrby).toHaveBeenCalledWith('trending:keywords', 1, '청바지');
      expect(mockRedis.rpush).toHaveBeenCalledWith(`search:청바지:time`, expect.any(Number));
      expect(result).toEqual({
        id: 2,
        keyword: createSearchDto.keyword,
        ip: createSearchDto.ip,
      });
    });

    it('실패 케이스 - 유효하지 않은 회원 접근', async () => {
      const createSearchDto: CreateSearchDto = {
        keyword: '청바지',
        ip: '127.0.0.1',
        email: 'nonexistent@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null); // 사용자 없음

      await expect(service.saveKeyword(createSearchDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createSearchDto.email },
      });
    });
  });

  /**
   * 2. 인기 검색어 조회 
   * 필터링 조건이 없으면, redis를 통해 전체 검색어 대상으로 24시간 내 인기 검색어 10개를 순위와 순위 변동 내역과 함께 반환한다. 
   * 필터링 조건이 있으면, 필터링 조건에 맞는 데이터를 대상으로 24시간 내 인기 검색어 10개를 순위와 순위 변동 내역과 함께 반환한다. 
   */
  describe('getPopularKeywords', () => {
    it('성공 케이스 - 전체 순위', async () => {

    });

    it('성공 케이스 - 필터링 적용', async () => {

    });

    it('이메일에 해당하는 멤버가 존재하지 않아 발생하는 실패 케이스', async () => {

    });

    it('레디스 연결 에러 발생 시, postreSQL 사용해서 데이터 불러오는 케이스', async () => {

    });
  });
  afterAll(async () => {
    await mockRedis.quit(); // Redis 연결 종료 (모킹한 메서드 호출)
  });
});
