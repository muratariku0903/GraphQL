# 演習1-2: Query と Mutation — 学び・気づきのログ

### 📝 実装レビュー

**実装の評価: 良好**

全ファイルとも適切に実装されています。

**良い点:**
- **InputTypeの設計**: `CreateBookInput` は必須フィールド、`UpdateBookInput` は全フィールド nullable — Q2で学んだ設計原則が正しく反映されている
- **Resolver / Service の責務分離**が維持されている。Resolverはデータ変換のみ、ロジックはServiceに集約
- **部分更新の実装**: `input.publishedYear !== undefined` で「渡されなかった」ケースを判定しているのは良い判断。先ほど質問していた「nullが渡されたのか、キー自体がないのか」の区別を意識した実装になっている
- `schema.gql` を見ると `CreateBookInput` は `String!`（必須）、`UpdateBookInput` は `String`（nullable）と正しく分かれていることが確認できる

**1点改善ポイント:**
- `update` メソッド内の `input.genre ?? target.genre` だと、`genre` に明示的に `null` を渡した場合に元の値が残ります。`publishedYear` では `!== undefined` で判定しているのに、他のフィールドは `??` を使っている点で一貫性がありません。今回は「nullを渡して値をクリアする」ユースケースがないので実害はありませんが、将来的に意識しておくと良いポイントです

**ID採番について:**
- 現在の `Number(lastId) + 1` 方式は学習用としては問題ありませんが、削除後にIDが重複する可能性があります。実務では UUID（`crypto.randomUUID()`）を使うのが一般的です
