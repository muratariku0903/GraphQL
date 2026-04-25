import { InputType, Field } from '@nestjs/graphql';
import { Genre } from '../books.model';
import { IsEnum, IsOptional, Max, Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field({ defaultValue: 10 })
  @Min(1)
  @Max(50)
  first!: number;

  @Field({ nullable: true })
  @IsOptional()
  after?: string;
}

@InputType()
export class BookFilterInput {
  @Field(() => Genre, { nullable: true })
  @IsEnum(Genre)
  @IsOptional()
  genre?: Genre;

  @Field({ nullable: true })
  @IsOptional()
  publishedYearFrom?: number;

  @Field({ nullable: true })
  @IsOptional()
  publishedYearTo?: number;
}
