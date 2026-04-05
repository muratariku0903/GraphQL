import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { BooksService } from './books.service';
import { Book } from './books.model';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';

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

  // ---------- Mutation ----------
  @Mutation(() => Book)
  createBook(
    @Args('input', { type: () => CreateBookInput }) input: CreateBookInput,
  ): Book {
    return this.service.create(input);
  }

  @Mutation(() => Book, { nullable: true })
  updateBook(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateBookInput }) input: UpdateBookInput,
  ): Book | null {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBook(@Args('id', { type: () => ID }) id: string): boolean {
    return this.service.delete(id);
  }
}
