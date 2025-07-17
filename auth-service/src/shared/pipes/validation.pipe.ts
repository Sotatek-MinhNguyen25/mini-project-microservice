import { BadRequestException, Injectable, ValidationPipe as NestValidationPipe } from '@nestjs/common'

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException({
          statusCode: 400,
          data: null,
          message: errors.map((e) => Object.values(e.constraints || {})).flat(),
        })
      },
    })
  }
}
