# GraphQL 学習計画 — アウトプット駆動型

## 学習方針

### 基本思想
**「読んで終わり」にしない。全レイヤーで必ず手を動かし、言語化する。**

各レイヤーは以下の3ステップで進める：

1. **インプット** — 公式ドキュメント + Claude Codeによる解説（最小限）
2. **アウトプット: 言語化** — 学んだことを自分の言葉で書く（answer.md）
3. **アウトプット: 実装** — 実際にコードを書いて動かす（design.md → 実装）

### Claude Code の活用方法
- **演習の自動生成**: 各レイヤーで `演習を作って` と依頼すると、README.md（課題）、answer.md（言語化の回答欄）、design.md（設計メモ欄）を自動生成
- **レビュー**: 実装・言語化の回答後に `レビューして` と依頼するとフィードバック
- **段階的ヒント**: 詰まったら質問 → すぐ答えは出さず、思考を促す形で導く
- **公式ドキュメント参照**: Context7 MCP を使って最新のGraphQL / NestJS GraphQL公式ドキュメントを参照可能

---

## プロジェクト構成

```
GraphQL/
├── CLAUDE.md                 # Claude Code用ルール
├── learning-plan.md          # この学習計画
├── .gitignore
├── server/                   # GraphQLサーバー（NestJS + Apollo Server）
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── main.ts               # エントリーポイント（ポート3002）
│   │   ├── app.module.ts          # ルートモジュール（GraphQLModule統合）
│   │   ├── app.controller.ts      # プロジェクト情報API（REST）
│   │   └── exercises/             # 演習モジュール群
│   │       ├── layer01-basics/
│   │       │   ├── progress.md
│   │       │   ├── 01-schema-and-types/
│   │       │   ├── 02-queries-and-mutations/
│   │       │   └── 03-resolvers/
│   │       ├── layer02-data-modeling/
│   │       └── ...
│   └── test/
└── client/                   # GraphQLクライアント（Next.js + urql）
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    └── src/
        ├── app/                  # App Router（演習ページ）
        └── lib/                  # urqlクライアント設定
```

### 演習ディレクトリの構造（各レイヤー共通）

**サーバー側:**
```
server/src/exercises/layer01-basics/
├── progress.md
├── 01-schema-and-types/
│   ├── README.md          # 課題文
│   ├── answer.md          # 言語化演習の回答
│   ├── design.md          # 実装演習の設計メモ
│   ├── notes.md           # 気づき・学びのログ
│   ├── *.module.ts        # NestJSモジュール
│   ├── *.resolver.ts      # GraphQLリゾルバー
│   └── *.model.ts         # GraphQLオブジェクト型
└── 02-queries-and-mutations/
    └── ...
```

**クライアント側:**
```
client/src/app/exercises/layer01-basics/
├── 01-schema-and-types/
│   └── page.tsx           # Next.jsからGraphQL APIを呼び出す演習ページ
└── ...
```

> **ポイント**: サーバー側でGraphQL APIを実装し、クライアント側（Next.js + urql）からそのAPIを呼び出すことで、GraphQLの「サーバーとクライアント両面」を体験する。

---

## レイヤー別 学習計画

---

### Layer 1: GraphQL基礎（推定 3-4日）

#### 学ぶこと
- GraphQLとは何か（RESTとの根本的な違い）
- スキーマ定義言語（SDL）と型システム（Scalar, Object, Enum, Input, Union, Interface）
- Query / Mutation / Subscription の3つのルートオペレーション
- NestJSにおけるCode First vs Schema First アプローチ
- `@ObjectType`, `@Field`, `@Query`, `@Mutation` デコレーター

#### インプット
- GraphQL公式ドキュメント: Introduction, Queries and Mutations, Schemas and Types
- NestJS公式ドキュメント: GraphQL — Quick Start, Resolvers, Mutations

#### アウトプット演習

