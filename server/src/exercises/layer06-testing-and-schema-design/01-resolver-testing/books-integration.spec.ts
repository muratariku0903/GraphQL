import { Genre } from '@/exercises/layer01-basics/01-schema-and-types/books.model';
import { AppModule } from '../../../app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Books GraphQL Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return all books', async () => {
    const query = `
      query {
        books {
          id
          title
          genre
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.data.books).toBeDefined();
    expect(response.body.errors).toBeUndefined();
  });

  it('should return a book by id', async () => {
    const query = `
    query {
      book(id: "1") {
        id
        title
      }
    }
  `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.book).toEqual(expect.objectContaining({ id: '1' }));
  });

  it('should return null for non-existent book', async () => {
    const query = `query { book(id: "non-existent-999") { id title } }`;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.book).toBeNull();
  });

  it('should create a book and verify it via query', async () => {
    // Mutation
    const createRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        mutation CreateBook($input: CreateBookInput!) {
          createBook(input: $input) {
            id
            title
          }
        }
      `,
        variables: {
          input: {
            title: 'Integration Test Book',
            authorId: 'a4',
            genre: 'FICTION',
          },
        },
      });

    expect(createRes.body.errors).toBeUndefined();
    const createdId = createRes.body.data.createBook.id;

    // 副作用確認 — Queryで取得
    const queryRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { book(id: "${createdId}") { id title } }`,
      });

    expect(queryRes.body.errors).toBeUndefined();
    expect(queryRes.body.data.book.title).toBe('Integration Test Book');
  });
});
