import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotesDto {
  @IsOptional() @IsString() q?: string;      // search query
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 10;
  @IsOptional() approved?: 'true' | 'false';  // filter later
}
