import { RpcException } from '@nestjs/microservices';

export class RpcNotFoundException extends RpcException {
  constructor(message: string = 'Not Found') {
    super({
      status: 404,
      error: 'Not Found',
      message,
    });
  }
}

export class RpcConflictException extends RpcException {
  constructor(message: string = 'Conflict') {
    super({
      status: 409,
      error: 'Conflict',
      message,
    });
  }
}
