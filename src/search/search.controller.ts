import { Controller, Get, Post, Body, Param, Request, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { FilterSearchDto } from './dto/filter-search.dto';
import { ApiOperation } from '@nestjs/swagger';


@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: '키워드 저장 - 회원/비회원 구분해 저장' })
  @Post("/keywords")
  saveKeyword(@Body() createSearchDto: CreateSearchDto, @Request() req) {
      createSearchDto.ip = req.ip;
    return this.searchService.saveKeyword(createSearchDto);
  }

  @ApiOperation({ summary: '24시간 내 인기 검색어 순위 조회(필터링 시에는 변동 순위 제공 x' })
  @Get("/trending")
  findTrendingKeywords(@Query() filterSearchDto: FilterSearchDto) {
    return this.searchService.findTrendingKeywords(filterSearchDto);
  }
}
