import { Book } from '@/exercises/layer01-basics/01-schema-and-types/books.model';
import { createUnionType, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BookNotFoundError {
  @Field()
  message!: string;

  @Field()
  bookId!: string;

  constructor(message: string, bookId: string) {
    this.message = message;
    this.bookId = bookId;
  }
}

@ObjectType()
export class BookValidationError {
  @Field()
  message!: string;

  @Field()
  field!: string;

  constructor(message: string, field: string) {
    this.message = message;
    this.field = field;
  }
}

export const BookResult = createUnionType({
  name: 'BookResult',
  types: () => [Book, BookNotFoundError, BookValidationError] as const,
  resolveType(value) {
    if (value instanceof BookNotFoundError) return BookNotFoundError;
    if (value instanceof BookValidationError) return BookValidationError;
    return Book;
  },
});
