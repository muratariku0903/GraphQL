# 演習4-1: エラーハンドリング

## 目的

GraphQLのエラーモデルはRESTとは根本的に異なる。RESTでは HTTPステータスコードでエラーの種別を表現するが、GraphQLでは **常にHTTP 200** が返り、レスポンスボディの `errors` 配列でエラーを伝える。

さらに、GraphQLには **部分エラー**（partial response）という独自の概念がある — 一部のフィールドはデータを返し、一部はエラーを返すことができる。

この演習では、GraphQLのエラーモデルを理解し、NestJS + Apollo Serverにおけるエラーハンドリングの実装パターンを学ぶ。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: GraphQLのエラーモデル — なぜHTTP 200なのか

RESTでは `404 Not Found` や `500 Internal Server Error` のようにHTTPステータスコードでエラーを表現する。一方、GraphQLではエラー時もHTTP 200が返る。

- この設計の理由を、GraphQLの「1リクエストで複数のリソースを取得できる」という特性と結びつけて説明せよ
- 部分エラー（partial response）とは何か。具体例を挙げて、なぜRESTでは実現しにくいかを説明せよ
- HTTP 200固定のデメリット（監視・ロギングの観点）についても考えよ

### Q2: errors配列 vs Union型Result パターン

GraphQLでエラーを扱う方法は大きく2つある：

**方法A: errors配列（Apollo Serverのデフォルト）**
```json
{
  "data": { "book": null },
  "errors": [
    {
      "message": "Book not found",
      "extensions": { "code": "NOT_FOUND" }
    }
  ]
}
```

**方法B: Union型Result パターン**
```graphql
union BookResult = Book | NotFoundError | ValidationError

type NotFoundError {
  message: String!
  resourceId: ID!
}
```

- それぞれのメリット・デメリットを、**クライアント側の型安全性**の観点で比較せよ
- Union型パターンはどのようなケースで特に有効か（ヒント: 「ビジネスエラー」と「システムエラー」の区別）
- 両者を併用する場合、どのように使い分けるべきか

### Q3: formatError と例外フィルター

Apollo Serverには `formatError` オプション、NestJSには例外フィルター（`ExceptionFilter`）がある。

- `formatError` の役割は何か。本番環境でなぜ必要なのか（ヒント: スタックトレース）
- NestJSの `HttpException`（`NotFoundException` 等）をGraphQLで使うと何が起こるか
- `formatError` と NestJSの例外フィルターの責務の違いを説明せよ

---

## 実装演習

### 前提

この演習では、既存の `BooksModule`（layer01-basics/01-schema-and-types）のコードを**直接変更せず**、新しいモジュール `ErrorHandlingModule` を作成して実装する。

既存のBookデータの操作（findOne等）は、この演習モジュール内で独自のServiceを用意すること。

### 課題1: formatError による統一エラーフォーマット

`AppModule` の `GraphQLModule.forRoot` に `formatError` を設定し、以下のフォーマットでエラーを返すようにせよ。

**要件:**
- `message`: エラーメッセージ（そのまま）
- `code`: エラーコード（`extensions.code` から取得、なければ `INTERNAL_SERVER_ERROR`）
- `timestamp`: エラー発生時刻（ISO 8601形式）
- 本番環境（`NODE_ENV=production`）ではスタックトレースを除去する
- 開発環境ではスタックトレースを含める

**期待するレスポンス:**
```json
{
  "errors": [
    {
      "message": "Book not found",
      "extensions": {
        "code": "NOT_FOUND",
        "timestamp": "2026-04-25T12:00:00.000Z"
      }
    }
  ]
}
```

### 課題2: ビジネスエラーのカスタム例外クラス

以下のカスタム例外クラスを作成せよ。

**`not-found.exception.ts`:**
- `NotFoundBusinessException` — リソースが見つからない場合
- コンストラクタ: `(resourceName: string, resourceId: string)`
- エラーコード: `NOT_FOUND`

**`validation.exception.ts`:**
- `ValidationBusinessException` — ビジネスルール違反
- コンストラクタ: `(message: string, field: string)`
- エラーコード: `BUSINESS_VALIDATION_ERROR`

