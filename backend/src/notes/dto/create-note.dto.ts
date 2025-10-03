import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // "math,calculus"  (we’ll store as plain string for simplicity)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  tags?: string;
}
