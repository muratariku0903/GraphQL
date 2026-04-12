# 演習2-1: class-validator によるInputバリデーション — 学び・気づきのログ

**観察ポイント:**

- エラーレスポンスの `errors[0].extensions` に何が含まれるか

エクステンションズ内にはコードとスタックトレース、オリジナルエラーというものがまずあります。さらにオリジナルエラーの中にメッセージという配列が入っています。その配列の中に各フィールドでエラーになった際のエラーメッセージが格納されています。

例えば、タイトルが空文字、オーサーIDも空文字でしたら、それぞれに対するエラーメッセージ2つ分が格納されていました。

- バリデーションエラーのメッセージは日本語か英語か

バリデーションのエラーメッセージは英語になっています。

- GraphQLの型エラー（例: `genre: "INVALID"`）と class-validator のエラーの違い

GraphQLの型エラーの場合は、同様にエラー図の中にextensionsというのがあって、コードがGraphQLValidationFieldという風になっていますね。メッセージというものがないですね。extensionsの中にはないただ、extensionsと同じメッセージがあって、そこには「enumに含まれていませんよ」的なエラーがありますね。

対してclass-validatorの場合は、オリジナルエラーというところにエラーメッセージが出てきます。なので構造がちょっと違いますね。ざっくり言うと、GraphQLの型エラーはerrorsというオブジェクト直下にメッセージでエラー文が出力されるのに対して、class-validatorの場合はextensionsの中にエラーメッセージが配置されています。

### 📝 実装レビュー

**実装の評価: 良好**

**良い点:**
- **ValidationPipe の設定**: `whitelist`, `forbidNonWhitelisted`, `transform` の3つを正しく設定。特に `transform: true` がないと class-validator が動作しないことをQ2で学んだ上で設定しているのが良い
- **CreateBookInput**: `@IsNotEmpty()` + `@MaxLength(100)` の組み合わせ、`@IsOptional()` + `@Min/@Max` の組み合わせが正しい
- **CORS設定の追加**: `enableCors({ origin: 'http://localhost:3003' })` — Layer 1-4 のフロント統合で必要になったことを反映している
- **観察結果**: GraphQL型エラー（`errors[].message`直下）と class-validator エラー（`extensions.originalError.message`内）の構造の違いを正確に観察できている

**1点改善ポイント — UpdateBookInput:**

現在の `UpdateBookInput` で `title` と `authorId` に `@IsNotEmpty()` が付いていますが、`@IsOptional()` が付いていません。この場合、以下の挙動になります：

```graphql
# titleを渡さない → @IsNotEmpty() でエラーになる
mutation {
  updateBook(id: "1", input: { genre: SCIENCE }) { id title }
}
```

Updateは部分更新なので「渡さなかったフィールドはスキップ」が期待される挙動です。`@IsOptional()` を先頭に追加すると：

```ts
@IsOptional()   // undefined → 以降のバリデーションをスキップ
@IsNotEmpty()   // 値が渡された場合 → 空文字を拒否
@MaxLength(100)
title?: string;
```

この `@IsOptional()` + `@IsNotEmpty()` の組み合わせで「渡さないのはOK、渡すなら空文字はNG」を実現できます。`publishedYear` には `@IsOptional()` が付いているのに `title` / `authorId` に付いていないので、統一しておくと良いです。

**観察結果への補足:**

エラーレスポンスの構造の違いを正確に捉えています。実務でフロントからエラーを処理するときは：
- GraphQL型エラー → `error.graphQLErrors[0].message`
- ValidationPipeエラー → `error.graphQLErrors[0].extensions.originalError.message`

とアクセスパスが異なるため、エラーハンドリングのユーティリティを共通化しておくと便利です。
