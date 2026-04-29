import { GraphQLError } from 'graphql';

export class NotFoundBusinessException extends GraphQLError {
  resourceName: string;
  resourceId: string;

  constructor(resourceName: string, resourceId: string) {
    super(
      `NotFoundBusinessException resourceName: ${resourceName}, resourceId: ${resourceId}`,
      {
        extensions: {
          code: 'NOT_FOUND',
        },
      },
    );
    this.resourceName = resourceName;
    this.resourceId = resourceId;
  }
}
