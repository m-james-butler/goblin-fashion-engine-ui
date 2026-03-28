import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-page/dashboard-page.component').then(
        (module) => module.DashboardPageComponent,
      ),
  },
  {
    path: 'inventory',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventory/hoard-view/hoard-view.component').then(
        (module) => module.HoardViewComponent,
      ),
  },
  { path: 'hoard', redirectTo: 'inventory', pathMatch: 'full' },
  {
    path: 'outfits',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/outfits/clutter-mash/clutter-mash.component').then(
        (module) => module.ClutterMashComponent,
      ),
  },
  {
    path: 'rules',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/rules/quirk-logic/quirk-logic.component').then(
        (module) => module.QuirkLogicComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
