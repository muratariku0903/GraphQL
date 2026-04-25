import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Book } from './books.model';

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field()
  hasPreviousPage!: boolean;

  @Field(() => String, { nullable: true })
  startCursor!: string | null;

  @Field(() => String, { nullable: true })
  endCursor!: string | null;
}

@ObjectType()
export class BookEdge {
  @Field()
  cursor!: string;

  @Field(() => Book)
  node!: Book;
}

@ObjectType()
export class BookConnection {
  @Field(() => [BookEdge])
  edges!: BookEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;

  @Field(() => Int)
  totalCount!: number;
}
