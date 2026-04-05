import { Injectable } from '@nestjs/common';
import { Book, Genre } from './books.model';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';

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

  create(input: CreateBookInput): Book {
    const last =
      this.items.length > 0 ? Number(this.items[this.items.length - 1]?.id) : 0;
    const item: Book = {
      id: String(last + 1),
      ...input,
    };
    this.items.push(item);

    return item;
  }

  update(id: string, input: UpdateBookInput): Book | null {
    const target = this.items.find((e) => e.id === id);
    if (!target) return null;
    const updated: Book = {
      ...target,
      title: input.title ?? target.title,
      author: input.author ?? target.author,
      publishedYear:
        input.publishedYear !== undefined
          ? input.publishedYear
          : target.publishedYear,
      genre: input.genre ?? target.genre,
    };

    this.items = this.items.map((e) => (e.id === id ? updated : e));

    return updated;
  }

  delete(id: string): boolean {
    const target = this.items.find((e) => e.id === id);
    if (!target) return false;

    this.items = this.items.filter((e) => e.id !== id);

    return true;
  }
}
