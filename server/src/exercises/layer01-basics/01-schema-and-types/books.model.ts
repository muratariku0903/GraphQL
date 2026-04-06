import {
  ObjectType,
  Field,
  ID,
  Int,
  registerEnumType,
  HideField,
} from '@nestjs/graphql';

export enum Genre {
  FICTION,
  NON_FICTION,
  SCIENCE,
  TECHNOLOGY,
  HISTORY,
}

registerEnumType(Genre, { name: 'Genre' });

@ObjectType()
export class Book {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @HideField()
  authorId!: string;

  @Field(() => Int, { nullable: true })
  publishedYear!: number | null;

  @Field(() => Genre)
  genre!: Genre;
}
