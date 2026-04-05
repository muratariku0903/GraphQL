# 演習1-1: スキーマと型システム — 設計メモ

### 課題1: Book型の定義
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
