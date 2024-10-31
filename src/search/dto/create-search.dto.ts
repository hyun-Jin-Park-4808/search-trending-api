import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsNotEmptyString } from "./is-not-empty.decorator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSearchDto {
    @ApiProperty({
        description: '검색할 키워드',
        example: '청바지',
        required: true,
      })
    @IsNotEmptyString()
    keyword: string;

    @ApiProperty({
        description: '비회원 이용 시 자동으로 저장되는 ip',
        example: '입력하지 마시고, 해당 항목은 지워주세요.',
        required: false,
      })
    @IsString()
    @IsOptional()
    ip?: string;

    @ApiProperty({
        description: '인증 기능 구현시 토큰 값으로 대체 필요',
        example: 'email@naver.com, 테스트 시 목 데이터가 없기 때문에 입력하지 마시고 지워주세요.',
        required: false,
      })
    @IsString()
    @IsOptional()
    email?: string;
}
