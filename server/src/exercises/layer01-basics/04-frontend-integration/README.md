# 演習1-4: フロント統合 — Next.js + urql

## 目的

ここまでサーバー側（NestJS + Apollo Server）のGraphQL実装を学んできた。この演習では、実際に **Next.js + urql** を使ってフロントエンドからGraphQL APIを呼び出し、クライアント側の実装パターンを習得する。

実務でフロントエンド担当としてGraphQLを扱う上で必須の知識：
- urqlのセットアップと Exchange の仕組み
- `useQuery` / `useMutation` フックの使い方
- React Server Components (RSC) と Client Components での呼び出しの違い
- Mutation 後のキャッシュ更新戦略

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: urql の Exchange とは何か

urql のクライアント設定では `exchanges` 配列を渡す：

```ts
createClient({
  url: '...',
  exchanges: [cacheExchange, ssrExchange, fetchExchange],
});
```

- Exchange とは何か、Expressの middleware と対比して説明せよ
- `cacheExchange`, `fetchExchange`, `ssrExchange` の3つがそれぞれ何を担当するのか
- 配列の**順序**が重要な理由（例: `fetchExchange` を先頭に置くとどうなるか）

### Q2: RSC vs Client Component でのGraphQL呼び出し

Next.js 13+ の App Router では、データ取得を以下の2つの方法で行える：

**パターンA: Server Component（RSC）から呼び出す**
```tsx
// app/books/page.tsx
import { getClient } from '@/lib/urql';

export default async function BooksPage() {
  const result = await getClient().query(BooksQuery, {});
  return <BookList books={result.data.books} />;
}
```

**パターンB: Client Component から `useQuery` で呼び出す**
```tsx
// app/books/books-list.tsx
'use client';
import { useQuery } from '@urql/next';

export function BooksList() {
  const [result] = useQuery({ query: BooksQuery });
  return <ul>{result.data?.books.map(...)}</ul>;
}
```

以下の観点で比較せよ：
- **データフェッチのタイミング**: それぞれいつデータを取得するか
- **初回ロードのUX**: ユーザーが最初にページを開いたときの体感差
- **インタラクティブ性**: ユーザー操作に応じた再取得やリアルタイム更新が必要な場合はどちらが向くか
- **SEO**: 検索エンジンのクローラーから見たときの違い

そして、**書籍一覧ページ**と**検索フィルタ付き書籍一覧ページ**でそれぞれどちらを選ぶべきか、判断基準を述べよ。

### Q3: Mutation後のキャッシュ更新戦略

urql は正規化キャッシュ（`cacheExchange`）を持っており、`__typename` + `id` でエンティティを管理する。
書籍を新規作成した後、書籍一覧の表示を最新化したい場合、以下の3つの戦略がある：

**戦略1: 自動更新に任せる**
Mutation のレスポンスに書籍オブジェクトを含める。urql が自動で該当エンティティのキャッシュを更新する。

**戦略2: 手動で refetch する**
Mutation 成功後、書籍一覧のQueryを再実行する。

**戦略3: `cache.updateQuery` で手動キャッシュ操作**
Mutationの `update` オプション等を使い、キャッシュ内の書籍一覧に新規書籍を直接追加する。

それぞれのメリット・デメリットを比較し、以下のケースでどの戦略が適切か述べよ：
- **書籍の編集（title を変更）**
- **書籍の新規追加**
- **書籍の削除**

特に「新規追加」と「削除」が、なぜ「編集」より難しいのかを説明すること。

---

## 実装演習

### 前提
- サーバー（`cd server && npm run start:dev`）がポート3002で起動していること
- 演習1-1〜1-3 で実装した書籍管理APIが動作していること

### 課題1: urql クライアントのセットアップ確認

`client/src/lib/urql.ts` と `client/src/lib/urql-provider.tsx` の内容を読み、以下の点を理解してください：

- `cacheExchange`, `ssrExchange`, `fetchExchange` がどう並んでいるか
- `UrqlProvider` が `layout.tsx` でどう使われているか
- RSC用の `getClient` と Client Component用の `useQuery` の違い

### 課題2: 書籍一覧ページ（Client Component）

