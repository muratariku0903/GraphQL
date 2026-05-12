import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { BookV2 } from './book-v2.model';
import { SchemaDesignService } from './schema-design.service';

@Resolver(() => BookV2)
export class SchemaDesignResolver {
  constructor(private readonly bookService: SchemaDesignService) {}

  // ---------- Query ----------
  @Query(() => [BookV2], { name: 'booksV2' })
  findAll(): BookV2[] {
    return this.bookService.findAll();
  }

  @Query(() => BookV2, { name: 'bookV2', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string): BookV2 | null {
    return this.bookService.findOne(id);
  }
}