**演習1-1: スキーマと型システム（言語化 + 実装）**
- 言語化: 「GraphQLの型システム（Scalar / Object / Enum / Input / Union / Interface）を、TypeScriptの型システムと対比させて説明せよ」
- 言語化: 「GraphQLがなぜ『APIのための型付きクエリ言語』と呼ばれるのか、RESTのエンドポイント設計と比較して説明せよ」
- 言語化: 「Code First と Schema First の違いを説明し、NestJSプロジェクトでCode Firstが推奨されるケースを述べよ」
- 実装: `@ObjectType` と `@Field` を使って `Book` 型を定義し、自動生成されるschema.gqlを確認
- 実装: Scalar型（String, Int, Float, Boolean, ID）とカスタムScalar型（Date等）の使い分け

**演習1-2: Query と Mutation（言語化 + 実装）**
- 言語化: 「RESTの `GET /books` と GraphQLの `query { books { title author } }` の違いを、Over-fetching / Under-fetching の観点で説明せよ」
- 言語化: 「Mutationが必要な理由を、『すべてQueryで実行できるのになぜ区別するのか』という問いに対して説明せよ」
- 実装: インメモリの書籍管理APIをGraphQLで構築
  - `query books` — 書籍一覧取得
  - `query book(id)` — 特定の書籍取得
  - `mutation createBook(input)` — 書籍を追加
  - `mutation updateBook(id, input)` — 書籍を更新
  - `mutation deleteBook(id)` — 書籍を削除
- 実装: GraphQL Playgroundで各クエリを実行し、レスポンス構造を確認

**演習1-3: Resolver の仕組み（言語化 + 実装）**
- 言語化: 「RESTのControllerとGraphQLのResolverの責務の違いを説明せよ。なぜGraphQLでは『ルーティング』という概念が薄いのか」
- 言語化: 「Resolverのフィールドリゾルバー（`@ResolveField`）がGraphQLの最大の強みである理由を、N+1問題に触れながら説明せよ」
- 実装: `BooksResolver` に `@ResolveField` を追加し、書籍の著者情報（Author型）を遅延解決する
- 実装: Serviceレイヤーとの責務分離（ResolverはGraphQL変換のみ、ロジックはServiceに集約）

---

### Layer 2: データモデリングとリレーション（推定 4-5日）

#### 学ぶこと
- GraphQLにおけるリレーション表現（ネストしたオブジェクト型）
- Input型とDTO（`@InputType`, `@ArgsType`）
- Enum型の定義と活用
- Union型とInterface型
- ページネーション（Offset-based / Cursor-based）
- フィルタリングとソート

#### インプット
- GraphQL公式ドキュメント: Schemas and Types（Advanced）
- NestJS公式ドキュメント: GraphQL — Mapped Types, Unions and Enums

#### アウトプット演習

**演習2-1: Input型とバリデーション（言語化 + 実装）**
- 言語化: 「GraphQLの `Input` 型と `ObjectType` 型を分離する理由を、入出力の責務分離とセキュリティの観点で説明せよ」
- 言語化: 「`class-validator` によるバリデーションがGraphQLでも有効な理由を、NestJSのPipe統合の観点で説明せよ」
- 実装: `CreateBookInput`, `UpdateBookInput` を`@InputType`で定義し、class-validatorデコレーターでバリデーション
- 実装: `ValidationPipe` をグローバルに適用し、不正な入力に対するGraphQLエラーレスポンスを確認

**演習2-2: リレーションとネストしたクエリ（言語化 + 実装）**
- 言語化: 「RESTでリレーションを表現する方法（ネスト / サブリソース / `?include=` パラメータ）とGraphQLのネストしたクエリの違いを、柔軟性の観点で比較せよ」
- 言語化: 「GraphQLのN+1問題とは何か。DataLoaderがどのようにバッチ処理でこれを解決するか説明せよ」
- 実装: Author ↔ Book（1:N）のリレーションを構築し、ネストしたクエリでデータを取得
  - `query { authors { name books { title } } }`
  - `query { book(id: 1) { title author { name } } }`
- 実装: DataLoaderを導入し、N+1問題の解消をログで確認

