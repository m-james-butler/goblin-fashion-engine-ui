import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environments';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class AppLoggerService {
  private readonly enabled = !environment.production && !this.isTestRuntime();
  private readonly levelOrder: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };
  private readonly minimumLevel: LogLevel = 'debug';

  debug(event: string, context?: LogContext): void {
    this.log('debug', event, context);
  }

  info(event: string, context?: LogContext): void {
    this.log('info', event, context);
  }

  warn(event: string, context?: LogContext): void {
    this.log('warn', event, context);
  }

  error(event: string, context?: LogContext): void {
    this.log('error', event, context);
  }

  private log(level: LogLevel, event: string, context?: LogContext): void {
    if (!this.enabled || !this.shouldLog(level)) {
      return;
    }

    const payload = {
      at: new Date().toISOString(),
      level,
      event,
      context: this.sanitizeContext(context),
    };

    switch (level) {
      case 'debug':
        console.debug(payload);
        break;
      case 'info':
        console.info(payload);
        break;
      case 'warn':
        console.warn(payload);
        break;
      case 'error':
        console.error(payload);
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder[level] >= this.levelOrder[this.minimumLevel];
  }

  private isTestRuntime(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return Boolean((window as { __karma__?: unknown }).__karma__);
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    const sanitizedEntries = Object.entries(context).map(([key, value]) => {
      if (this.isSensitiveKey(key)) {
        return [key, '[REDACTED]'];
      }

      if (value instanceof Error) {
        return [
          key,
          {
            name: value.name,
            message: value.message,
          },
        ];
      }

      return [key, value];
    });

    return Object.fromEntries(sanitizedEntries);
  }

  private isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase();
    return (
      normalized.includes('token') ||
      normalized.includes('password') ||
      normalized.includes('secret') ||
      normalized.includes('authorization') ||
      normalized.includes('email') ||
      normalized.includes('username')
    );
  }
}
