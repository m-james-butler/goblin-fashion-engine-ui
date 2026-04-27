import { AppLoggerService } from './app-logger.service';

describe('AppLoggerService', () => {
  const karmaMarker = (window as { __karma__?: unknown }).__karma__;

  let debugSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let warnSpy: jasmine.Spy;
  let errorSpy: jasmine.Spy;

  beforeEach(() => {
    delete (window as { __karma__?: unknown }).__karma__;
    debugSpy = spyOn(console, 'debug');
    infoSpy = spyOn(console, 'info');
    warnSpy = spyOn(console, 'warn');
    errorSpy = spyOn(console, 'error');
  });

  afterEach(() => {
    (window as { __karma__?: unknown }).__karma__ = karmaMarker;
  });

  it('writes each log level with timestamp and sanitized context', () => {
    const logger = new AppLoggerService();
    const error = new Error('bad password');

    logger.debug('debug.event', { token: 'secret-token' });
    logger.info('info.event', { email: 'person@example.com' });
    logger.warn('warn.event', { problem: error });
    logger.error('error.event', { count: 1 });

    expect(debugSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        level: 'debug',
        event: 'debug.event',
        context: { token: '[REDACTED]' },
      }),
    );
    expect(infoSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        level: 'info',
        context: { email: '[REDACTED]' },
      }),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        level: 'warn',
        context: { problem: { name: 'Error', message: 'bad password' } },
      }),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        level: 'error',
        context: { count: 1 },
      }),
    );
  });

  it('omits context when none is provided', () => {
    const logger = new AppLoggerService();

    logger.info('info.event');

    expect(infoSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        event: 'info.event',
        context: undefined,
      }),
    );
  });

  it('redacts all sensitive key variants while preserving safe context', () => {
    const logger = new AppLoggerService();

    logger.info('sensitive.event', {
      password: 'bad-password',
      secretValue: 'secret',
      authorizationHeader: 'Bearer token',
      username: 'person',
      safeValue: 'visible',
    });

    expect(infoSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        event: 'sensitive.event',
        context: {
          password: '[REDACTED]',
          secretValue: '[REDACTED]',
          authorizationHeader: '[REDACTED]',
          username: '[REDACTED]',
          safeValue: 'visible',
        },
      }),
    );
  });

  it('stays quiet in the karma runtime', () => {
    (window as { __karma__?: unknown }).__karma__ = {};
    const logger = new AppLoggerService();

    logger.error('hidden.event');

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
