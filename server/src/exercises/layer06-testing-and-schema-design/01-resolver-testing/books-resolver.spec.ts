import { Test, TestingModule } from '@nestjs/testing';
import { BooksResolver } from '../../layer01-basics/01-schema-and-types/books.resolver';
import { BooksService } from '../../layer01-basics/01-schema-and-types/books.service';
import { AuthorsLoader } from '../../layer01-basics/01-schema-and-types/authors.loader';
import {
  Book,
  Genre,
} from '../../layer01-basics/01-schema-and-types/books.model';
import { BookConnection } from '../../layer01-basics/01-schema-and-types/pagination.model';
import { PaginationInput } from '../../layer01-basics/01-schema-and-types/dto/pagination.input';
import { CreateBookInput } from '../../layer01-basics/01-schema-and-types/dto/create-book.input';
import { UpdateBookInput } from '../../layer01-basics/01-schema-and-types/dto/update-book.input';
import { Author } from '../../layer01-basics/01-schema-and-types/authors.model';

describe('BooksResolver', () => {
  let resolver: BooksResolver;
  let bookService: jest.Mocked<BooksService>;
  let authorsLoader: jest.Mocked<AuthorsLoader>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksResolver,
        {
          provide: BooksService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findWithPagination: jest.fn(),
          },
        },
        { provide: AuthorsLoader, useValue: { load: jest.fn() } },
      ],
    }).compile();

    resolver = module.get(BooksResolver);
    bookService = module.get(BooksService);
    authorsLoader = module.get(AuthorsLoader);
  });

  describe('books(Query)', () => {
    it('booksの一覧を返す', () => {
      const mockBooks: Book[] = [
        {
          id: '1',
          authorId: '1',
          title: 'Alice',
          publishedYear: 2026,
          genre: Genre.FICTION,
        },
        {
          id: '2',
          authorId: '1',
          title: 'Bob',
          publishedYear: 2026,
          genre: Genre.FICTION,
        },
      ];
      bookService.findAll.mockReturnValue(mockBooks);

      const result = resolver.findAll();

      expect(result).toEqual(mockBooks);
      expect(bookService.findAll).toHaveBeenCalledTimes(1);
    });
  });
  describe('book(Query)', () => {
    it('正常系', () => {
      const mockBook: Book = {
        id: '1',
        authorId: '1',
        title: 'Alice',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      bookService.findOne.mockReturnValue(mockBook);

      const result = resolver.findOne('1');

      expect(result).toEqual(mockBook);
      expect(bookService.findOne).toHaveBeenCalledTimes(1);
      expect(bookService.findOne).toHaveBeenCalledWith('1');
    });
    it('null', () => {
      bookService.findOne.mockReturnValue(null);

      const result = resolver.findOne('1');

      expect(result).toEqual(null);
      expect(bookService.findOne).toHaveBeenCalledTimes(1);
      expect(bookService.findOne).toHaveBeenCalledWith('1');
    });
  });
  describe('bookConnection(Query)', () => {
    it('正常系', () => {
      const mockBookConnection: BookConnection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
      bookService.findWithPagination.mockReturnValue(mockBookConnection);

      const paginationInput: PaginationInput = {
        first: 10,
      };
      const result = resolver.bookConnection(paginationInput);

      expect(result).toEqual(mockBookConnection);
      expect(bookService.findWithPagination).toHaveBeenCalledTimes(1);
      expect(bookService.findWithPagination).toHaveBeenCalledWith(
        paginationInput,
        undefined,
      );
    });
  });
  describe('createBook(Mutation)', () => {
    it('正常系', () => {
      const mockBook: Book = {
        id: '1',
        authorId: '1',
        title: 'Alice',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      bookService.create.mockReturnValue(mockBook);

      const createBookInput: CreateBookInput = {
        title: 'test',
        authorId: '1',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      const result = resolver.createBook(createBookInput);

      expect(result).toEqual(mockBook);
      expect(bookService.create).toHaveBeenCalledTimes(1);
      expect(bookService.create).toHaveBeenCalledWith(createBookInput);
    });
  });
  describe('updateBook(Mutation)', () => {
    it('正常系', () => {
      const mockBook: Book = {
        id: '1',
        authorId: '1',
        title: 'Alice',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      bookService.update.mockReturnValue(mockBook);

      const updateBookInput: UpdateBookInput = {
        title: 'test',
        authorId: '1',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      const result = resolver.updateBook('1', updateBookInput);

      expect(result).toEqual(mockBook);
      expect(bookService.update).toHaveBeenCalledTimes(1);
      expect(bookService.update).toHaveBeenCalledWith('1', updateBookInput);
    });
    it('異常系(null)', () => {
      bookService.update.mockReturnValue(null);

      const updateBookInput: UpdateBookInput = {
        title: 'test',
        authorId: '1',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      const result = resolver.updateBook('1', updateBookInput);

      expect(result).toEqual(null);
      expect(bookService.update).toHaveBeenCalledTimes(1);
      expect(bookService.update).toHaveBeenCalledWith('1', updateBookInput);
    });
  });
  describe('deleteBook(Mutation)', () => {
    it('正常系', () => {
      bookService.delete.mockReturnValue(true);

      const result = resolver.deleteBook('1');

      expect(result).toEqual(true);
      expect(bookService.delete).toHaveBeenCalledTimes(1);
      expect(bookService.delete).toHaveBeenCalledWith('1');
    });
  });
  describe('author(ResolveField)', () => {
    it('正常系', async () => {
      const mockBook: Book = {
        id: '1',
        authorId: '1',
        title: 'Alice',
        publishedYear: 2026,
        genre: Genre.FICTION,
      };
      const mockAuthor: Author = {
        id: '1',
        name: 'name',
        country: 'ja',
      };
      authorsLoader.load.mockResolvedValue(mockAuthor);

      const result = await resolver.author(mockBook);

      expect(result).toEqual(mockAuthor);
      expect(authorsLoader.load).toHaveBeenCalledTimes(1);
      expect(authorsLoader.load).toHaveBeenCalledWith(mockBook.authorId);
    });
  });
});
