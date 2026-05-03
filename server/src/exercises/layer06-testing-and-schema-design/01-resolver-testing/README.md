# 演習6-1: Resolverテスト

## 目的

GraphQLのResolverは、RESTのControllerと似た立ち位置にあるが、テストの考え方はいくつかの点で異なる。RESTでは「HTTP メソッド + URL」の組み合わせをテストするが、GraphQLでは「1つのエンドポイントに対して自由なクエリ」が送られてくるため、テスト戦略の設計が重要になる。

この演習では、NestJS + Apollo Server環境におけるResolverのユニットテストと統合テストの書き方を学び、両者の使い分けを理解する。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: Resolverテストで何をモックし、何を実際に実行すべきか

RESTのControllerテストでは、Serviceをモックして「Controllerのルーティングとレスポンス整形」をテストする。GraphQLのResolverテストでも同様のアプローチが取れるが、GraphQL固有の考慮点がある。

- Resolverのユニットテストで**モックすべきもの**と**実際に実行すべきもの**を列挙し、その理由を説明せよ
- `@ResolveField`（フィールドリゾルバー）のテストは、通常のQueryリゾルバーのテストとどう異なるか
- DataLoaderが絡む場合、テストでDataLoaderをどう扱うべきか（モック vs 実DataLoader）

### Q2: ユニットテスト vs 統合テスト の使い分け

GraphQLのテストには大きく2つのアプローチがある：

**アプローチA: Resolverのユニットテスト**
```ts
// Resolverクラスを直接インスタンス化してメソッドを呼ぶ
const resolver = new BooksResolver(mockService);
const result = resolver.findAll();
```

**アプローチB: GraphQL統合テスト（HTTP経由）**
```ts
// supertestでPOST /graphql にクエリを送る
const response = await request(app.getHttpServer())
  .post('/graphql')
  .send({ query: '{ books { id title } }' });
```

- それぞれのテスト対象の範囲を説明せよ（何がテストされて、何がテストされないか）
- プロジェクトにおいて、どちらをどのくらいの比率で書くべきか。その判断基準は何か
- 統合テストでしか検出できないバグの具体例を挙げよ

### Q3: GraphQLテストの落とし穴

GraphQLのテストには、REST APIテストにはない特有の落とし穴がある。

- スキーマの自動生成（Code First）の場合、テスト時にスキーマが存在しない可能性がある。どう対処するか
- GraphQLのレスポンスは常にHTTP 200なので、テストの成否判定をどう行うか
- Mutationのテストで「副作用の確認」をどう行うか（インメモリデータの場合 vs DB接続の場合）

---

## 実装演習

### 前提

この演習では、既存の `BooksModule`（layer01-basics/01-schema-and-types）に対してテストを書く。テストファイルはこの演習ディレクトリ内に配置する。

### 課題1: Resolverのユニットテスト

`BooksResolver` のユニットテストを作成せよ。

**テストファイル:** `books-resolver.spec.ts`

**要件:**
- `BooksService` をモックする
- 以下のクエリに対するテストを書く：
  - `books` — 全件取得（正常系）
  - `book(id)` — ID指定取得（正常系: 存在する場合）
  - `book(id)` — ID指定取得（異常系: 存在しない場合、nullが返る）
- NestJSの `Test.createTestingModule` を使う

**テスト構造の例:**
```ts
describe('BooksResolver', () => {
  let resolver: BooksResolver;
  let service: jest.Mocked<BooksService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BooksResolver,
        {
          provide: BooksService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            // ...
          },
        },
      ],
    }).compile();

    resolver = module.get(BooksResolver);
    service = module.get(BooksService);
  });

  describe('books', () => {
    it('should return all books', () => {
      // ...
    });
  });
});
```

### 課題2: Mutationのユニットテスト

`BooksResolver` のMutationに対するユニットテストを作成せよ。

**テストファイル:** `books-resolver.spec.ts`（課題1に追加）

