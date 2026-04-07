import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3003',
  });
  await app.listen(3002);
  console.log(`Application is running on: http://localhost:3002`);
  console.log(`GraphQL Playground: http://localhost:3002/graphql`);
}
bootstrap();
