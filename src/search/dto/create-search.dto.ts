import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsNotEmptyString } from "./is-not-empty.decorator";

export class CreateSearchDto {
    @IsNotEmptyString()
    keyword: string;

    @IsString()
    @IsOptional()
    ip?: string;

    @IsString()
    @IsOptional()
    email?: string;
}
