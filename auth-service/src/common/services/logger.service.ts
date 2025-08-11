import { Injectable, Logger } from '@nestjs/common';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  method?: string;
  endpoint?: string;
  userId?: string;
  requestId?: string;
  statusCode?: number;
  responseTime?: number;
  topic?: string;
  payload?: any;
  result?: any;
  error?: any;
  additionalData?: Record<string, any>;
}

@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger('AppLogger');

  log(level: LogLevel, message: string, context?: LogContext): void {
    const logMessage = this.formatLogMessage(message, context);

    switch (level) {
      case LogLevel.DEBUG:
        this.logger.debug(logMessage);
        break;
      case LogLevel.INFO:
        this.logger.log(logMessage);
        break;
      case LogLevel.WARN:
        this.logger.warn(logMessage);
        break;
      case LogLevel.ERROR:
        this.logger.error(logMessage);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  logRequest(
    method: string,
    endpoint: string,
    userId?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.info(`${method} ${endpoint}`, {
      method,
      endpoint,
      userId,
      additionalData,
    });
  }

  logResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime?: number,
  ): void {
    this.info(
      `${method} ${endpoint} - ${statusCode}${responseTime ? ` (${responseTime}ms)` : ''}`,
      {
        method,
        endpoint,
        statusCode,
        responseTime,
      },
    );
  }

  logKafkaMessage(topic: string, payload: any, result?: any): void {
    this.info(`Kafka message sent to ${topic}`, {
      topic,
      payload,
      result,
    });
  }

  logKafkaError(topic: string, payload: any, error: any): void {
    this.error(`Kafka message failed for ${topic}`, {
      topic,
      payload,
      error: error.message || error,
    });
  }

  private formatLogMessage(message: string, context?: LogContext): string {
    if (!context) return message;

    const contextParts: string[] = [];

    if (context.method && context.endpoint) {
      contextParts.push(`${context.method} ${context.endpoint}`);
    }

    if (context.userId) {
      contextParts.push(`User: ${context.userId}`);
    }

    if (context.requestId) {
      contextParts.push(`Request: ${context.requestId}`);
    }

    const contextString =
      contextParts.length > 0 ? ` [${contextParts.join(' | ')}]` : '';
    return `${message}${contextString}`;
  }
}
