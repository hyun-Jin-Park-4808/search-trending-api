import { ApiProperty } from "@nestjs/swagger";
import { Gender, Region } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class FilterSearchDto {
    @ApiProperty({
        description: '사용자 나이 (0은 0~9세, 10은 10~19세, ...)',
        example: '10',
        required: false,
      })
    @IsOptional()
    @IsString()
    age?: string; 
  
    @ApiProperty({
        description: '성별',
        enum: Gender,
        required: false,
      })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;
  
    @ApiProperty({
        description: '지역',
        enum: Region,
        required: false,
      })
    @IsOptional()
    @IsEnum(Region)
    region?: Region;
}