**要件:**
- `createBook` — 書籍作成（正常系）
- `updateBook` — 書籍更新（正常系: 存在する場合）
- `updateBook` — 書籍更新（異常系: 存在しない場合）
- `deleteBook` — 書籍削除（正常系）
- Mutationの引数（Input型）が正しくServiceに渡されることを検証する

### 課題3: GraphQL統合テスト

supertestを使って、GraphQLエンドポイントに対する統合テストを作成せよ。

**テストファイル:** `books-integration.spec.ts`

**要件:**
- `POST /graphql` にGraphQLクエリを送信する
- レスポンスの `data` フィールドの内容を検証する
- `errors` フィールドが存在しないことを確認する（正常系）
- 以下のシナリオをテスト：
  - 全件取得クエリ
  - ID指定取得クエリ（正常系）
  - 書籍作成Mutation → 作成後の取得で存在確認
  - 存在しない書籍のクエリ（nullが返ること）

**統合テストのセットアップ例:**
```ts
describe('Books GraphQL Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return all books', async () => {
    const query = `
      query {
        books {
          id
          title
          genre
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.data.books).toBeDefined();
    expect(response.body.errors).toBeUndefined();
  });
});
```

### 課題4: エラーハンドリングのテスト

演習4-1で実装した `ErrorHandlingModule` のResolverに対するテストを作成せよ。

**テストファイル:** `error-handling.spec.ts`

**要件:**
- `bookOrThrow` — 存在しないIDの場合、`errors` 配列に `NOT_FOUND` コードが含まれること
- `bookResult` — 存在しないIDの場合、`data.bookResult.__typename` が `BookNotFoundError` であること
- `booksByIds` — 存在するIDと存在しないIDの混在で、成功とエラーが共存すること
- 統合テスト（supertest）で実装すること

### 課題5: 動作確認

テストを実行し、結果を確認してください。

```bash
# 全テスト実行
pnpm --filter server test

# 特定のテストファイルのみ
pnpm --filter server test -- books-resolver.spec
pnpm --filter server test -- books-integration.spec
pnpm --filter server test -- error-handling.spec
```

**確認ポイント:**
- 全テストがパスすること
- テスト実行時間を確認する（ユニットテスト vs 統合テストの速度差）
- テストカバレッジを確認する（`pnpm --filter server test -- --coverage`）
- 結果を `notes.md` に記録すること

---

## 制約

- 既存のモジュールのソースコードは変更しないこと
- テストファイルはこの演習ディレクトリ内に配置すること
- NestJSの `@nestjs/testing` を使うこと
- 統合テストには `supertest` を使うこと
- テストデータはテスト内で完結させること（外部ファイルに依存しない）

---

## ヒント

### NestJSテストモジュールの基本

```ts
import { Test, TestingModule } from '@nestjs/testing';

const module: TestingModule = await Test.createTestingModule({
  providers: [
    TargetResolver,
    {
      provide: DependencyService,
      useValue: {
        method: jest.fn().mockReturnValue(expected),
      },
    },
  ],
}).compile();
```

### supertestでGraphQLクエリを送る

```ts
import * as request from 'supertest';

const response = await request(app.getHttpServer())
  .post('/graphql')
  .send({
    query: `
      query {
        books { id title }
      }
    `,
  })
  .expect(200);

// GraphQLのレスポンス構造
expect(response.body.data.books).toHaveLength(3);
expect(response.body.errors).toBeUndefined();
```

### Mutation + 変数の送り方

```ts
const response = await request(app.getHttpServer())
  .post('/graphql')
  .send({
    query: `
      mutation CreateBook($input: CreateBookInput!) {
        createBook(input: $input) {
          id
          title
        }
      }
    `,
    variables: {
      input: {
        title: 'Test Book',
        authorId: 'a1',
        genre: 'FICTION',
      },
    },
  });
```

### errors配列のテスト

```ts
// GraphQLエラーの検証
expect(response.body.errors).toBeDefined();
expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
```
