import { Injectable } from '@nestjs/common';
import { BookV2 } from './book-v2.model';
import { Genre } from '@/exercises/layer01-basics/01-schema-and-types/books.model';

@Injectable()
export class SchemaDesignService {
  private items: BookV2[] = [
    {
      id: '1',
      title: 'test',
      authorId: 'a1',
      publishedYear: 2026,
      publishedDate: '2026-01-01',
      genre: Genre.FICTION,
    },
    {
      id: '2',
      title: 'test',
      authorId: 'a2',
      publishedYear: 2026,
      publishedDate: '2026-01-01',
      genre: Genre.HISTORY,
    },
    {
      id: '3',
      title: 'test',
      authorId: 'a3',
      publishedYear: 2026,
      publishedDate: '2026-01-01',
      genre: Genre.NON_FICTION,
    },
    {
      id: '4',
      title: 'test',
      authorId: 'a2',
      publishedYear: 2026,
      publishedDate: '2026-01-01',
      genre: Genre.SCIENCE,
    },
  ];

  findAll(): BookV2[] {
    return this.items;
  }

  findOne(id: string): BookV2 | null {
    return this.items.find((e) => e.id === id) ?? null;
  }
}
