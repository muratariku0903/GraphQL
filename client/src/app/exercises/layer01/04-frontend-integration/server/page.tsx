// TODO: Server Component (RSC) での書籍一覧表示を実装してください
// - 'use client' は付けない
// - @/lib/urql から getClient をインポート
// - @urql/core から gql をインポート
// - async 関数として await getClient().query(...) でデータ取得

// import { getClient } from '@/lib/urql';
// import { gql } from '@urql/core';

// const BooksQuery = gql`...`;

export default async function Page() {
  // TODO: getClient().query() で書籍一覧を取得

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>書籍一覧（Server Component）</h1>
      {/* TODO: 取得したデータを描画 */}
    </main>
  );
}
