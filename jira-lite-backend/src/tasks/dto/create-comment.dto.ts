// src/tasks/dto/create-comment.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;

  @IsString()
  @IsNotEmpty()
  author!: string; // or get from auth context
}
