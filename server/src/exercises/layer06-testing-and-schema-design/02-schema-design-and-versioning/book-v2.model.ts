import { Genre } from '@/exercises/layer01-basics/01-schema-and-types/books.model';
import { ObjectType, Field, ID, Int, HideField } from '@nestjs/graphql';

@ObjectType()
export class BookV2 {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @HideField()
  authorId!: string;

  @Field(() => Int, {
    nullable: true,
    deprecationReason: 'Use publishedDate instead',
  })
  publishedYear!: number | null;

  @Field(() => String, { nullable: true })
  publishedDate!: string | null;

  @Field(() => Genre)
  genre!: Genre;
}
