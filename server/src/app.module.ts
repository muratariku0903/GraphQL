import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { BooksModule } from './exercises/layer01-basics/01-schema-and-types/books.module';
import { ErrorHandlingModule } from './exercises/layer04-error-and-optimization/01-error-handling/error-handling.module';
import depthLimit from 'graphql-depth-limit';
import { ApolloServerPlugin } from '@apollo/server';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { GraphQLError } from 'graphql';
import { PerformanceModule } from './exercises/layer04-error-and-optimization/02-performance-optimization/performance.module';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { SchemaDesignModule } from './exercises/layer06-testing-and-schema-design/02-schema-design-and-versioning/schema-design.module';

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
            simpleEstimator({ defaultComplexity: 0 }),
          ],
        });

        const maxComplexity = 100;
        // const maxComplexity = 9;
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query too complex: ${complexity}. Maximum allowed: ${maxComplexity}`,
          );
        }
      },
    };
  },
};

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      formatError: (error) => ({
        message: error.message,
        extensions: {
          code: error.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
          timestamp: new Date().toISOString(),
          trace:
            process.env.NODE_ENV === 'production'
              ? null
              : error.extensions?.stacktrace,
        },
      }),
      validationRules: [depthLimit(4)],
      cache: new InMemoryLRUCache(),
      plugins: [
        ApolloServerPluginCacheControl({ defaultMaxAge: 0 }),
        responseCachePlugin(),
        complexityPlugin,
      ],
    }),
    BooksModule,
    ErrorHandlingModule,
    PerformanceModule,
    SchemaDesignModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
