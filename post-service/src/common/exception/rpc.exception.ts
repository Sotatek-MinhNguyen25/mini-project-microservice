import { RpcException } from '@nestjs/microservices';

export class RpcNotFoundException extends RpcException {
  constructor(message: string = 'Not Found') {
    super({
      statusCode: 404,
      error: 'Not Found',
      message,
    });
  }
}

export class RpcUnauthorizedException extends RpcException {
  constructor(message: string = 'Unauthorized') {
    super({
      statusCode: 401,
      error: 'Unauthorized',
      message,
    });
  }
}

export class RpcConflictException extends RpcException {
  constructor(message: string = 'Conflict') {
    super({
      statusCode: 409,
      error: 'Conflict',
      message,
    });
  }
}

export class RpcBadRequestException extends RpcException {
  constructor(message: string = 'Bad Request') {
    super({
      statusCode: 400,
      error: 'Bad Request',
      message,
    });
  }
}
