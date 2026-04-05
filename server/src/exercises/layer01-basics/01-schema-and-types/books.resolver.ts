import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { BooksService } from './books.service';
import { Book } from './books.model';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly service: BooksService) {}

  // ---------- Query ----------
  @Query(() => [Book], { name: 'books' })
  findAll(): Book[] {
    return this.service.findAll();
  }

  @Query(() => Book, { name: 'book', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string): Book | null {
    return this.service.findOne(id);
  }
}