`client/src/app/exercises/layer01/04-frontend-integration/client/page.tsx` に、Client Componentで書籍一覧を表示するページを実装してください。

**要件:**
- `'use client'` ディレクティブを付ける
- `@urql/next` の `useQuery` フックを使用
- 書籍の `id`, `title`, `genre`, `author { id, name, country }` を取得して表示
- ローディング中（`result.fetching`）とエラー（`result.error`）のハンドリングを行う
- `Suspense` で囲む構成にする（RSCから呼ぶlayout側）

### 課題3: 書籍一覧ページ（Server Component / RSC）

`client/src/app/exercises/layer01/04-frontend-integration/server/page.tsx` に、Server Componentで書籍一覧を表示するページを実装してください。

**要件:**
- `'use client'` を**付けない**（デフォルトのServer Component）
- `client/src/lib/urql.ts` の `getClient` を使う
- `async` 関数として `await getClient().query(...)` でデータを取得
- 書籍の同じフィールドを表示
- 取得したデータは単純にJSXで描画するだけでOK

### 課題4: 書籍追加フォーム（useMutation）

`client/src/app/exercises/layer01/04-frontend-integration/client/page.tsx` の書籍一覧ページに、書籍追加フォームを追加してください。

**要件:**
- `@urql/next` の `useMutation` フックを使う
- フォームには title, author（選択式でもテキスト入力でもOK）, genre, publishedYear を含める
- Mutation 成功後、書籍一覧が自動的に更新されることを確認する
  - urql の正規化キャッシュが効いていれば、`createBook` のレスポンスに `books` クエリでキャッシュされているものと同じ `__typename: "Book"` が含まれる
  - ただし **リストへの追加は自動では反映されない** ことに注意（Q3で学んだ理論を実地で確認）
  - 必要に応じて手動リフレッシュを実装する（`reexecuteQuery({ requestPolicy: 'network-only' })` など）

### 課題5: 動作確認と観察

以下の動作を確認し、notes.md に記録してください：

1. **Client Component版ページ** と **Server Component版ページ** を両方開き、ブラウザのDevToolsのNetworkタブで通信の違いを観察する
   - Server Component版ではブラウザから `/graphql` へのリクエストが発生しない（サーバー側で完結）
   - Client Component版ではブラウザから `/graphql` へPOSTリクエストが飛ぶ
2. 書籍追加フォームから書籍を追加し、一覧が更新されるかを観察
3. 書籍の編集機能も実装して、編集後のキャッシュ自動更新を確認する（任意）

---

## 制約
- GraphQL Code Generator は使わない（手書きで `gql` テンプレートリテラルを書く）
  - Code Generatorは Layer 6 で扱う
- Tailwind や Chakra UI 等のUIライブラリは使わない（素のJSX + インラインスタイル で十分）
- ルーティングは App Router を使用（Pages Router は使わない）

---

## ヒント

### gql テンプレートリテラル
```ts
import { gql } from '@urql/next';

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
```

### useQuery の基本形
```tsx
const [result, reexecuteQuery] = useQuery({ query: BooksQuery });

if (result.fetching) return <p>Loading...</p>;
if (result.error) return <p>Error: {result.error.message}</p>;

return <ul>{result.data.books.map(b => <li key={b.id}>{b.title}</li>)}</ul>;
```

### useMutation の基本形
```tsx
const [createResult, createBook] = useMutation(CreateBookMutation);

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await createBook({
    input: { title, author, genre, publishedYear }
  });
  if (result.error) {
    console.error(result.error);
  }
};
```

### Server Component での呼び出し
```tsx
import { getClient } from '@/lib/urql';
import { gql } from '@urql/core';

const BooksQuery = gql`query { books { id title } }`;

export default async function Page() {
  const result = await getClient().query(BooksQuery, {});
  return <div>{/* JSX */}</div>;
}
```

### 手動リフレッシュ
```tsx
const [result, reexecute] = useQuery({ query: BooksQuery });

// Mutation後:
reexecute({ requestPolicy: 'network-only' });
```

---

## 参考資料
- urql公式: https://urql.dev/
- @urql/next 公式: https://github.com/urql-graphql/urql/tree/main/packages/next-urql
- Next.js App Router: https://nextjs.org/docs/app
