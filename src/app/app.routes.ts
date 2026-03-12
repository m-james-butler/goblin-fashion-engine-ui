import { Routes } from '@angular/router';
import { DashboardPageComponent } from './features/dashboard/dashboard-page/dashboard-page.component';
import { HoardViewComponent } from './features/inventory/hoard-view/hoard-view.component';
import { ClutterMashComponent } from './features/outfits/clutter-mash/clutter-mash.component';
import { QuirkLogicComponent } from './features/rules/quirk-logic/quirk-logic.component';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'inventory', component: HoardViewComponent },
  { path: 'hoard', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'outfits', component: ClutterMashComponent },
  { path: 'rules', component: QuirkLogicComponent },
];
