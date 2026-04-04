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
    </main>
  );
}
