import { Controller, Get, Post, Body, Param, Request, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { FilterSearchDto } from './dto/filter-search.dto';


@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post("/keywords")
  saveKeyword(@Body() createSearchDto: CreateSearchDto, @Request() req) {
      createSearchDto.ip = req.ip;
    return this.searchService.saveKeyword(createSearchDto);
  }

  @Get("/trending")
  findTrendingKeywords(@Query() filterSearchDto: FilterSearchDto) {
    return this.searchService.findTrendingKeywords(filterSearchDto);
  }
}
