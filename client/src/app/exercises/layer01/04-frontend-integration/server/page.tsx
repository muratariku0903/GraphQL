import { getClient } from "@/lib/urql";
import { gql } from "@urql/core";
import { BooksQueryResult } from "../client/src/components/BookList";

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

export default async function Page() {
  const client = getClient();
  const result = await client.query<BooksQueryResult>(BooksQuery, {}).toPromise();

  if (result.error) return <p>Error</p>;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>書籍一覧（Server Component）</h1>
      <ul>
        {result.data?.books.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </main>
  );
}
