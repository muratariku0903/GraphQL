'use client';

import { Suspense } from 'react';
// import { useQuery, useMutation, gql } from '@urql/next';

// TODO: BooksQuery を gql テンプレートリテラルで定義してください
// - id, title, genre, author { id, name, country } を取得

// TODO: CreateBookMutation を定義してください

// TODO: BooksList コンポーネントを実装してください
// - useQuery で書籍一覧を取得
// - fetching / error のハンドリング
// - 書籍の情報を表示

// TODO: CreateBookForm コンポーネントを実装してください
// - useMutation で createBook を呼び出す
// - フォーム送信後、書籍一覧をリフレッシュ

export default function Page() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>書籍一覧（Client Component）</h1>
      <Suspense fallback={<p>Loading...</p>}>
        {/* TODO: BooksList と CreateBookForm をここに配置 */}
      </Suspense>
    </main>
  );
}
