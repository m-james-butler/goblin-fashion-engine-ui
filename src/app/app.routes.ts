import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page/dashboard-page.component').then(
        (module) => module.DashboardPageComponent,
      ),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/hoard-view/hoard-view.component').then(
        (module) => module.HoardViewComponent,
      ),
  },
  { path: 'hoard', redirectTo: 'inventory', pathMatch: 'full' },
  {
    path: 'outfits',
    loadComponent: () =>
      import('./features/outfits/clutter-mash/clutter-mash.component').then(
        (module) => module.ClutterMashComponent,
      ),
  },
  {
    path: 'rules',
    loadComponent: () =>
      import('./features/rules/quirk-logic/quirk-logic.component').then(
        (module) => module.QuirkLogicComponent,
      ),
  },
];
