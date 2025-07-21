import { RpcException } from '@nestjs/microservices';

export class RpcBadRequestException extends RpcException {
  constructor(message: string = 'Bad Request') {
    super({
      statusCode: 400,
      error: 'Bad Request',
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

export class RpcForbiddenException extends RpcException {
  constructor(message: string = 'Forbidden') {
    super({
      statusCode: 403,
      error: 'Forbidden',
      message,
    });
  }
}

export class RpcNotFoundException extends RpcException {
  constructor(message: string = 'Not Found') {
    super({
      statusCode: 404,
      error: 'Not Found',
      message,
    });
  }
}

export class RpcInternalServerErrorException extends RpcException {
  constructor(message: string = 'Internal Server Error') {
    super({
      statusCode: 500,
      error: 'Internal Server Error',
      message,
    });
  }
}