**演習2-3: ページネーションとフィルタリング（言語化 + 実装）**
- 言語化: 「Offset-based ページネーションとCursor-based ページネーションの違いを、リアルタイムデータ追加時の挙動で説明せよ」
- 言語化: 「Relay仕様のConnection / Edge / Node パターンとは何か、なぜGraphQLコミュニティで標準化されたのか説明せよ」
- 実装: Offset-basedページネーション（`books(offset: 0, limit: 10)`）を実装
- 実装: Cursor-basedページネーション（Relay Connection仕様）を実装し、両者の挙動の違いを体験
- 実装: フィルタリング引数（`books(filter: { genre: FICTION })`）を追加

---

### Layer 3: 認証・認可とコンテキスト（推定 3-4日）

#### 学ぶこと
- GraphQLにおける認証・認可の設計パターン
- NestJSのGuardとGraphQLの統合（`GqlAuthGuard`）
- GraphQLコンテキスト（`@Context()`）
- フィールドレベルの認可
- ディレクティブによる宣言的認可

#### インプット
- NestJS公式ドキュメント: GraphQL — Guards, Interceptors
- Apollo Server公式ドキュメント: Authentication and Authorization

#### アウトプット演習

**演習3-1: GraphQLコンテキストと認証（言語化 + 実装）**
- 言語化: 「RESTでは各エンドポイントにGuardを適用するが、GraphQLではリクエストが1つのエンドポイント（`/graphql`）に集約される。この違いが認証設計にどう影響するか説明せよ」
- 言語化: 「GraphQLのContextオブジェクトの役割を、Expressのreqオブジェクトとの類似点と相違点で説明せよ」
- 実装: JWT認証をGraphQLに統合し、`@Context()` から現在のユーザー情報を取得する
- 実装: `@CurrentUser()` カスタムデコレーターを作成し、Resolver内で認証ユーザーを簡潔に取得

**演習3-2: フィールドレベル認可（言語化 + 実装）**
- 言語化: 「RESTのエンドポイント単位の認可とGraphQLのフィールド単位の認可の違いを、実用的なシナリオ（例: ユーザープロフィールの公開情報 vs 非公開情報）で説明せよ」
- 言語化: 「GraphQLのカスタムディレクティブ（例: `@auth(role: ADMIN)`）による宣言的認可のメリットを説明せよ」
- 実装: Resolverレベルの `@UseGuards(GqlAuthGuard)` で認証を適用
- 実装: 特定のフィールド（例: `email`）を管理者のみに公開するフィールドレベル認可を実装
- 実装: `@Roles()` デコレーター + RolesGuard をGraphQLに適用

---

### Layer 4: エラーハンドリングと最適化（推定 3-4日）

#### 学ぶこと
- GraphQLのエラーモデル（`errors` 配列、部分エラー）
- カスタムエラーフォーマット（`formatError`）
- エラーのユニオン型パターン（Result型）
- クエリの複雑度制限（Query Complexity）
- クエリの深さ制限（Query Depth Limiting）
- Persisted Queries

#### インプット
- GraphQL公式ドキュメント: Errors
- Apollo Server公式ドキュメント: Error Handling, Performance — Query Complexity

#### アウトプット演習

**演習4-1: エラーハンドリング（言語化 + 実装）**
- 言語化: 「RESTではHTTPステータスコード（404, 500等）でエラーを表現するが、GraphQLでは常にHTTP 200が返る（エラー時も）。この設計の理由とメリット・デメリットを説明せよ」
- 言語化: 「GraphQLのUnion型を使った結果型パターン（例: `union BookResult = Book | NotFoundError | ValidationError`）のメリットを、errors配列と比較して説明せよ」
- 実装: カスタム `GraphQLFormattedError` で統一的なエラーレスポンスを返す
- 実装: NestJSの例外フィルターをGraphQL向けに適用
- 実装: Union型を使ったResult型パターンを実装し、型安全なエラーハンドリングを体験

**演習4-2: パフォーマンス最適化（言語化 + 実装）**
- 言語化: 「GraphQLが悪意のあるクエリ（深いネスト、大量フィールド）に対して脆弱な理由と、サーバー側でどのように防御すべきか説明せよ」
- 言語化: 「Persisted Queriesとは何か。セキュリティとパフォーマンスの両面でのメリットを説明せよ」
- 実装: Query Complexity を設定し、複雑すぎるクエリを拒否する
- 実装: Query Depth Limiting を導入し、深すぎるネストを防ぐ
- 実装: DataLoaderのキャッシュ効果をログで可視化

