import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post("/keywords")
  saveKeyword(@Body() createSearchDto: CreateSearchDto, @Request() req) {
      createSearchDto.ip = req.ip;
    return this.searchService.saveKeyword(createSearchDto);
  }

  @Get()
  findAll() {
    return this.searchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchService.findOne(+id);
  }

}
