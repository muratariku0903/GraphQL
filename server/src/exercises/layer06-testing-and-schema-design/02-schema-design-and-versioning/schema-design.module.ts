import { Module } from '@nestjs/common';
import { SchemaDesignResolver } from './schema-design.resolver';
import { SchemaDesignService } from './schema-design.service';

@Module({
  providers: [SchemaDesignResolver, SchemaDesignService],
})
export class SchemaDesignModule {}
