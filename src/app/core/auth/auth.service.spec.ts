import { TestBed } from '@angular/core/testing';
import { AuthError, User } from 'firebase/auth';

import { AuthService } from './auth.service';
import { AppLoggerService } from '../logging/app-logger.service';
import { FirebaseAuthGatewayService } from './firebase-auth-gateway.service';
import { environment } from '../../../environments/environments';

describe('AuthService', () => {
  let authStateCallback: (user: User | null) => void;
  let loggerSpy: jasmine.SpyObj<AppLoggerService>;
  let gatewaySpy: jasmine.SpyObj<FirebaseAuthGatewayService>;
  let usernameEmailDomain: string;

  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj<AppLoggerService>('AppLoggerService', [
      'debug',
      'info',
      'warn',
    ]);
    gatewaySpy = jasmine.createSpyObj<FirebaseAuthGatewayService>('FirebaseAuthGatewayService', [
      'getCurrentUserIdToken',
      'onAuthStateChanged',
      'signInWithGoogle',
      'signInWithPassword',
      'signOut',
    ]);
    gatewaySpy.onAuthStateChanged.and.callFake((callback) => {
      authStateCallback = callback;
    });
    usernameEmailDomain = environment.auth.usernameEmailDomain;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AppLoggerService, useValue: loggerSpy },
        { provide: FirebaseAuthGatewayService, useValue: gatewaySpy },
      ],
    });
  });

  afterEach(() => {
    environment.auth.usernameEmailDomain = usernameEmailDomain;
  });

  it('tracks auth state changes', () => {
    const service = TestBed.inject(AuthService);
    const user = {
      uid: 'GBL-001',
      providerData: [{ providerId: 'password' }],
    } as User;

    authStateCallback(user);

    expect(service.currentUser).toBe(user);
    expect(loggerSpy.info).toHaveBeenCalledWith('auth.state.changed', {
      isAuthenticated: true,
      providerCount: 1,
    });
  });

  it('logs anonymous auth state changes', () => {
    const service = TestBed.inject(AuthService);

    authStateCallback(null);

    expect(service.currentUser).toBeNull();
    expect(loggerSpy.info).toHaveBeenCalledWith('auth.state.changed', {
      isAuthenticated: false,
      providerCount: 0,
    });
  });

  it('resolves usernames before password login', async () => {
    gatewaySpy.signInWithPassword.and.resolveTo({});
    const service = TestBed.inject(AuthService);

    await service.loginWithPassword('snarkle', 'pw');

    expect(gatewaySpy.signInWithPassword).toHaveBeenCalledWith(
      'snarkle@goblin.fashion',
      'pw',
    );
    expect(loggerSpy.info).toHaveBeenCalledWith('auth.password.login.succeeded', {
      usedUsernameInput: true,
    });
  });

  it('keeps email credentials unchanged before password login', async () => {
    gatewaySpy.signInWithPassword.and.resolveTo({});
    const service = TestBed.inject(AuthService);

    await service.loginWithPassword('snarkle@example.com', 'pw');

    expect(gatewaySpy.signInWithPassword).toHaveBeenCalledWith(
      'snarkle@example.com',
      'pw',
    );
  });

  it('logs password login failures with auth code when present', async () => {
    const error = { code: 'auth/bad-password' } as AuthError;
    gatewaySpy.signInWithPassword.and.rejectWith(error);
    const service = TestBed.inject(AuthService);

    await expectAsync(service.loginWithPassword('snarkle', 'pw')).toBeRejectedWith(error);

    expect(loggerSpy.warn).toHaveBeenCalledWith('auth.password.login.failed', {
      usedUsernameInput: true,
      authCode: 'auth/bad-password',
    });
  });

  it('rejects blank credentials before password login', async () => {
    const service = TestBed.inject(AuthService);

    await expectAsync(service.loginWithPassword('   ', 'pw')).toBeRejectedWithError(
      'Username or email is required.',
    );
  });

  it('rejects username login when username domain is not configured', async () => {
    environment.auth.usernameEmailDomain = '   ';
    const service = TestBed.inject(AuthService);

    await expectAsync(service.loginWithPassword('snarkle', 'pw')).toBeRejectedWithError(
      'Username login is not configured for this environment.',
    );
  });

  it('returns null token when there is no current firebase user', async () => {
    gatewaySpy.getCurrentUserIdToken.and.resolveTo(null);
    const service = TestBed.inject(AuthService);

    await expectAsync(service.getCurrentUserIdToken(true)).toBeResolvedTo(null);

    expect(loggerSpy.debug).toHaveBeenCalledWith('auth.token.requested.without.user', {
      forceRefresh: true,
    });
  });

  it('returns current user token when firebase has a user', async () => {
    gatewaySpy.getCurrentUserIdToken.and.resolveTo('id-token');
    const service = TestBed.inject(AuthService);

    await expectAsync(service.getCurrentUserIdToken()).toBeResolvedTo('id-token');

    expect(gatewaySpy.getCurrentUserIdToken).toHaveBeenCalledWith(false);
  });

  it('logs token failures with unknown code when error has no code', async () => {
    const error = new Error('token failed');
    gatewaySpy.getCurrentUserIdToken.and.rejectWith(error);
    const service = TestBed.inject(AuthService);

    await expectAsync(service.getCurrentUserIdToken()).toBeRejectedWith(error);

    expect(loggerSpy.warn).toHaveBeenCalledWith('auth.token.requested.failed', {
      forceRefresh: false,
      authCode: 'unknown',
    });
  });

  it('logs google login and logout success', async () => {
    gatewaySpy.signInWithGoogle.and.resolveTo({});
    gatewaySpy.signOut.and.resolveTo();
    const service = TestBed.inject(AuthService);

    await service.loginWithGoogle();
    await service.logout();

    expect(loggerSpy.info).toHaveBeenCalledWith('auth.google.login.succeeded');
    expect(loggerSpy.info).toHaveBeenCalledWith('auth.logout.succeeded');
  });

  it('logs google login failures with unknown auth code', async () => {
    const error = new Error('popup failed');
    gatewaySpy.signInWithGoogle.and.rejectWith(error);
    const service = TestBed.inject(AuthService);

    await expectAsync(service.loginWithGoogle()).toBeRejectedWith(error);

    expect(loggerSpy.warn).toHaveBeenCalledWith('auth.google.login.failed', {
      authCode: 'unknown',
    });
  });
});
