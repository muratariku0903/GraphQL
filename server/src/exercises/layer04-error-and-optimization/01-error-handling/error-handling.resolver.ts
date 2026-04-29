import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Book } from '../../layer01-basics/01-schema-and-types/books.model';
import { ErrorHandlingService } from './error-handling.service';
import { BookNotFoundError, BookResult } from './error-handling.model';
import { NotFoundBusinessException } from './exeption/not-found.exception';

@Resolver()
export class ErrorHandlingResolver {
  constructor(private readonly service: ErrorHandlingService) {}

  // TODO: 課題2〜4 で以下のクエリを実装する
  // - booksByIds(ids): [BookResult!]! — 部分エラー体験

  @Query(() => Book)
  bookOrThrow(@Args('id', { type: () => ID }) id: string): Book {
    const book = this.service.findOne(id);
    if (!book) {
      throw new NotFoundBusinessException('book', id);
    }

    return book;
  }

  @Query(() => BookResult)
  bookResult(@Args('id', { type: () => ID }) id: string): typeof BookResult {
    const book = this.service.findOne(id);
    if (!book) {
      return new BookNotFoundError('book not found', id);
    }

    return book;
  }

  @Query(() => [BookResult!]!)
  booksByIds(
    @Args('ids', { type: () => [ID] }) ids: string[],
  ): (typeof BookResult)[] {
    const books = this.service.findByIds(ids);

    return books.map((book, index) => {
      if (!book) {
        return new BookNotFoundError('book', ids[index]);
      }

      return book;
    });
  }
}
