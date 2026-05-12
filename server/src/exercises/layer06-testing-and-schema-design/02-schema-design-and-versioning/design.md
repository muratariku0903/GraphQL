# 演習6-2: スキーマ設計とバージョニング — 設計メモ

（実装演習の設計メモをここに記録してください）

## 課題2: スキーマ設計の改善

### 改善前（アンチパターン）

まずパターン1では、まずクエリの名前は名詞中心にする必要があります。なので動詞が入っているのはおかしいです。getbooksだったりfetchbook.idとか。\n\nbooksとbookだけでいいと思います。

パターン2では命名規則がキャメルだったりスネークだったりするので、基本的にはキャメルでいいと思います。キャメルに揃えましょう。

パターン3は、クリエイトミューテーションなのに、全てのフィールドがヌル選ぶるになっちゃっているので、普通ノンヌルです。ノンヌルに全部統一しましょう。

パターン4では、BookIDにストリングが渡っています。ただこれはストリングではなくて、おそらくBookID専用のIDという型があるはずなので、それを参照します。

パターン5ではメタデータっていうのがストリングで返ってきていて、中にJSON文字列が入るって言ってるんですけど、これだとクライアントがどういったデータが入ってくるのかっていうのを識別できないんで、必ずバグが発生します。\n\nメタデータにはどういうデータが入っているのかっていうのを分かるような型っていうのを定義して、それをセットするようにしましょう。

### 改善後

```graphql
type Query {
  books: [Book!]
  book(bookId: ID!): Book!

  authors: [Author!]
  author(id: ID!): Author!
}

type Mutation {
  createBook(input: CreateBookInput!): Book!
  updateBook(id: ID!, input: UpdateBookInput!): Book!
  deleteBook(id: ID!): Boolean!
}

input CreateBookInput {
  title: String!
  authorId: ID!
  genre: Genre!
}

input UpdateBookInput {
  title: String
  authorId: ID
  genre: Genre
}

type MetaData {
  publisher: String
  isbn: String
  pageCount: Int
  language: String
}

type Author {
  id: ID!
  name: String!
}

type Book {
  id: ID!
  title: String!
  author: Author

  metadata: MetaData
}

enum Genre {
  FICTION
  HISTORY
  NON_FICTION
  SCIENCE
  TECHNOLOGY
}
```
