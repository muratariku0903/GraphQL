import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Book } from '../../layer01-basics/01-schema-and-types/books.model';
import { ErrorHandlingService } from './error-handling.service';

@Resolver()
export class ErrorHandlingResolver {
  constructor(private readonly service: ErrorHandlingService) {}

  // TODO: 課題2〜4 で以下のクエリを実装する
  // - bookOrThrow(id): Book — errors配列パターン
  // - bookResult(id): BookResult — Union型パターン
  // - booksByIds(ids): [BookResult!]! — 部分エラー体験
}
