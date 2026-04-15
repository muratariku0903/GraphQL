# 演習2-3: ページネーションとフィルタリング

## 目的

Layer 1-1 で `books` クエリは全件を返していた。実際のアプリケーションでは数万〜数百万件のデータを一度に返すことはできないため、**ページネーション**と**フィルタリング**が必須になる。

GraphQLにおけるページネーションには主に2つのアプローチがある：
1. **Offset-based** — `offset` と `limit` で指定する（SQLの `OFFSET / LIMIT` に対応）
2. **Cursor-based（Connection パターン）** — Relay仕様の `first / after / last / before` で指定する

この演習では両方の仕組みを理解し、Cursor-basedのConnectionパターンを実装する。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: Offset-based vs Cursor-based ページネーション

REST APIでは `?page=2&per_page=20` のようなOffset-basedが一般的だが、GraphQLでは Cursor-basedが推奨される。

- Offset-basedの仕組みと、そのメリット・デメリットを述べよ（ヒント: データの追加・削除が起きた場合に何が起こるか）
- Cursor-basedの仕組みと、Offsetの問題をどう解決するか
- 「Cursor」とは何か — IDとの違い、opaque（不透明）であるべき理由

### Q2: Relay Connection仕様

GraphQLコミュニティでは、Cursor-basedページネーションの標準として **Relay Connection仕様** が広く採用されている。

以下の型構造を見て、各フィールドの役割を説明せよ：

```graphql
type BookConnection {
  edges: [BookEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type BookEdge {
  cursor: String!
  node: Book!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

- なぜ `Book` の配列ではなく `BookEdge` でラップするのか — Edgeに情報を持たせる意味
- `PageInfo` の各フィールドはクライアント側でどう使われるか
- `totalCount` はRelay仕様に含まれるか？含めるメリットとデメリット

### Q3: フィルタリングの設計

`books` クエリに「ジャンル」と「出版年」でフィルタリングできるようにしたい。

- フィルタ条件をどのようなInputTypeで定義するか（引数の構造を設計せよ）
- フィルタリングとページネーションを組み合わせる場合、`totalCount` は何に対するカウントか（全件？フィルタ後？）
- フィルタ条件が増えた場合のスケーラビリティ — 1つのInputTypeにフラットに並べるか、ネストするか

---

## 実装演習

### 課題1: Connection/Edge/PageInfo の型定義

以下のファイルを `server/src/exercises/layer01-basics/01-schema-and-types/` に作成してください。

**`pagination.model.ts`** — 汎用的なページネーション型

**要件:**
- `PageInfo` ObjectType（`hasNextPage`, `hasPreviousPage`, `startCursor`, `endCursor`）
- `BookEdge` ObjectType（`cursor: String`, `node: Book`）
- `BookConnection` ObjectType（`edges: [BookEdge]`, `pageInfo: PageInfo`, `totalCount: Int`）

### 課題2: PaginationInput / BookFilterInput の定義

**`dto/pagination.input.ts`** を作成してください。

**PaginationInput:**
- `first: Int`（取得件数、デフォルト10、最大50）
- `after: String`（カーソル、optional）

**BookFilterInput:**
- `genre: Genre`（optional）
- `publishedYearFrom: Int`（optional — この年以降）
- `publishedYearTo: Int`（optional — この年以前）

それぞれに class-validator によるバリデーションを追加すること。

### 課題3: BooksService にページネーション/フィルタリングロジックを追加

`BooksService` に以下のメソッドを追加してください。

```ts
findWithPagination(
  pagination: PaginationInput,
  filter?: BookFilterInput,
): BookConnection
```

**実装要件:**
- カーソルはBookの `id` をBase64エンコードしたものとする（`Buffer.from(id).toString('base64')`）
- `after` カーソルが指定された場合、そのカーソルが指すBookの**次**から取得する
- `filter` が指定された場合、条件に合致するBookのみを対象とする
- `totalCount` はフィルタ適用後の全件数とする
- `hasNextPage` は `first` で指定された件数より多くのデータが残っているかで判定
- `hasPreviousPage` は `after` カーソルが指定されているかで判定（簡易実装でOK）

### 課題4: BooksResolver にページネーション対応クエリを追加

既存の `books` クエリはそのまま残し、**新しいクエリ `bookConnection`** を追加してください。

```graphql
query {
  bookConnection(
    pagination: { first: 2 }
    filter: { genre: FICTION }
  ) {
    edges {
      cursor
      node {
        title
        author { name }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### 課題5: 動作確認

サーバーを起動し、以下のシナリオを順に実行してログ・結果を確認してください。

```graphql
# 1. 全件を2件ずつ取得（1ページ目）
query {
  bookConnection(pagination: { first: 2 }) {
    edges {
      cursor
      node { title }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}

# 2. 1の結果の endCursor を使って2ページ目を取得
query {
  bookConnection(pagination: { first: 2, after: "<endCursorの値>" }) {
    edges {
      cursor
      node { title }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}

# 3. ジャンルでフィルタ
query {
  bookConnection(
    pagination: { first: 10 }
    filter: { genre: FICTION }
  ) {
    edges {
      node { title genre }
    }
    totalCount
  }
}

# 4. DataLoaderとの組み合わせ — authorもN+1なく取れるか
query {
  bookConnection(pagination: { first: 10 }) {
    edges {
      node {
        title
        author { name }
      }
    }
  }
}
```

**確認ポイント:**
- 2ページ目で `hasNextPage: false` になるか（4件中、2件ずつなので）
- `totalCount` がフィルタを反映しているか
- DataLoaderのバッチログが1回だけか
- カーソルの値がBase64エンコードされた文字列か
- 結果を notes.md に記録すること

---

## 制約
- 既存の `books` クエリは削除しないこと（後方互換性）
- カーソルはopaque（クライアントが中身を解析しない前提）にすること
- `first` の最大値バリデーション（50件以上はエラー）を必ず入れること
- DataLoaderによるN+1解消は引き続き維持すること

---

## ヒント

### カーソルのエンコード/デコード
```ts
// エンコード
const cursor = Buffer.from(book.id).toString('base64');

// デコード
const id = Buffer.from(cursor, 'base64').toString('utf-8');
```

### フィルタリングの適用
```ts
let filtered = [...this.items];
if (filter?.genre !== undefined) {
  filtered = filtered.filter(b => b.genre === filter.genre);
}
if (filter?.publishedYearFrom !== undefined) {
  filtered = filtered.filter(b => b.publishedYear && b.publishedYear >= filter.publishedYearFrom);
}
```

### ページネーションの組み立て
```ts
// afterカーソルの位置を特定
const afterIndex = after
  ? filtered.findIndex(b => b.id === decodeCursor(after))
  : -1;

// afterの次から first 件取得（+1件多く取得してhasNextPageを判定）
const sliced = filtered.slice(afterIndex + 1, afterIndex + 1 + first + 1);
const hasNextPage = sliced.length > first;
const edges = sliced.slice(0, first).map(book => ({
  cursor: encodeCursor(book.id),
  node: book,
}));
```
