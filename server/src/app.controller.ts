import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      project: 'GraphQL Learning',
      description: 'GraphQL学習プロジェクト — アウトプット駆動型',
      port: 3002,
      graphqlPlayground: '/graphql',
    };
  }
}
