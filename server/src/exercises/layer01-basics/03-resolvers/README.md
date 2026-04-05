# 演習1-3: Resolver の仕組み

## 目的

演習1-1・1-2ではシンプルなQuery/Mutationを実装した。この演習では **`@ResolveField`（フィールドリゾルバー）** を学び、GraphQLの最大の強みである「クライアントが必要なデータだけを柔軟に組み合わせて取得できる仕組み」を理解する。
また、フィールドリゾルバーに伴う **N+1問題** の存在を体感し、なぜこれがGraphQLの代表的な課題と言われるのかを実感する。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: REST Controller と GraphQL Resolver の違い

REST APIでは `/books/1` にGETリクエストを送ると、Controllerが **1つのレスポンスオブジェクト全体** を組み立てて返す。

一方、GraphQLでは `book(id: "1") { title author { name } }` のようにクエリを書くと、`book` のResolverが呼ばれた後、**ネストした `author` フィールドの解決は別のResolverが担当する**。

- この「フィールドごとにResolverを分ける」設計が、なぜGraphQLに必要なのか
- REST Controllerの場合、リレーション先のデータ（例: 書籍の著者情報）をどう返すか。その方式の課題は何か
- GraphQLのフィールドリゾルバーがその課題をどう解決するか

この3点を説明せよ。

### Q2: N+1問題

以下のGraphQLクエリを実行するとき、サーバー内部でどのような処理が起きるか考えよ。

```graphql
query {
  books {       # → BooksResolver.findAll() で10冊取得
    title
    author {    # → 各bookに対して AuthorResolver が呼ばれる
      name
    }
  }
}
```

- 書籍が10冊あった場合、DBへのクエリは合計何回発行されるか
- なぜこれが「N+1問題」と呼ばれるのか（1とNはそれぞれ何を指すか）
- REST APIでは同様の問題はどう対処するか（JOIN, eager loading 等）
- GraphQLではなぜRESTと同じアプローチが取りにくいのか

### Q3: @ResolveField の実行タイミング

以下の2つのクエリを実行した場合、`@ResolveField` で定義した `author` のResolverは呼ばれるかどうか、それぞれ答えよ。

```graphql
# クエリA: authorフィールドを要求している
query {
  book(id: "1") {
    title
    author { name }
  }
}

# クエリB: authorフィールドを要求していない
query {
  book(id: "1") {
    title
    genre
  }
}
```

この挙動から、`@ResolveField` が **遅延解決（Lazy Resolution）** と呼ばれる理由を説明せよ。
また、RESTの `/books/1` エンドポイントで同じ効率を実現しようとしたらどうなるか考えよ。

---

## 実装演習

演習1-1・1-2のBooksModuleに **Author（著者）** の概念を追加し、`@ResolveField` によるリレーション解決を実装する。

### 課題1: Author型とデータの追加

以下の仕様で `Author` 型を定義してください。

**Author フィールド:**
- `id`: ID型（必須）
- `name`: String型（必須）
- `country`: String型（任意）

**Book型の変更:**
- 既存の `author: String` フィールドを `authorId: String`（内部用、GraphQLには公開しない）に変更
- 新たに `author: Author` フィールドを `@ResolveField` で解決するようにする

**要件:**
- `AuthorsService` を新規作成し、インメモリでAuthorデータを管理する
- サンプルデータとして3名程度の著者を用意する
- Book のサンプルデータの `author` を `authorId` に変更し、著者のIDを格納する

### 課題2: @ResolveField の実装

`BooksResolver` に `@ResolveField` を追加し、Book の `author` フィールドを解決してください。

**要件:**
- `@ResolveField(() => Author)` と `@Parent()` デコレーターを使うこと
- `@Parent()` で親の `Book` オブジェクトを受け取り、`authorId` を使って `AuthorsService` から著者を取得する
- GraphQL Playgroundで以下のクエリを実行し、ネストしたデータが取得できることを確認：

```graphql
# 書籍と著者情報をまとめて取得
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

# 特定の書籍の著者だけ取得
query {
  book(id: "1") {
    title
    author {
      name
    }
  }
}

# authorフィールドを要求しない（ResolveFieldが呼ばれないことを確認）
query {
  books {
    id
    title
  }
}
```

### 課題3: N+1問題を観察する

`AuthorsService` の `findOne` メソッドに `console.log` を仕込み、以下のクエリを実行したときにログが何回出力されるか確認してください。

```graphql
query {
  books {
    title
    author {
      name
    }
  }
}
```

**観察ポイント:**
- 書籍が3冊ある場合、`AuthorsService.findOne` は何回呼ばれるか
- 同じ著者の書籍が複数あった場合、同じ著者の取得が重複して行われるか
- この結果を notes.md に記録すること

> **注意**: N+1問題の**解決策（DataLoader）**はLayer 2で扱います。この演習では問題の存在を認識するだけでOKです。

---

## 制約
- `Book` の `authorId` はGraphQLスキーマに公開しないこと（内部用フィールド）
- `@ResolveField` を使わずに、Service内でJOIN的にデータを結合する実装にしないこと（あえてフィールドリゾルバーを使う）
- DataLoaderは使わないこと（この演習ではN+1問題を観察するのが目的）

---

## ヒント
- `@ResolveField(() => Author)` でフィールドの戻り値型を指定する
- `@Parent() book: Book` で親オブジェクトを取得できる
- GraphQLスキーマに公開しないフィールドは、`@Field()` を付けなければ公開されない
- `@HideField()` デコレーターを使う方法もある（`@nestjs/graphql` からインポート）
