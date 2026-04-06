# 演習1-3: Resolver の仕組み — 設計メモ

### 課題1: Author型とデータの追加


**Author フィールド:**
- `id`: ID型（必須）
- `name`: String型（必須）
- `country`: String型（任意）

**Book型の変更:**
- 既存の `author: String` フィールドを `authorId: String`（内部用、GraphQLには公開しない）に変更
- 新たに `author: Author` フィールドを `@ResolveField` で解決するようにする


### 課題2: @ResolveField の実装
@ResolveField(() => Author)` と `@Parent()` デコレーターを使う
@Parent()` で親の `Book` オブジェクトを受け取り、`authorId` を使って `AuthorsService` から著者を取得する
