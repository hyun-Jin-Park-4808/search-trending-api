import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  // 각 테스트 이후 모킹 초기화
  afterEach(() => {
    jest.clearAllMocks();
  })

  /**
   * 1. 키워드 저장 
   * request dto에 회원 메일이 있으면 해당 회원 정보를 찾아온다. 
   * - 회원이 존재하지 않으면 에러를 발생시킨다. 
   * request dto에 keyword가 없으면 에러를 발생시킨다. 
   * 회원 정보와 함께 키워드를 postgreSQL db와 redis에 저장한다. 
   * 비회원의 경우, 회원 정보 없이 키워드를 postgreSQL db와 redis에 저장한다. 
   */
  describe('saveKeyword', () => {
    it('성공 케이스 - 회원 검색', async() => {
      
    });

    it('성공 케이스 - 비회원 검색', async() => {
      
    });

    it('이메일에 해당하는 멤버가 존재하지 않아 발생하는 실패 케이스', async() => {

    });

    it('검색어가 비어 있어 발생하는 실패 케이스', async() => {

    });
  })

  /**
   * 2. 인기 검색어 조회 
   * 필터링 조건이 없으면, redis를 통해 전체 검색어 대상으로 24시간 내 인기 검색어 10개를 순위와 순위 변동 내역과 함께 반환한다. 
   * 필터링 조건이 있으면, 필터링 조건에 맞는 데이터를 대상으로 24시간 내 인기 검색어 10개를 순위와 순위 변동 내역과 함께 반환한다. 
   */
  describe('getPopularKeywords', () => {
    it('성공 케이스 - 전체 순위', async() => {
      
    });

    it('성공 케이스 - 필터링 적용', async() => {
      
    });

    it('이메일에 해당하는 멤버가 존재하지 않아 발생하는 실패 케이스', async() => {

    });

    it('레디스 연결 에러 발생 시, postreSQL 사용해서 데이터 불러오는 케이스', async() => {

    });
  })
});
