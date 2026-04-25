import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { BooksModule } from './exercises/layer01-basics/01-schema-and-types/books.module';
import { ErrorHandlingModule } from './exercises/layer04-error-and-optimization/01-error-handling/error-handling.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    BooksModule,
    ErrorHandlingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
