import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { AuthorService } from './authors.service';
import { Author } from './authors.model';

@Injectable({ scope: Scope.DEFAULT })
export class AuthorsLoader {
  private loader: DataLoader<string, Author | null>;

  constructor(private authorsService: AuthorService) {
    console.log('AuthorsLoader instance created');
    this.loader = new DataLoader<string, Author | null>(async (ids) => {
      const authors = this.authorsService.findByIds(ids);
      return ids.map(
        (id) =>
          authors.find((a) => a.id === id) ?? new Error(`Team ${id} not found`),
      );
    });
  }

  load(id: string): Promise<Author | null> {
    return this.loader.load(id);
  }
}
