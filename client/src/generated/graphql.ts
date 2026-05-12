/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type CreateBookInput = {
  authorId: string;
  genre: Genre;
  publishedYear?: number | null | undefined;
  title: string;
};

export type Genre =
  | 'FICTION'
  | 'HISTORY'
  | 'NON_FICTION'
  | 'SCIENCE'
  | 'TECHNOLOGY';

export type BookListQueryVariables = Exact<{ [key: string]: never; }>;


export type BookListQuery = { books: Array<{ id: string, title: string, genre: Genre, author: { id: string, name: string, country: string | null } }> };

export type CreateBookMutationVariables = Exact<{
  input: CreateBookInput;
}>;


export type CreateBookMutation = { createBook: { title: string, genre: Genre, author: { name: string } } };


export const BookListDocument = gql`
    query BookList {
  books {
    id
    title
    genre
    author {
      id
      name
      country
    }
  }
}
    `;

export function useBookListQuery(options?: Omit<Urql.UseQueryArgs<BookListQueryVariables>, 'query'>) {
  return Urql.useQuery<BookListQuery, BookListQueryVariables>({ query: BookListDocument, ...options });
};
export const CreateBookDocument = gql`
    mutation CreateBook($input: CreateBookInput!) {
  createBook(input: $input) {
    title
    genre
    author {
      name
    }
  }
}
    `;

export function useCreateBookMutation() {
  return Urql.useMutation<CreateBookMutation, CreateBookMutationVariables>(CreateBookDocument);
};