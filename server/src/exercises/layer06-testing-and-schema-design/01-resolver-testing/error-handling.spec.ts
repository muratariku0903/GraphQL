import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Error Handling GraphQL Integration', () => {
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

  describe('bookOrThrow', () => {
    it('throws NOT_FOUND error for non-existent id', async () => {
      const query = `
          query {
            bookOrThrow(id: "999") {
              id
              title
            }
          }
        `;
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].extensions.code).toBe('NOT_FOUND');
      expect(res.body.data).toBeNull();
    });
    it('returns book for existing id', async () => {
      const query = `
          query {
            bookOrThrow(id: "1") {
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
      expect(res.body.data.bookOrThrow).toBeTruthy();
    });
  });

  describe('bookResult', () => {
    it('returns BookNotFoundError __typename for non-existent id', async () => {
      const query = `
          query {
            bookResult(id: "999") {
              __typename
              ... on Book {
                id
                title
              }
              ... on BookNotFoundError {
                message
                bookId
              }
            }
          }
        `;
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.bookResult.__typename).toBe('BookNotFoundError');
    });
    it('returns Book __typename for existing id', async () => {
      const query = `
          query {
            bookResult(id: "1") {
              __typename
              ... on Book {
                id
                title
              }
              ... on BookNotFoundError {
                message
                bookId
              }
            }
          }
        `;
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.bookResult.__typename).toBe('Book');
    });
  });

  describe('booksByIds', () => {
    it('returns mixed results for partially existing ids', async () => {
      const query = `
              query {
      booksByIds(ids: ["1", "999", "2"]) {
        __typename
        ... on Book { id title }
        ... on BookNotFoundError { message bookId }
      }
    }
        `;
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.booksByIds[0].__typename).toBe('Book');
      expect(res.body.data.booksByIds[1].__typename).toBe('BookNotFoundError');
      expect(res.body.data.booksByIds[2].__typename).toBe('Book');
    });
  });
});
