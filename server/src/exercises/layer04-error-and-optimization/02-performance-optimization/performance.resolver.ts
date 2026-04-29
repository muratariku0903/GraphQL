import { Resolver } from '@nestjs/graphql';
import { PerformanceService } from './performance.service';

@Resolver()
export class PerformanceResolver {
  constructor(private readonly service: PerformanceService) {}

  // TODO: 課題2 で以下のクエリを実装する
  // - performanceBooks: [Book!]! — コスト計算の動作確認用
  // - performanceBookConnection(pagination): BookConnection! — ページネーション付きコスト計算
}
