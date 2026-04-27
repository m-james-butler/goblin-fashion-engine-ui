import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from 'firebase/auth';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let userSubject: BehaviorSubject<User | null>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(null);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            user$: userSubject.asObservable(),
          },
        },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('allows authenticated users', async () => {
    userSubject.next({ uid: 'GBL-001' } as User);

    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as never, { url: '/inventory' } as never) as never),
    );

    expect(result).toBeTrue();
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects anonymous users to login with return url', async () => {
    const tree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(tree);

    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as never, { url: '/inventory' } as never) as never),
    );

    expect(result).toBe(tree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirectTo: '/inventory' },
    });
  });
});