これらは `GraphQLError` を継承すること（Apollo Server 4+の標準的な方法）。

### 課題3: Union型Result パターンの実装

`Book` の取得に対して、Union型を使ったResult パターンを実装せよ。

**型定義:**
```graphql
union BookResult = Book | BookNotFoundError | BookValidationError

type BookNotFoundError {
  message: String!
  bookId: ID!
}

type BookValidationError {
  message: String!
  field: String!
}
```

**Resolver:**
```graphql
type Query {
  # errors配列パターン（従来方式）
  bookOrThrow(id: ID!): Book

  # Union型パターン（Result型）
  bookResult(id: ID!): BookResult!
}
```

- `bookOrThrow` — 見つからない場合は `GraphQLError` をスローする
- `bookResult` — 見つからない場合は `BookNotFoundError` オブジェクトを返す

### 課題4: 部分エラーの体験

以下のクエリで **部分エラー** を体験できるようにせよ。

```graphql
type Query {
  # 複数IDでBookを取得（一部が見つからなくても他は返す）
  booksByIds(ids: [ID!]!): [BookResult!]!
}
```

**要件:**
- 存在するIDのBookはデータとして返す
- 存在しないIDは `BookNotFoundError` として返す
- 1つのクエリで「成功」と「エラー」が混在するレスポンスを確認する

### 課題5: 動作確認

サーバーを起動し、以下のシナリオを順に実行してログ・結果を確認してください。

```graphql
# 1. 正常系 — 存在するBookを取得
query {
  bookOrThrow(id: "1") {
    title
    genre
  }
}

# 2. errors配列パターン — 存在しないBookを取得
query {
  bookOrThrow(id: "999") {
    title
  }
}

# 3. Union型パターン — 存在するBook
query {
  bookResult(id: "1") {
    __typename
    ... on Book {
      title
      genre
    }
    ... on BookNotFoundError {
      message
      bookId
    }
  }
}

# 4. Union型パターン — 存在しないBook
query {
  bookResult(id: "999") {
    __typename
    ... on Book {
      title
    }
    ... on BookNotFoundError {
      message
      bookId
    }
  }
}

# 5. 部分エラー — 成功とエラーの混在
query {
  booksByIds(ids: ["1", "999", "2"]) {
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

# 6. formatErrorの確認 — スタックトレースが除去されているか
query {
  bookOrThrow(id: "not-exist") {
    title
  }
}
```

**確認ポイント:**
- `bookOrThrow` のエラーが `errors` 配列に入っているか
- `bookResult` のエラーが `data` 内にUnion型として返っているか
- `booksByIds` で成功とエラーが混在しているか
- `formatError` で `timestamp` が付与されているか
- `__typename` でクライアントがエラー型を判別できるか
- 結果を notes.md に記録すること

---

## 制約
- 既存の `BooksModule`（layer01）のコードは変更しないこと
- `GraphQLError`（Apollo Server 4+）を使うこと（`ApolloError` は非推奨）
- Union型のエラー型には `@ObjectType()` デコレーターを使うこと（通常のGraphQL型として定義）
- `__resolveType` の解決にはNestJSの `@ResolveField` ではなく、クラスの `__typename` プロパティを利用すること

---

## ヒント

### GraphQLError の使い方（Apollo Server 4+）
```ts
import { GraphQLError } from 'graphql';

throw new GraphQLError('Book not found', {
  extensions: {
    code: 'NOT_FOUND',
    bookId: id,
  },
});
```

### Union型の定義（NestJS Code First）
```ts
export const BookResult = createUnionType({
  name: 'BookResult',
  types: () => [Book, BookNotFoundError, BookValidationError] as const,
});
```

### Union型のResolver での返し方
```ts
@Query(() => BookResult)
bookResult(@Args('id', { type: () => ID }) id: string): typeof BookResult {
  const book = this.service.findOne(id);
  if (!book) {
    return new BookNotFoundError(id); // GraphQLErrorではなくオブジェクトを返す
  }
  return book;
}
```

### formatError の設定場所
```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  // ...
  formatError: (formattedError) => {
    // ここでエラーオブジェクトを加工して返す
    return {
      ...formattedError,
      extensions: {
        ...formattedError.extensions,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
```