---

### Layer 5: Subscription とリアルタイム（推定 3-4日）

#### 学ぶこと
- GraphQL Subscriptionの仕組み（WebSocket / Server-Sent Events）
- PubSubパターン（`graphql-subscriptions`）
- NestJSでのSubscription統合
- フィルタリングされたSubscription
- Subscriptionの認証

#### インプット
- GraphQL公式ドキュメント: Subscriptions
- NestJS公式ドキュメント: GraphQL — Subscriptions

#### アウトプット演習

**演習5-1: Subscription基礎（言語化 + 実装）**
- 言語化: 「GraphQL SubscriptionとRESTのWebSocket / SSE / ポーリングの違いを、型安全性と統一性の観点で説明せよ」
- 言語化: 「PubSubパターンとは何か、Observer パターンとの関係を説明せよ」
- 実装: 書籍が追加されたときにリアルタイム通知を返す `bookAdded` Subscriptionを実装
- 実装: フィルタリング付きSubscription（特定ジャンルの書籍のみ通知）

**演習5-2: リアルタイムアプリケーション（実装）**
- 実装: チャットアプリをGraphQLで構築
  - `query messages` — メッセージ一覧取得
  - `mutation sendMessage` — メッセージ送信
  - `subscription messageSent` — 新着メッセージのリアルタイム通知
- 実装: オンラインユーザー一覧をSubscriptionで管理

---

### Layer 6: テストとスキーマ設計（推定 3-4日）

#### 学ぶこと
- GraphQL Resolverのユニットテスト
- GraphQL統合テスト（supertestでGraphQLクエリを送信）
- スキーマ設計のベストプラクティス
- スキーマの進化（非推奨フィールド `@deprecated`）
- GraphQL Code Generator による型安全なクライアントコード生成

#### インプット
- NestJS公式ドキュメント: Testing
- GraphQL公式ドキュメント: Best Practices

#### アウトプット演習

**演習6-1: Resolverテスト（言語化 + 実装）**
- 言語化: 「GraphQLのResolverテストでは何をモックし、何を実際に実行すべきか。REST Controllerのテストとの違いを説明せよ」
- 言語化: 「GraphQLの統合テストでHTTPリクエスト（`POST /graphql`）を送る場合と、Resolverを直接テストする場合の使い分けを説明せよ」
- 実装: BooksResolverのユニットテスト（Serviceをモック）
- 実装: supertestでGraphQLクエリを送信する統合テスト

**演習6-2: スキーマ設計とバージョニング（言語化 + 実装）**
- 言語化: 「GraphQLにはRESTのようなバージョニング（`/v1/`, `/v2/`）がないが、スキーマをどのように進化させるべきか、`@deprecated` ディレクティブの活用を含めて説明せよ」
- 言語化: 「良いGraphQLスキーマ設計の原則を3つ挙げ、アンチパターンと共に説明せよ」
- 実装: `@deprecated` を使ったフィールドの段階的廃止を体験
- 実装: GraphQL Code Generatorを設定し、スキーマからTypeScript型を自動生成

---

### Layer 7: REST vs GraphQL 統合演習（推定 3-4日）

#### 学ぶこと
- REST APIとGraphQL APIの共存パターン
- GraphQLをBFF（Backend For Frontend）として使うアーキテクチャ
- GraphQLからREST APIをラップするパターン
- Federation / Schema Stitching の概念
- internal-systemのBFFアーキテクチャとの接続

#### インプット
- Apollo Federation公式ドキュメント
- NestJS公式ドキュメント: GraphQL — Federation

#### アウトプット演習

**演習7-1: GraphQL as BFF（言語化 + 実装）**
- 言語化: 「BFF（Backend For Frontend）パターンとは何か。GraphQLがBFF層に適している理由を、フロントエンドの多様なデータ要求の観点で説明せよ」
- 言語化: 「internal-systemのアーキテクチャ（Frontend → BFF(GraphQL) → Backend(gRPC)）において、GraphQLが果たす役割を説明せよ」
- 実装: REST API（模擬バックエンド）をGraphQLでラップするBFF層を構築
- 実装: 複数のRESTエンドポイントのデータを1つのGraphQLクエリで統合して返す

