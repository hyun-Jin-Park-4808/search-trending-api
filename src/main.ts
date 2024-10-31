import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/search')

  const config = new DocumentBuilder()
  .setTitle('Search Trending API Documentation')
  .setDescription('검색어 저장 및 인기 검색어 조회 서비스에 대한 API 명세입니다.')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 들어오는 요청의 속성을 정의된 dto의 타입으로 변환 
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
