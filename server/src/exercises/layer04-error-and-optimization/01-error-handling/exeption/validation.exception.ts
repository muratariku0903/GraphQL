import { GraphQLError } from 'graphql/error';

export class ValidationBusinessException extends GraphQLError {
  message: string;
  field: string;

  constructor(message: string, field: string) {
    super(`BUSINESS_VALIDATION_ERROR field: ${field} message: ${message}`, {
      extensions: { code: 'BUSINESS_VALIDATION_ERROR' },
    });
    this.message = message;
    this.field = field;
  }
}
