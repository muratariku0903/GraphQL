import { Injectable } from '@nestjs/common';
import { Book, Genre } from '../../layer01-basics/01-schema-and-types/books.model';

@Injectable()
export class PerformanceService {
  private items: Book[] = [
    {
      id: '1',
      title: 'GraphQL in Action',
      authorId: 'a1',
      publishedYear: 2021,
      genre: Genre.TECHNOLOGY,
    },
    {
      id: '2',
      title: 'The Great Gatsby',
      authorId: 'a2',
      publishedYear: 1925,
      genre: Genre.FICTION,
    },
    {
      id: '3',
      title: 'Clean Code',
      authorId: 'a3',
      publishedYear: 2008,
      genre: Genre.TECHNOLOGY,
    },
  ];

  findAll(): Book[] {
    return this.items;
  }
}
