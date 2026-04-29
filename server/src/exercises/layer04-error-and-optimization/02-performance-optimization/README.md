# 演習4-2: パフォーマンス最適化

## 目的

GraphQLはクライアントが自由にクエリを構築できる柔軟性を持つ。しかし、この柔軟性は **悪意のあるクエリ** や **巨大なクエリ** によるサーバーリソースの枯渇リスクと表裏一体である。

RESTではエンドポイントごとに処理が固定されるため、事前に負荷を予測できる。一方、GraphQLでは以下のような攻撃的クエリが可能になる：

```graphql
# 深くネストされたクエリ（Depth Attack）
query {
  book(id: "1") {
    author {
      books {
        author {
          books {
            author { ... }
          }
        }
      }
    }
  }
}

# 大量のフィールドを要求するクエリ（Breadth Attack）
query {
  books { id title genre publishedYear }
  bookConnection(pagination: { first: 100 }) {
    edges { node { id title genre publishedYear } }
  }
}
```

この演習では、GraphQL特有のパフォーマンスリスクを理解し、NestJS + Apollo Serverにおける防御手法を学ぶ。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: GraphQL特有のパフォーマンスリスク

RESTでは「1エンドポイント = 1処理」なので、各APIの負荷は事前に見積もれる。GraphQLではクライアントがクエリを自由に構築できるため、サーバーが予期しない負荷を受ける可能性がある。

- GraphQL特有のパフォーマンスリスクを3つ以上挙げ、それぞれ具体的なクエリ例と共に説明せよ
- RESTではなぜこれらの問題が起きにくいのか
- 「GraphQLの柔軟性」と「サーバー保護」のトレードオフについて考えよ

### Q2: Query Depth Limiting

深くネストされたクエリはサーバーに指数関数的な負荷をかける可能性がある。

- なぜ深いネストが危険なのか。N+1問題と関連付けて説明せよ（DataLoaderで緩和できるが、根本解決にはならない理由も）
- Depth Limitの適切な値をどう決めるか。スキーマの構造からどう判断するか
- Depth Limitに引っかかった場合、クライアントにどのようなエラーを返すべきか

### Q3: Query Complexity Analysis

Query Complexityは、クエリの「コスト」を事前に計算し、閾値を超えるクエリを拒否する仕組みである。

- フィールドごとにコストを割り当てる基準は何か（例: スカラーフィールド vs リレーションフィールド vs リスト）
- `multiplier`（乗数）の概念を説明せよ。`books(first: 100)` のようなリストフィールドでなぜ必要か
- Query ComplexityとDepth Limitの役割の違いを説明せよ。片方だけでは不十分な理由は何か

### Q4: Persisted Queries

Persisted Queriesは、クエリ文字列の代わりにハッシュ値を送信する仕組みである。Apollo Serverでは **Automatic Persisted Queries (APQ)** として提供されている。

- Persisted Queriesが解決する問題は何か（パフォーマンス面とセキュリティ面の両方）
- APQの仕組み（初回リクエストと2回目以降の流れ）を説明せよ
- 「Persisted Queries Only」モードにすると何が起きるか。開発時と本番で運用をどう変えるべきか

---

## 実装演習

### 前提

この演習では、既存のモジュールのコードを**直接変更せず**、新しいモジュール `PerformanceModule` を作成して実装する。ただし、`AppModule` の `GraphQLModule.forRoot` の設定変更は必要。

### 課題1: Query Depth Limiting の導入

`graphql-depth-limit` パッケージを導入し、クエリの深さを制限せよ。

**手順:**
1. `graphql-depth-limit` をインストールする
2. `AppModule` の `GraphQLModule.forRoot` に `validationRules` として設定する

**要件:**
- 最大深度: 5
- 深度超過時は、クライアントにわかりやすいエラーメッセージが返ること

**動作確認クエリ:**
```graphql
# 深度5以内 — 成功するはず
query {
  book(id: "1") {
    title
    genre
  }
}

# 深度超過 — エラーになるはず（既存のスキーマでネストが深いクエリを構築）
query {
  bookConnection(pagination: { first: 10 }) {
    edges {
      node {
        title
        genre
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

※ 既存スキーマの深度を確認し、正常なクエリが通る最小の `maxDepth` 値を検討すること。`5` はあくまで出発点 — 実際のスキーマに合わせて調整する。

### 課題2: Query Complexity の導入

`graphql-query-complexity` パッケージを導入し、クエリのコスト計算を実装せよ。

**手順:**
1. `graphql-query-complexity` をインストールする
2. Apollo Serverのプラグインとして設定する

**要件:**
- 最大コスト: 100
- デフォルトのフィールドコスト: 1
- リストフィールドには `@Complexity` デコレーターでコストを設定する
- コスト超過時はクエリを拒否し、現在のコストと最大コストをエラーメッセージに含める

**コスト設計の方針:**

| フィールド種別 | コスト | 理由 |
|-------------|--------|------|
| スカラーフィールド（title, genre等） | 0 | 親オブジェクトの解決に含まれる |
| 単一オブジェクト（book, author） | 1 | 1回のDB/サービス呼び出し |
| リストフィールド（books） | 子コスト × 要素数 | 要素数に比例して負荷増 |
| ページネーション（bookConnection） | 子コスト × first引数 | first引数で要素数が変動 |

**実装するResolver（PerformanceModule内）:**
```graphql
type Query {
  # コスト計算の動作確認用
  performanceBooks: [Book!]!
  performanceBookConnection(pagination: PaginationInput!): BookConnection!
}
```

**動作確認クエリ:**
```graphql
# 低コスト — 成功するはず
query {
  performanceBooks {
    title
  }
}

