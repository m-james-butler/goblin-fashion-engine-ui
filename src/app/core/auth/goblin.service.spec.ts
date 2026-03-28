import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from 'firebase/auth';

import { GoblinService } from './goblin.service';
import { AuthService } from './auth.service';

describe('GoblinService', () => {
  let service: GoblinService;
  let userSubject: BehaviorSubject<User | null>;

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(null);

    TestBed.configureTestingModule({
      providers: [
        GoblinService,
        {
          provide: AuthService,
          useValue: {
            user$: userSubject.asObservable(),
          },
        },
      ],
    });

    service = TestBed.inject(GoblinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit null when auth has no user', async () => {
    userSubject.next(null);

    const result = await firstValueFrom(service.getCurrentGoblin());

    expect(result).toBeNull();
  });

  it('should map an authenticated user to the Goblin contract', async () => {
    userSubject.next({
      uid: 'GBL-001',
      displayName: 'Snarkle',
      email: 'snarkle@goblin.fashion',
    } as User);

    const result = await firstValueFrom(service.getCurrentGoblin());

    expect(result).toEqual({
      id: 'GBL-001',
      displayName: 'Snarkle',
      email: 'snarkle@goblin.fashion',
      defaultHoardId: 'HRD-001',
    });
  });
});
