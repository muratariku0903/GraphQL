# 演習1-4: フロント統合 — 学び・気づきのログ


1. **Client Component版ページ** と **Server Component版ページ** を両方開き、ブラウザのDevToolsのNetworkタブで通信の違いを観察する
2. 書籍追加フォームから書籍を追加し、一覧が更新されるかを観察
3. 書籍の編集機能も実装して、編集後のキャッシュ自動更新を確認する（任意）


クライアントコンポーネントの場合は、GraphQLのリクエストが実行されていましたが、サーバーコンポーネントの時は実行されていませんでした。

書籍追加フォームから書籍を追加するとミューテーションが実行され、さらに一覧取得のクエリが実行された結果、書籍一覧が更新されました。

### 📝 実装レビュー

**実装の評価: 良好**

すべての課題が動作する形で実装されており、Server Component と Client Component の両パターンで GraphQL 通信ができていることが確認できました。

**良い点:**

- **コンポーネント分割**: `BookList` と `CreateBookForm` を別ファイルに分離し、Page コンポーネントは Suspense で囲むだけの薄い構成にできている
- **型定義の共有**: `BooksQueryResult` と `Genre` を export して、Server Component 側からも再利用している点は良い設計
- **Server Component の実装**: `getClient().query().toPromise()` で正しく Promise として解決し、`async` ページ関数として構成できている
- **N+1問題の体験**: ターミナルログを見ると、`books` クエリ実行時に `AuthorService.findOne` が複数回呼ばれているのが確認できるはず — Layer 1-3 で学んだN+1がフロントから呼んだときも同じく発生していることが分かる

**観察結果について:**

> クライアントコンポーネントの場合は、GraphQLのリクエストが実行されていましたが、サーバーコンポーネントの時は実行されていませんでした。

→ 正確に観察できています。Server Component の場合、GraphQL リクエストはサーバー側で完結し、ブラウザにはレンダリング済みのHTMLだけが届きます。これがSEOやUXで有利になる本質です。

> 書籍追加フォームから書籍を追加するとミューテーションが実行され、さらに一覧取得のクエリが実行された結果、書籍一覧が更新されました。

→ ここは1つ確認したい点があります。**「一覧取得のクエリが実行された」のは自動なのか、urql の何の挙動でそうなったのか** を考えてみてください。`CreateBookMutation` のレスポンスでは `title, genre, author { name }` だけ取得しており、特に手動でリフレッシュも書いていないのに、なぜ一覧が更新されたと思いますか？

ヒント: Q3 で議論した「自動更新」の挙動が一部効いている可能性があります。あるいは、Suspense の再評価や useQuery の再実行が関係しているかもしれません。

**改善ポイント（注意点）:**

1. **`BookList` 内のクエリでは `__typename` が暗黙的に取得されている**
   urql は内部で `__typename` を自動付与しているので明示する必要はありませんが、Genre enum など TypeScript の enum と GraphQL の enum を直接対応付けていると、後々ズレが出やすいです。Layer 6 で扱う **GraphQL Code Generator** を導入すると、サーバーの schema.gql から型を自動生成できるので、手動の interface/enum 定義が不要になります

2. **`CreateBookForm` の入力ハードコード**
   現在は `authorId: 'a1'` と `genre: Genre.FICTION` がハードコードされています。学習目的としてはOKですが、本来であれば `authorId` をセレクトボックスで選べるようにしたり、`genre` もユーザーが選択できるようにすると現実的なフォームになります

3. **`useMutation` のインポート元**
   `BookList` は `@urql/next` から `useQuery` をインポートしているのに対し、`CreateBookForm` は `urql` から `useMutation` をインポートしています。`@urql/next` と `urql` のどちらでも動きますが、Next.js のApp Router で使う場合は `@urql/next` に統一しておくと、SSR/RSC との連携が確実になります

4. **`React.SubmitEvent` の型**
   `React.SubmitEvent<HTMLFormElement>` は実は型が存在しません。正しくは `React.FormEvent<HTMLFormElement>` です。動いているのは TypeScript の型チェックが通っているだけで、実際にはランタイムでは無関係です

5. **`data?.createPost` のミス**
   `console.log("Created:", data?.createPost)` となっていますが、Mutation名は `createBook` なので `data?.createBook` が正しいです（タイポ）

**urqlの自動更新について深掘り:**

CreateBookMutation のレスポンスに `id` を含めていない点に注目してください。Q3 のレビューで触れたとおり、urqlの自動更新は `__typename` + `id` でエンティティを特定します。**`id` を取得していない場合、urqlはそのエンティティを正規化できません**。

→ 試しに `CreateBookMutation` に `id` を追加してみて、一覧の挙動が変わるか確認してみると面白いです。「自動更新が効くか効かないか」の境界を体感できます。