# 高コスト — コスト超過で拒否されるはず
query {
  performanceBooks {
    title
    genre
    publishedYear
  }
  performanceBookConnection(pagination: { first: 50 }) {
    edges {
      node {
        title
        genre
      }
    }
  }
}
```

### 課題3: Automatic Persisted Queries (APQ) の確認

Apollo Server 5ではAPQがデフォルトで有効になっている。この動作を確認し、理解を深める。

**確認手順:**

1. 以下のcurlコマンドでAPQの動作を確認する

```bash
# Step 1: ハッシュのみ送信（初回 — キャッシュミス）
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "extensions": {
      "persistedQuery": {
        "version": 1,
        "sha256Hash": "ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38"
      }
    }
  }'

# Step 2: クエリ本文 + ハッシュを送信（登録）
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ books { id title } }",
    "extensions": {
      "persistedQuery": {
        "version": 1,
        "sha256Hash": "ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38"
      }
    }
  }'

# Step 3: ハッシュのみ再送信（キャッシュヒット — クエリ本文不要）
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "extensions": {
      "persistedQuery": {
        "version": 1,
        "sha256Hash": "ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38"
      }
    }
  }'
```

2. 各ステップのレスポンスを `notes.md` に記録し、APQの流れを理解する

**確認ポイント:**
- Step 1で `PERSISTED_QUERY_NOT_FOUND` エラーが返ること
- Step 2で正常にデータが返ること
- Step 3でクエリ本文なしでデータが返ること
- Step 2と3のレスポンスが同一であること

### 課題4: 動作確認

サーバーを起動し、以下のシナリオを順に実行してログ・結果を確認してください。

```graphql
# 1. Depth Limit — 正常系（深度制限内）
query {
  book(id: "1") {
    title
    genre
  }
}

# 2. Depth Limit — 異常系（深度超過のクエリを構築して確認）
# ※ 既存スキーマの構造に合わせてネストが深いクエリを作成すること

# 3. Query Complexity — 正常系（低コスト）
query {
  performanceBooks {
    title
  }
}

# 4. Query Complexity — 異常系（コスト超過）
# ※ 課題2で設計したコストに基づき、100を超えるクエリを作成すること

# 5. APQ — curlコマンド3ステップの確認（課題3を参照）
```

**確認ポイント:**
- Depth超過時のエラーメッセージにどのような情報が含まれるか
- Complexity超過時のエラーメッセージに現在コストと最大コストが含まれるか
- APQの3ステップが期待通りに動作するか
- 結果を `notes.md` に記録すること

---

## 制約

- 既存モジュール（layer01等）のコードは変更しないこと
- `AppModule` の `GraphQLModule.forRoot` の設定変更は可
- Depth Limitには `graphql-depth-limit` パッケージを使うこと
- Query Complexityには `graphql-query-complexity` パッケージを使うこと
- PerformanceModule内のResolverで `@Complexity` デコレーターを使ったコスト設定を行うこと

---

## ヒント

### graphql-depth-limit の設定
```ts
import depthLimit from 'graphql-depth-limit';

GraphQLModule.forRoot<ApolloDriverConfig>({
  // ...
  validationRules: [depthLimit(5)],
});
```

### graphql-query-complexity のプラグイン設定
```ts
import { ApolloServerPlugin } from '@apollo/server';
import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from 'graphql-query-complexity';

const complexityPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async didResolveOperation({ request, document, schema }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        const maxComplexity = 100;
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query too complex: ${complexity}. Maximum allowed: ${maxComplexity}`,
          );
        }
      },
    };
  },
};
```

### @Complexity デコレーターの使い方
```ts
@Query(() => [Book])
@Complexity(({ childComplexity, args }) => {
  // リストの場合: 子のコスト × 要素数（デフォルト10）
  return childComplexity * (args.first ?? 10);
})
performanceBooks(): Book[] {
  return this.service.findAll();
}
```
