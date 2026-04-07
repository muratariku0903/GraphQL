import { Suspense } from "react";
import { CreateBookForm } from "./src/components/CreateBookForm";
import { BookList } from "./src/components/BookList";

export default function Page() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>書籍一覧（Client Component）</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <CreateBookForm />
        <BookList />
      </Suspense>
    </main>
  );
}
