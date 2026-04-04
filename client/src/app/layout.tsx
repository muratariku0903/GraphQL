import type { Metadata } from 'next';
import { UrqlProvider } from '@/lib/urql-provider';

export const metadata: Metadata = {
  title: 'GraphQL Learning',
  description: 'GraphQL学習プロジェクト — Next.jsクライアント',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <UrqlProvider>{children}</UrqlProvider>
      </body>
    </html>
  );
}
