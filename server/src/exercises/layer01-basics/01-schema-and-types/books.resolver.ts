import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BooksService } from './books.service';
import { Book } from './books.model';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { Author } from './authors.model';
import { AuthorsLoader } from './authors.loader';
import { BookFilterInput, PaginationInput } from './dto/pagination.input';
import { BookConnection } from './pagination.model';

@Resolver(() => Book)
export class BooksResolver {
  constructor(
    private readonly bookService: BooksService,
    private readonly authorsLoader: AuthorsLoader,
  ) {}

  // ---------- Query ----------
  @Query(() => [Book], { name: 'books' })
  findAll(): Book[] {
    return this.bookService.findAll();
  }

  @Query(() => Book, { name: 'book', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string): Book | null {
    return this.bookService.findOne(id);
  }

  @Query(() => BookConnection, { name: 'bookConnection' })
  bookConnection(
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
    @Args('filter', { type: () => BookFilterInput, nullable: true })
    filter?: BookFilterInput,
  ): BookConnection {
    return this.bookService.findWithPagination(pagination, filter);
  }

  // ---------- Mutation ----------
  @Mutation(() => Book)
  createBook(
    @Args('input', { type: () => CreateBookInput }) input: CreateBookInput,
  ): Book {
    return this.bookService.create(input);
  }

  @Mutation(() => Book, { nullable: true })
  updateBook(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateBookInput }) input: UpdateBookInput,
  ): Book | null {
    return this.bookService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBook(@Args('id', { type: () => ID }) id: string): boolean {
    return this.bookService.delete(id);
  }

  // ---------- ResolveField ----------
  @ResolveField(() => Author)
  async author(@Parent() book: Book): Promise<Author | null> {
    return this.authorsLoader.load(book.authorId);
  }
}
