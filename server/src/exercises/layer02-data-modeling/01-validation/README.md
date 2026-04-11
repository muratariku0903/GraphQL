# 演習2-1: class-validator によるInputバリデーション

## 目的

Layer 1 で InputType の定義と責務分離を学んだ。この演習では **class-validator** を使ってバリデーションルールを宣言的に定義し、**NestJSの ValidationPipe** を通じてGraphQLの入力を自動検証する仕組みを理解する。

GraphQLの型システムは「型が合っているか」は保証するが、「値が妥当か」（例: 文字列が空でないか、数値が範囲内か）は保証しない。この「値レベルのバリデーション」を class-validator が担う。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: GraphQLの型システムだけでは不十分な理由

GraphQLのスキーマでは `title: String!` と定義すれば、`title` が必須であることは保証される。
しかし、以下のケースはGraphQLの型システムだけでは防げない：

- `title` に空文字 `""` が送られる
- `publishedYear` に `-1` や `9999` が送られる
- `title` が1000文字を超える

なぜGraphQLの型システムだけではこれらを防げないのか。また、バリデーションを **Resolver内で手動実装するアプローチ** と **class-validator + ValidationPipe で宣言的に定義するアプローチ** を比較し、後者のメリットを「関心の分離」と「再利用性」の観点で説明せよ。

### Q2: ValidationPipe がGraphQLでも機能する仕組み

NestJSの `ValidationPipe` はもともとREST API向けに設計されたものだが、GraphQLでもそのまま使える。

- `ValidationPipe` はリクエストのどの段階で実行されるか（NestJSのリクエストライフサイクルを踏まえて）
- REST の `@Body()` と GraphQL の `@Args()` で、ValidationPipe の挙動に違いはあるか
- `@Args()` に渡されたInputTypeに対して、class-validatorのデコレーターがどう評価されるか

この一連の仕組みを説明せよ。

### Q3: バリデーションエラーのレスポンス設計

`ValidationPipe` がバリデーションエラーを検出した場合、NestJSは `BadRequestException` をスローする。
GraphQLでは通常 HTTP 200 が返り、エラーは `errors` 配列に含まれる。

- バリデーションエラーが GraphQL のレスポンスでどのような形で返るか
- フロントエンド（urql）側で、バリデーションエラーをどう受け取り、ユーザーに表示するか
- RESTの場合（HTTP 400 + エラーボディ）と比較して、GraphQLのエラー表現の特徴を述べよ

---

## 実装演習

### 前提

class-validator と class-transformer をインストールする必要があります：

```bash
cd server && npm install class-validator class-transformer
```

### 課題1: CreateBookInput にバリデーションを追加

Layer 1 で作成した `CreateBookInput` に以下のバリデーションルールを追加してください。

| フィールド | ルール |
|-----------|--------|
| `title` | 空文字不可、最大100文字 |
| `authorId` | 空文字不可 |
| `publishedYear` | 1000〜2100 の範囲（渡された場合のみ） |
| `genre` | Genre Enumの値であること |

**使用するデコレーター例:**
- `@IsNotEmpty()` — 空文字・null・undefined を拒否
- `@MaxLength(100)` — 最大文字数
- `@IsOptional()` — undefined の場合はバリデーションスキップ
- `@Min(1000)` / `@Max(2100)` — 数値範囲
- `@IsEnum(Genre)` — Enum値チェック

### 課題2: UpdateBookInput にバリデーションを追加

`UpdateBookInput` にも同様のバリデーションを追加してください。

**ポイント:**
- Update は全フィールドが optional なので、`@IsOptional()` を適切に使う
- 「渡されなかった場合はスキップ、渡された場合はバリデーション」という挙動を実現する

### 課題3: ValidationPipe をグローバルに適用

`server/src/main.ts` に `ValidationPipe` をグローバルに適用してください。

```ts
app.useGlobalPipes(new ValidationPipe({
  // TODO: 適切なオプションを設定
}));
```

**確認すべきオプション:**
- `whitelist: true` — InputType に定義されていないプロパティを自動除去
- `forbidNonWhitelisted: true` — 未定義プロパティが送られた場合にエラー
- `transform: true` — プレーンオブジェクトをクラスインスタンスに変換（class-validatorが動作するために必要）

### 課題4: 動作確認

GraphQL Playground で以下のクエリを実行し、バリデーションエラーを確認してください。

```graphql
# 1. 空文字のtitleで作成（→ エラー）
mutation {
  createBook(input: {
    title: ""
    authorId: "a1"
    genre: FICTION
  }) {
    id
    title
  }
}

# 2. publishedYearが範囲外（→ エラー）
mutation {
  createBook(input: {
    title: "テスト"
    authorId: "a1"
    publishedYear: -1
    genre: FICTION
  }) {
    id
  }
}

# 3. 正常なリクエスト（→ 成功）
mutation {
  createBook(input: {
    title: "GraphQL実践ガイド"
    authorId: "a1"
    publishedYear: 2025
    genre: TECHNOLOGY
  }) {
    id
    title
  }
}

# 4. 未定義プロパティ（forbidNonWhitelisted の確認）
# → GraphQLの型システムレベルで弾かれるか、ValidationPipeで弾かれるか観察
```

**観察ポイント:**
- エラーレスポンスの `errors[0].extensions` に何が含まれるか
- バリデーションエラーのメッセージは日本語か英語か
- GraphQLの型エラー（例: `genre: "INVALID"`）と class-validator のエラーの違い
- 結果を notes.md に記録すること

---

## 制約
- バリデーションロジックをResolver内やService内に書かないこと（class-validatorに集約）
- カスタムバリデーションデコレーターは作成しなくてよい（組み込みデコレーターで十分）

---

## ヒント
- `class-validator` のデコレーターは InputType のプロパティに付けるだけでOK
- `@IsOptional()` は他のデコレーターと組み合わせて使う: `@IsOptional() @MaxLength(100) title?: string`
- `ValidationPipe` の `transform: true` を忘れると、`@Args()` で受け取ったオブジェクトがプレーンオブジェクトのままで class-validator が動作しない
- GraphQLの型システム（String!, Int等）は「型レベル」、class-validator は「値レベル」のバリデーション — 両方が必要