**演習7-2: REST vs GraphQL 比較総括（言語化）**
- 言語化: 「REST / GraphQL / gRPC の3つの通信方式を、以下の軸で比較表にまとめよ」
  - 型安全性
  - Over-fetching / Under-fetching
  - キャッシュ戦略
  - エラーハンドリング
  - リアルタイム通信
  - 学習コスト
  - ツールエコシステム
  - 適切なユースケース
- 言語化: 「自分が新規プロジェクトの技術選定を行う場合、REST / GraphQL / gRPC をそれぞれどのような条件で採用するか、判断フローチャートを作成せよ」

---

## 学習の進め方ガイド

### 1レイヤーの進め方（テンプレート）

```
1. Claude Codeに「Layer Xの演習を作成して」と依頼
   → README.md, answer.md, design.md, notes.md, *.module.ts 等が自動生成される

2. 公式ドキュメントを読む（Claude Codeに「公式ドキュメントのこの部分を説明して」と聞いてもOK）

3. 言語化演習に取り組む
   → answer.md に自分の言葉で回答を書く
   → 「レビューして」と依頼 → フィードバックを受ける

4. 実装演習に取り組む
   → design.md に設計を書く
   → 実装する
   → 「レビューして」と依頼 → フィードバックを受ける

5. 動作確認
   → サーバー: cd server && npm run start:dev（ポート3002）
   → クライアント: cd client && npm run dev（ポート3003）
   → GraphQL Playground (http://localhost:3002/graphql) でクエリを実行
   → Next.js (http://localhost:3003) からGraphQL通信を確認

6. notes.md に気づき・学びを記録

7. 次のレイヤーへ
```

### Claude Code 活用コマンド例

| やりたいこと | Claude Codeへの依頼例 |
|---|---|
| 演習の作成 | `Layer 1の演習1-1を作成して` |
| 公式ドキュメント参照 | `GraphQLのSchema定義について公式ドキュメントを参照して教えて` |
| 言語化レビュー | `answer.mdをレビューして` |
| 実装レビュー | `実装をレビューして` |
| ヒントを求める | `この演習のヒントをください`（段階的に出す） |
| 振り返り | `Layer 1で学んだことを整理して` |
| 進捗確認 | `今の学習進捗を教えて` |

---

## 推定スケジュール

| レイヤー | テーマ | 推定日数 | 累計 |
|---------|--------|---------|------|
| Layer 1 | GraphQL基礎 | 3-4日 | 3-4日 |
| Layer 2 | データモデリングとリレーション | 4-5日 | 7-9日 |
| Layer 3 | 認証・認可とコンテキスト | 3-4日 | 10-13日 |
| Layer 4 | エラーハンドリングと最適化 | 3-4日 | 13-17日 |
| Layer 5 | Subscription とリアルタイム | 3-4日 | 16-21日 |
| Layer 6 | テストとスキーマ設計 | 3-4日 | 19-25日 |
| Layer 7 | REST vs GraphQL 統合演習 | 3-4日 | 22-29日 |

**想定合計: 約4-5週間**（1日2-3時間の学習を想定）

---

## 最終ゴール

全レイヤー完了後、**総合演習**として以下を実装する：

### 総合プロジェクト: GraphQL API（本番品質）
- Code First アプローチによるスキーマ設計
- ObjectType / InputType / Enum / Union / Interface の適切な使い分け
- Resolver + Service の責務分離
- DataLoaderによるN+1問題の解消
- JWT認証 + フィールドレベル認可
- class-validatorによるInput型バリデーション
- Union型を使ったResult型パターンのエラーハンドリング
- Cursor-basedページネーション（Relay Connection仕様）
- Subscriptionによるリアルタイム通知
- Query Complexity / Depth Limiting によるセキュリティ対策
- Resolverユニットテスト + GraphQL統合テスト
- GraphQL Code Generatorによる型安全なクライアントコード生成

これにより、internal-systemのBFF層（NestJS + Apollo Server + GraphQL Code First）を自信を持って実装できるレベルに到達する。
