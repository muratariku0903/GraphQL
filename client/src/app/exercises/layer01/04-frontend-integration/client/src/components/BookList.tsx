"use client";

import { gql } from "@urql/next";
import { useBookListQuery } from "@/generated/graphql";

gql`
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

export const BookList = () => {
  const [result] = useBookListQuery();
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
