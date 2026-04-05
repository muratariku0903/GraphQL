# 演習1-2: Query と Mutation — 設計メモ


### 課題1: InputType の定義
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
