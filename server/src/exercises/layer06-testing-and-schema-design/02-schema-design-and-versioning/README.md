# 演習6-2: スキーマ設計とバージョニング

## 目的

GraphQLにはRESTのようなURLベースのバージョニング（`/v1/`, `/v2/`）がない。代わりに、スキーマを**継続的に進化**させるアプローチを取る。これはGraphQLの「1つのエンドポイント」という設計思想と密接に関わっている。

また、GraphQLスキーマの設計品質はAPIの使いやすさに直結する。命名規則、型の粒度、Nullable設計など、RESTのエンドポイント設計とは異なる観点での設計判断が求められる。

この演習では、スキーマの段階的進化（`@deprecated`）、設計原則、そしてGraphQL Code Generatorによる型安全なクライアントコード生成を学ぶ。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: GraphQLのバージョニング戦略

RESTでは `/api/v1/users` → `/api/v2/users` のようにURLでバージョニングする。GraphQLではこのアプローチを取らない。

- GraphQLがURLバージョニングを採用しない理由を、「クライアントが必要なフィールドだけを選択できる」という特性と結びつけて説明せよ
- `@deprecated` ディレクティブの役割を説明せよ。RESTのバージョニングとの違いは何か
- フィールドの廃止プロセス（追加 → 非推奨化 → 削除）を具体例で説明せよ。いつ古いフィールドを安全に削除できるか

### Q2: 良いスキーマ設計の原則

GraphQLスキーマはAPIの「契約」であり、一度公開すると変更が難しい。

- 良いGraphQLスキーマ設計の原則を3つ以上挙げ、それぞれアンチパターンと共に説明せよ
- Nullable（`String` vs `String!`）の設計判断基準は何か。「デフォルトNon-Null」と「デフォルトNullable」のどちらが良いか
- Input型の設計で「Create用」と「Update用」を分ける理由を、型安全性の観点で説明せよ

### Q3: GraphQL Code Generator

GraphQL Code Generatorは、スキーマやクエリからTypeScriptの型を自動生成するツールである。

- Code Generatorが解決する問題は何か。手動で型を定義する場合との違いを説明せよ
- サーバー側（NestJS Code First）ではCode Generatorは必要か。クライアント側では必要か。その理由を説明せよ
- Code Generatorで生成された型を使う場合と使わない場合で、開発体験がどう変わるか具体例で説明せよ

---

## 実装演習

### 課題1: @deprecated によるフィールドの段階的廃止

既存の `Book` 型に対して、フィールドの廃止プロセスを体験する。

**シナリオ:** `publishedYear`（Int型）を `publishedDate`（String型、ISO 8601形式）に置き換えたい。

**手順:**

1. この演習用のモジュール `SchemaDesignModule` を作成する
2. 既存の `Book` を拡張した `BookV2` 型を定義し、以下のフィールドを持たせる：
   - 既存フィールド（id, title, genre）
   - `publishedYear` — `@deprecated('Use publishedDate instead')` を付与
   - `publishedDate` — 新しいフィールド（String型、ISO 8601形式）
3. Resolverで `BookV2` を返すクエリを実装する

**要件:**
- `bookV2(id)` — BookV2型を返すクエリ
- `booksV2` — BookV2型の配列を返すクエリ
- Playground上で `publishedYear` に打ち消し線が表示されること
- `publishedYear` と `publishedDate` の両方が取得可能であること

**動作確認クエリ:**
```graphql
# 新旧両方のフィールドを取得
query {
  bookV2(id: "1") {
    id
    title
    publishedYear    # deprecated — 打ち消し線が表示される
    publishedDate    # 新しいフィールド
  }
}

# Introspection で deprecated を確認
query {
  __type(name: "BookV2") {
    fields(includeDeprecated: true) {
      name
      isDeprecated
      deprecationReason
    }
  }
}
```

### 課題2: スキーマ設計の改善

以下のアンチパターンを含む「悪いスキーマ」を読み、改善版を設計せよ。

**悪いスキーマの例（`design.md` に改善案を書く）:**
```graphql
type Query {
  # アンチパターン1: 動詞ベースのQuery名
  getBooks: [Book]
  fetchBookById(bookId: String!): Book

  # アンチパターン2: 一貫性のない命名
  allAuthors: [Author]
  find_author(id: ID!): Author

  # アンチパターン3: 不必要なNullable
  createBook(
    title: String
    authorId: String
    genre: String
  ): Book
}

type Book {
  # アンチパターン4: IDがString
  bookId: String!
  book_title: String!
  theAuthor: Author

  # アンチパターン5: 汎用的すぎるフィールド
  metadata: String  # JSON文字列が入る
}
```

**改善のポイント:**
- 命名規則の統一（camelCase、名詞ベースのQuery名）
- Nullable設計の見直し
- ID型の適切な使用
- Input型の分離（Create / Update）
- メタデータの型付け

### 課題3: GraphQL Code Generator の導入

クライアント側（`/Users/muratariku/Desktop/GraphQL/client/`）にGraphQL Code Generatorを導入し、サーバーのスキーマから型を自動生成せよ。

**手順:**
1. 必要なパッケージをインストールする
   - `@graphql-codegen/cli`
   - `@graphql-codegen/typescript`
   - `@graphql-codegen/typescript-operations`
   - `@graphql-codegen/typescript-urql`（urql用）
2. `codegen.ts` 設定ファイルを作成する
3. サーバーのスキーマ（`http://localhost:3002/graphql` または `schema.gql` ファイル）から型を生成する
4. 生成された型を使って、既存のクライアントコードを型安全にリファクタリングする

**codegen.ts の設定例:**
```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../server/src/schema.gql',
  documents: 'src/**/*.graphql',
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-urql',
      ],
    },
  },
};

export default config;
```

**確認ポイント:**
- 生成された型ファイルにサーバーの `Book`, `Author`, `Genre` 等の型が含まれているか
- Query/Mutationの戻り値型が正しく生成されているか
- urqlのカスタムフックが生成されているか（`useBookQuery` 等）

### 課題4: 動作確認

以下を確認し、結果を `notes.md` に記録してください。

1. **@deprecated の確認**
   - Playgroundで `publishedYear` に打ち消し線が表示されること
   - Introspectionクエリで `isDeprecated: true` が返ること

2. **スキーマ設計の改善**
   - `design.md` に改善版スキーマを記載し、改善理由を説明すること

3. **Code Generator の確認**
   - 型が正しく生成されること
   - 生成された型を使ったコードでコンパイルエラーがないこと

---

## 制約

- 既存のモジュール（layer01等）のソースコードは変更しないこと
- `@deprecated` の体験には新しい型（BookV2）を使うこと
- Code Generatorの設定は `client/` ディレクトリに配置すること
- 生成されたコードは `.gitignore` に追加しないこと（レビュー対象にする）

---

## ヒント

### @deprecated の使い方（NestJS Code First）
```ts
@Field(() => Int, {
  nullable: true,
  deprecationReason: 'Use publishedDate instead',
})
publishedYear!: number | null;
```

### Introspection で deprecated フィールドを確認
```graphql
query {
  __type(name: "BookV2") {
    fields(includeDeprecated: true) {
      name
      isDeprecated
      deprecationReason
    }
  }
}
```

### Code Generator の実行
```bash
# client ディレクトリで
npx graphql-codegen --config codegen.ts
```
