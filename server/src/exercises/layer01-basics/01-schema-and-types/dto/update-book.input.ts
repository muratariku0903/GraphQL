import { InputType, Field, Int } from '@nestjs/graphql';
import { Genre } from '../books.model';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class UpdateBookInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  authorId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1000)
  @Max(2100)
  publishedYear?: number | null;

  @Field(() => Genre, { nullable: true })
  @IsOptional()
  @IsEnum(Genre)
  genre?: Genre;
}
