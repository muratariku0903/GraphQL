# 演習1-1: スキーマと型システム

## 目的

GraphQLの**型システム**と**スキーマ定義**の基本を理解する。
RESTでは「エンドポイントのURL設計」が中心だったが、GraphQLでは「型の設計」がAPIの出発点になる。
NestJSのCode Firstアプローチで、TypeScriptのクラスからGraphQLスキーマが自動生成される仕組みを体験する。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: GraphQLの型システムとTypeScriptの型システム

GraphQLには以下の6種類の名前付き型がある：
- **Scalar**（String, Int, Float, Boolean, ID）
- **Object**（フィールドを持つ複合型）
- **Enum**（列挙型）
- **Input**（入力専用のオブジェクト型）
- **Interface**（共通フィールドを定義する抽象型）
- **Union**（複数の型のいずれかを返す型）

これらをTypeScriptの型システムの概念（`string`, `number`, `interface`, `type`, `enum`, `union`）と対比させて説明せよ。
特に **GraphQLのObjectとInputが分離されている理由** を、TypeScriptでは同じinterfaceを入出力に使い回せることと比較して考察すること。

### Q2: なぜGraphQLは「スキーマファースト」なのか

RESTでは「まずエンドポイントを作り、レスポンスのJSON構造は実装に依存する」ことが多い。
一方、GraphQLは「まずスキーマ（型）を定義し、それに合わせて実装する」というアプローチを取る。

- このアプローチが**フロントエンドとバックエンドの並行開発**にどう貢献するか
- **スキーマが存在しないREST API**で起きがちな問題は何か

この2点を対比させて説明せよ。

### Q3: Code First vs Schema First

NestJSのGraphQL統合には2つのアプローチがある：

- **Schema First**: `.graphql` ファイルにSDLで型を手書き → TypeScript型を自動生成
- **Code First**: TypeScriptクラス + デコレーター → `.gql` ファイルを自動生成

それぞれのメリット・デメリットを考え、**どのようなプロジェクトでどちらを選ぶべきか**判断基準を述べよ。
（ヒント: チーム構成、GraphQL経験値、型安全性、既存スキーマの有無）

---

## 実装演習

### 課題1: Book型の定義

以下の仕様で `Book` のGraphQL ObjectTypeを定義してください。

**フィールド:**
- `id`: ID型（必須）
- `title`: String型（必須）
- `author`: String型（必須）
- `publishedYear`: Int型（任意）
- `genre`: Genre Enum型（必須）

**Genre Enum:**
- `FICTION`（小説）
- `NON_FICTION`（ノンフィクション）
- `SCIENCE`（科学）
- `TECHNOLOGY`（技術）
- `HISTORY`（歴史）

**要件:**
- `@ObjectType()`, `@Field()`, `registerEnumType()` を使ったCode Firstアプローチで実装すること
- 実装後、`npm run start:dev` で起動し、自動生成された `schema.gql` の中身を確認すること
- GraphQL Playground で以下のクエリを実行し、イントロスペクション（型情報の取得）を体験すること：

```graphql
{
  __schema {
    types {
      name
      kind
    }
  }
}
```

### 課題2: Queryの実装

課題1のBook型を使って、以下のQueryを実装してください。

- `books`: 全書籍一覧を返す（`[Book]`）
- `book(id: ID!)`: 指定IDの書籍を返す（`Book`、見つからない場合はnull）

**要件:**
- データはインメモリ（配列）で管理し、初期データとして3冊程度のサンプルを用意すること
- Resolver と Service の責務を分離すること
- GraphQL Playgroundで以下のクエリを実行し、**必要なフィールドだけ選択的に取得できること**を確認すること：

```graphql
# 全フィールド取得
query {
  books {
    id
    title
    author
    publishedYear
    genre
  }
}

# タイトルだけ取得（Over-fetchingが起きないことを確認）
query {
  books {
    title
  }
}

# 特定の本を取得
query {
  book(id: "1") {
    title
    author
  }
}
```

**観察ポイント:**
- `books { title }` と `books { title author publishedYear genre }` でサーバー側の処理は何か変わるか？（notes.md に記録）
- 自動生成された `schema.gql` の内容と、TypeScriptのクラス定義を見比べて、どう対応しているか確認すること

---

## 制約
- `.graphql` ファイルを手動で書かないこと（Code Firstアプローチ）
- Resolverにビジネスロジック（データ配列の操作）を直接書かないこと（Serviceに分離）

---

## ヒント
- `@ObjectType()` はクラスをGraphQLのオブジェクト型として登録するデコレーター
- `@Field()` は各プロパティをGraphQLフィールドとして公開するデコレーター
- `@Field(() => Int)` のように明示的に型を指定する必要がある場合がある（TypeScriptの型情報だけでは不十分な場合）
- Enum型は `registerEnumType(Genre, { name: 'Genre' })` で登録する
- `{ nullable: true }` オプションでフィールドをオプショナルにできる
