import { Module } from '@nestjs/common';
import { ErrorHandlingResolver } from './error-handling.resolver';
import { ErrorHandlingService } from './error-handling.service';

@Module({
  providers: [ErrorHandlingResolver, ErrorHandlingService],
})
export class ErrorHandlingModule {}
