import { InputType, Field, Int } from '@nestjs/graphql';
import { Genre } from '../books.model';

@InputType()
export class CreateBookInput {
  @Field()
  title!: string;

  @Field()
  author!: string;

  @Field(() => Int, { nullable: true })
  publishedYear!: number | null;

  @Field(() => Genre)
  genre!: Genre;
}
