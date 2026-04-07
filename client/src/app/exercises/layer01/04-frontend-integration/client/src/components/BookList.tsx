"use client";

import { useQuery, gql } from "@urql/next";

export enum Genre {
  FICTION = "FICTION",
  NON_FICTION = "NON_FICTION",
  SCIENCE = "SCIENCE",
  TECHNOLOGY = "TECHNOLOGY",
  HISTORY = "HISTORY",
}

export interface BooksQueryResult {
  books: {
    id: string;
    title: string;
    genre: Genre;
    author: {
      id: string;
      name: string;
      country: string;
    };
  }[];
}

const BooksQuery = gql`
  query {
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

export const BookList = () => {
  const [result] = useQuery<BooksQueryResult>({ query: BooksQuery });
  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.books.map((book) => (
        <li key={book.id}>
          {book.title}（種別: {book.genre} 著者: {book.author.name}）
        </li>
      ))}
    </ul>
  );
};
