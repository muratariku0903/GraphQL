export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>GraphQL Learning — Client</h1>
      <p>Next.js + urql で GraphQL サーバーと通信する学習用クライアントです。</p>
      <ul>
        <li>GraphQL Server: <code>http://localhost:3002/graphql</code></li>
        <li>Client: <code>http://localhost:3003</code></li>
      </ul>
      <p>演習の実装が進むと、ここから GraphQL クエリを実行できるようになります。</p>

      <h2>演習</h2>
      <ul>
        <li>
          <a href="/exercises/layer01/04-frontend-integration/client">
            Layer 1-4: 書籍一覧（Client Component版）
          </a>
        </li>
        <li>
          <a href="/exercises/layer01/04-frontend-integration/server">
            Layer 1-4: 書籍一覧（Server Component版）
          </a>
        </li>
      </ul>
    </main>
  );
}
