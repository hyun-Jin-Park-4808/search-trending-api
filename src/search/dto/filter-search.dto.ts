import { Gender, Region } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class FilterSearchDto {
    @IsOptional()
    @IsString()
    age?: string; // 0(0~9세), 10, 20, 30, ~  
  
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;
  
    @IsOptional()
    @IsEnum(Region)
    region?: Region;
}
