import { Query, Resolver } from '@nestjs/graphql';
import { PerformanceService } from './performance.service';
import { Book } from '@/exercises/layer01-basics/01-schema-and-types/books.model';

@Resolver()
export class PerformanceResolver {
  constructor(private readonly service: PerformanceService) {}

  @Query(() => [Book!]!, { complexity: 10 })
  performanceBooks(): Book[] {
    return this.service.findAll();
  }
}
