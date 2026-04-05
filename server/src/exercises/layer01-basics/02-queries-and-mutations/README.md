# 演習1-2: Query と Mutation

## 目的

演習1-1ではQueryによるデータ取得を体験した。この演習では **Mutation（データの変更操作）** を追加し、GraphQLにおけるCRUD操作の全体像を理解する。
また、**InputType** を使ったデータ入力の型定義を実践し、Q1で学んだ「ObjectとInputの分離」を実装レベルで体験する。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: なぜ Query と Mutation を区別するのか

GraphQLでは技術的にはQueryでもデータの書き込みは可能です（Resolverの中でDBに書けば良い）。
にもかかわらず、なぜ仕様としてQueryとMutationを明確に分けているのでしょうか。

以下の観点を踏まえて説明せよ：
- **実行の意味論（セマンティクス）**: クライアントやキャッシュ層がQuery/Mutationをどう扱うか
- **並列実行 vs 直列実行**: GraphQLの仕様ではQueryのフィールドは並列実行可能だが、Mutationのフィールドは直列実行される。なぜこの違いがあるのか
- **キャッシュへの影響**: urqlやApollo Clientのようなクライアントライブラリは、Query結果をキャッシュするが、Mutation後にどうするか

### Q2: InputType の設計原則

演習1-1のQ1で「ObjectとInputの分離」について学んだ。ここではさらに実践的な設計判断について考える。

書籍の作成（Create）と更新（Update）で、以下のどちらの設計が良いか、理由とともに述べよ：

**パターンA: 共通のInputType**
```graphql
input BookInput {
  title: String!
  author: String!
  publishedYear: Int
  genre: Genre!
}
```

**パターンB: 操作ごとに分離したInputType**
```graphql
input CreateBookInput {
  title: String!
  author: String!
  publishedYear: Int
  genre: Genre!
}

input UpdateBookInput {
  title: String
  author: String
  publishedYear: Int
  genre: Genre
}
```

特に「Updateで全フィールドを必須にすると何が困るか」を考えること。

### Q3: Mutationのレスポンス設計

Mutationのレスポンスとして何を返すべきか。以下の3パターンを比較し、それぞれのメリット・デメリットを述べよ：

- **パターン1**: `Boolean`（成功/失敗のみ）
- **パターン2**: 変更後のオブジェクトそのもの（例: `Book`）
- **パターン3**: 専用のレスポンス型（例: `DeleteBookResult { success: Boolean!, deletedId: ID! }`）

---

## 実装演習

演習1-1で作成した書籍管理APIに、Mutation（作成・更新・削除）を追加してください。

### 課題1: InputType の定義

以下の2つのInputTypeを定義してください。

**CreateBookInput:**
- `title`: String（必須）
- `author`: String（必須）
- `publishedYear`: Int（任意）
- `genre`: Genre（必須）

**UpdateBookInput:**
- `title`: String（任意）
- `author`: String（任意）
- `publishedYear`: Int（任意）
- `genre`: Genre（任意）

**要件:**
- `@InputType()` デコレーターを使うこと
- UpdateBookInputは**部分更新（Partial Update）** に対応すること — 渡されたフィールドのみ更新、渡されなかったフィールドは変更しない
- `class-validator` によるバリデーションは今回は不要（Layer 2で扱う）

### 課題2: Mutation の実装

以下の3つのMutationを実装してください。

- `createBook(input: CreateBookInput!): Book!` — 書籍を新規作成して返す
- `updateBook(id: ID!, input: UpdateBookInput!): Book` — 書籍を更新して返す（存在しない場合はnull）
- `deleteBook(id: ID!): Boolean!` — 書籍を削除し、成功/失敗を返す

**要件:**
- `id` はService側で自動採番すること（UUIDやインクリメント）
- Resolver / Service の責務分離を維持すること
- GraphQL Playgroundで以下の操作を順番に実行し、動作を確認すること：

```graphql
# 1. 書籍を作成
mutation {
  createBook(input: {
    title: "GraphQL入門"
    author: "田中太郎"
    publishedYear: 2025
    genre: TECHNOLOGY
  }) {
    id
    title
    author
    genre
  }
}

# 2. 作成した書籍を確認
query {
  books {
    id
    title
  }
}

# 3. 書籍を部分更新（タイトルのみ変更）
mutation {
  updateBook(id: "作成されたID", input: {
    title: "GraphQL実践ガイド"
  }) {
    id
    title
    author
  }
}

# 4. 書籍を削除
mutation {
  deleteBook(id: "作成されたID")
}

# 5. 削除されたことを確認
query {
  books {
    id
    title
  }
}
```

**観察ポイント:**
- `updateBook` で `title` だけ渡したとき、`author` や `genre` はどうなるか確認すること
- `createBook` のレスポンスで `id` が返ってくることを確認し、「サーバーが生成したフィールドをすぐ取得できる」GraphQLの利点を実感すること
- 存在しないIDで `updateBook` / `deleteBook` を実行したらどうなるか試すこと

---

## 制約
- 演習1-1の `books.model.ts`（Book型, Genre Enum）はそのまま再利用すること
- InputType の定義は新しいファイル（`dto/` ディレクトリ）に分離すること
- Resolverにデータ操作ロジックを直接書かないこと

---

## ヒント
- `@InputType()` は `@ObjectType()` と似ているが、GraphQLの入力型として登録される
- `@Mutation(() => Book)` でMutationの戻り値型を指定する
- `@Args('input')` でInputTypeの引数を受け取る
- 部分更新は `Object.assign()` や spread構文（`{ ...existing, ...input }`）で実装できる
- `nullable: true` のフィールドで「値が渡されなかった」と「nullが渡された」の区別が必要な場合は注意が必要（今回は単純に上書きでOK）
