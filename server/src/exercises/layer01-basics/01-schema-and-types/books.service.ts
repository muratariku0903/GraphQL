import { Injectable } from '@nestjs/common';
import { Book, Genre } from './books.model';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { BookFilterInput, PaginationInput } from './dto/pagination.input';
import { BookConnection } from './pagination.model';

@Injectable()
export class BooksService {
  private items: Book[] = [
    {
      id: '1',
      title: 'test',
      authorId: 'a1',
      publishedYear: 2026,
      genre: Genre.FICTION,
    },
    {
      id: '2',
      title: 'test',
      authorId: 'a2',
      publishedYear: 2026,
      genre: Genre.HISTORY,
    },
    {
      id: '3',
      title: 'test',
      authorId: 'a3',
      publishedYear: 2026,
      genre: Genre.NON_FICTION,
    },
    {
      id: '4',
      title: 'test',
      authorId: 'a2',
      publishedYear: 2026,
      genre: Genre.SCIENCE,
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
      authorId: input.authorId ?? target.authorId,
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

  findWithPagination(
    pagination: PaginationInput,
    filter?: BookFilterInput,
  ): BookConnection {
    let filtered = [...this.items];
    if (filter?.genre !== undefined) {
      filtered = filtered.filter((e) => e.genre === filter.genre);
    }
    if (filter?.publishedYearFrom !== undefined) {
      filtered = filtered.filter(
        (e) => e.publishedYear && e.publishedYear >= filter.publishedYearFrom!,
      );
    }
    if (filter?.publishedYearTo !== undefined) {
      filtered = filtered.filter(
        (e) => e.publishedYear && e.publishedYear <= filter.publishedYearTo!,
      );
    }

    const { first, after } = pagination;

    const afterIndex = after
      ? filtered.findIndex((b) => b.id === this.decodeCursor(after))
      : -1;

    const sliced = filtered.slice(afterIndex + 1, afterIndex + 1 + first + 1);
    const hasNextPage = sliced.length > first;
    const edges = sliced.slice(0, first).map((book) => ({
      cursor: this.encodeCursor(book.id),
      node: book,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: after !== undefined,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: filtered.length,
    };
  }

  private encodeCursor(id: string): string {
    return Buffer.from(id).toString('base64');
  }

  private decodeCursor(cursor: string | null): string {
    if (!cursor) return '1';

    return Buffer.from(cursor, 'base64').toString('utf-8');
  }
}
