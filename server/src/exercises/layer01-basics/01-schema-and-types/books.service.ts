import { Injectable } from '@nestjs/common';
import { Book, Genre } from './books.model';

@Injectable()
export class BooksService {
  private items: Book[] = [
    {
      id: '1',
      title: 'test',
      author: 'test',
      publishedYear: 2026,
      genre: Genre.FICTION,
    },
    {
      id: '2',
      title: 'test',
      author: 'test',
      publishedYear: 2026,
      genre: Genre.HISTORY,
    },
    {
      id: '3',
      title: 'test',
      author: 'test',
      publishedYear: 2026,
      genre: Genre.NON_FICTION,
    },
  ];

  findAll(): Book[] {
    return this.items;
  }

  findOne(id: string): Book | null {
    return this.items.find((e) => e.id === id) ?? null;
  }
}
