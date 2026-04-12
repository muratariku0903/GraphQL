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
export class CreateBookInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @Field()
  @IsNotEmpty()
  authorId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1000)
  @Max(2100)
  publishedYear!: number | null;

  @Field(() => Genre)
  @IsEnum(Genre)
  genre!: Genre;
}
