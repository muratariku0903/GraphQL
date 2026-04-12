# 演習2-2: DataLoader によるN+1問題の解消

## 目的

Layer 1-3 で `@ResolveField` を使ったリレーション解決を学び、N+1問題を実際に観察した。
この演習では **DataLoader** を導入し、N+1問題を解消する。

DataLoaderの核心は「同じイベントループ内で発生した複数の個別取得を、1回のバッチ取得にまとめる」というシンプルな仕組みだが、GraphQLとの相性が極めて良い。なぜDataLoaderが生まれたのか、どう機能するのかを理解する。

---

## 言語化演習

以下の問いに対して、`answer.md` に自分の言葉で回答してください。

### Q1: DataLoader のバッチ処理の仕組み

Layer 1-3 で、書籍4冊に対して `AuthorsService.findOne` が4回呼ばれるN+1問題を観察した。

DataLoaderを導入すると、この4回の `findOne(id)` が1回の `findMany([id1, id2, id3, id4])` にまとめられる。

- この「まとめる」処理はどのタイミングで行われるか（ヒント: Node.jsのイベントループと `process.nextTick` の関係）
- なぜ「同じイベントループ内」という制約があるのか — もし制約がなかったらどんな問題が起きるか
- DataLoaderの「バッチ関数」はどのようなインターフェースを持つか（入力と出力の対応関係）

### Q2: DataLoader のキャッシュ機能

DataLoader にはバッチ処理に加えて**リクエスト内キャッシュ**の機能がある。

Layer 1-3 の観察で、同じ著者（`a2`）が2回取得されていた。DataLoaderを導入すると：
1. 1回目の `load('a2')` でバッチに含まれ、結果がキャッシュされる
2. 2回目の `load('a2')` はキャッシュから即座に返される

- このキャッシュの**ライフサイクル**はどうあるべきか（アプリケーション全体？リクエストごと？）
- なぜDataLoaderのキャッシュは「リクエストスコープ」にすべきか — リクエストをまたいでキャッシュしたらどんな問題が起きるか
- NestJSの `@Injectable({ scope: Scope.REQUEST })` とDataLoaderのライフサイクルの関係

### Q3: DataLoader をGraphQL以外でも使えるか

DataLoaderはFacebookがGraphQL用に開発したが、その仕組み自体はGraphQLに依存していない。

- REST APIやgRPCでDataLoaderを使うことに意味はあるか
- 「なぜGraphQLでは特にDataLoaderが必要とされるのか」を、RESTとの構造的な違いから説明せよ
- もしDataLoaderを使わずにN+1問題を解決するとしたら、他にどんなアプローチがあるか（少なくとも2つ）

---

## 実装演習

### 前提

dataloader パッケージをインストールしてください：

```bash
cd server && npm install dataloader
```

### 課題1: AuthorsLoader の作成

`server/src/exercises/layer01-basics/01-schema-and-types/` に `authors.loader.ts` を作成し、DataLoaderを実装してください。

**要件:**
- `dataloader` パッケージの `DataLoader` クラスを使用
- バッチ関数は `AuthorsService` の新しいメソッド `findByIds(ids: string[])` を呼び出す
- **リクエストスコープ**にすること（`@Injectable({ scope: Scope.REQUEST })`）
- バッチ関数の戻り値は、**入力のIDの順序と一致する**こと（DataLoaderの制約）

**バッチ関数の制約（重要）:**

DataLoaderのバッチ関数は以下の制約を持つ：
1. 引数: `ReadonlyArray<string>`（IDの配列）
2. 戻り値: `Promise<Array<Author | Error>>`
3. **戻り値の配列の長さと順序は、入力の配列と完全に一致しなければならない**

例:
```ts
// 入力: ['a1', 'a3', 'a2']
// 戻り値: [Author(a1), Author(a3), Author(a2)]  ← 順序が一致
// NG: [Author(a1), Author(a2), Author(a3)]  ← 順序が違う
```

### 課題2: AuthorsService に findByIds を追加

`AuthorsService` に以下のメソッドを追加してください。

```ts
findByIds(ids: string[]): Author[] {
  console.log('execute findByIds', ids);  // バッチ実行を確認するためのログ
  return ids.map(id => this.items.find(e => e.id === id) ?? null);
}
```

### 課題3: BooksResolver を DataLoader 使用に変更

`BooksResolver` の `@ResolveField(() => Author)` を、`AuthorsService.findOne` の直接呼び出しから `AuthorsLoader.load` に変更してください。

**変更前:**
```ts
@ResolveField(() => Author)
author(@Parent() book: Book): Author | null {
  return this.authorService.findOne(book.authorId);
}
```

**変更後:**
```ts
@ResolveField(() => Author)
async author(@Parent() book: Book): Promise<Author | null> {
  return this.authorsLoader.load(book.authorId);
}
```

### 課題4: N+1問題が解消されたことを確認

サーバーを起動し、以下のクエリを実行してターミナルのログを確認してください。

```graphql
query {
  books {
    title
    author {
      name
    }
  }
}
```

**確認ポイント:**
- Layer 1-3 では `findOne` が4回呼ばれていた → DataLoader導入後は `findByIds` が**1回**だけ呼ばれるか
- 同じ著者（`a2`）のIDは、バッチの引数にどう含まれるか（重複あり？なし？）
- `findByIds` に渡されるIDの配列を notes.md に記録すること

### 課題5: キャッシュの効果を確認

以下の2つのクエリを**連続で**実行し、`findByIds` のログが何回出るか確認してください。

```graphql
# 1回目
query {
  books {
    title
    author { name }
  }
}

# 2回目（同じクエリ）
query {
  books {
    title
    author { name }
  }
}
```

**確認ポイント:**
- DataLoaderのキャッシュがリクエストスコープの場合、2回目でもログが出るか？
- もしアプリケーションスコープにしたら2回目のログは出ないか？（試す必要はなし、考察でOK）

---

## 制約
- `AuthorsService.findOne` の直接呼び出しを残さないこと（DataLoader経由に統一）
- DataLoaderのインスタンスはリクエストごとに生成すること（グローバルシングルトンにしない）
- DataLoaderのキャッシュ設定はデフォルト（有効）のまま

---

## ヒント

### DataLoader の基本形
```ts
import DataLoader from 'dataloader';

const loader = new DataLoader<string, Author | null>(async (ids) => {
  // ids: ReadonlyArray<string>
  // 戻り値: Promise<Array<Author | null>>
  // 順序を入力と一致させることが重要
  const authors = await authorsService.findByIds([...ids]);
  return ids.map(id => authors.find(a => a?.id === id) ?? null);
});

// 使い方
const author = await loader.load('a1');       // 即座には実行されない
const author2 = await loader.load('a2');      // 同じtick内ならバッチされる
```

### NestJS でリクエストスコープにする方法
```ts
@Injectable({ scope: Scope.REQUEST })
export class AuthorsLoader {
  private loader: DataLoader<string, Author | null>;

  constructor(private authorsService: AuthorsService) {
    this.loader = new DataLoader<string, Author | null>(async (ids) => {
      // バッチ関数
    });
  }

  load(id: string): Promise<Author | null> {
    return this.loader.load(id);
  }
}
```

### バッチ関数で順序を保証する方法
```ts
// findByIds の結果は順序不定の可能性があるため、入力IDの順序にマッピングし直す
const batchFn = async (ids: ReadonlyArray<string>) => {
  const results = this.authorsService.findByIds([...ids]);
  const map = new Map(results.filter(Boolean).map(a => [a!.id, a]));
  return ids.map(id => map.get(id) ?? null);
};
```
