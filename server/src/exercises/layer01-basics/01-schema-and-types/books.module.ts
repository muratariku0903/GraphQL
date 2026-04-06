import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { AuthorService } from './authors.service';

@Module({
  providers: [BooksResolver, BooksService, AuthorService],
})
export class BooksModule {}
