import { InputType, Field, Int } from '@nestjs/graphql';
import { Genre } from '../books.model';

@InputType()
export class UpdateBookInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  author?: string;

  @Field(() => Int, { nullable: true })
  publishedYear?: number | null;

  @Field(() => Genre, { nullable: true })
  genre?: Genre;
}
