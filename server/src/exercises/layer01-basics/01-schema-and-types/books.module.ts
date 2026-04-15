import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { AuthorService } from './authors.service';
import { AuthorsLoader } from './authors.loader';

@Module({
  providers: [BooksResolver, BooksService, AuthorService, AuthorsLoader],
})
export class BooksModule {}
