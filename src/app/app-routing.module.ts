import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth/auth.guard';

import { Path } from './type/enum/path';
import { Mode } from './native/enum';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: Path.Home,
    pathMatch: 'full',
  },
  {
    path: Path.Native,
    loadChildren: () =>
      import('./native/native.routes').then((m) => m.routes),
    data: { mode: Mode.Native },
  },
  {
    path: Path.Event,
    loadChildren: () =>
      import('./native/native.routes').then((m) => m.routes),
    data: { mode: Mode.Event },
  },
  {
    path: Path.Process,
    loadChildren: () =>
      import('./process/process.routes').then((m) => m.routes),
  },
  {
    path: Path.Qizheng,
    loadChildren: () =>
      import('./qizheng/qizheng.routes').then((m) => m.routes),
  },
  {
    path: Path.Clean,
    loadComponent: () =>
      import('./clean/clean.page').then((m) => m.CleanPage),
  },
  {
    path: Path.Power,
    loadComponent: () =>
      import('./power/power.page').then((m) => m.PowerPage),
  },
  {
    path: Path.User,
    loadComponent: () =>
      import('./user/user.page').then((m) => m.UserPage),
  },
  {
    path: Path.Archive,
    loadChildren: () =>
      import('./archive/archive.module').then((m) => m.ArchivePageModule),
    canMatch: [authGuard],
  },
  {
    path: Path.About,
    loadComponent: () =>
      import('./about/about.page').then((m) => m.AboutPage),
  },
  {
    path: Path.Synastry,
    loadChildren: () =>
      import('./synastry/synastry.module').then((m) => m.SynastryModule),
  },
  {
    path: Path.Historical,
    loadChildren: () =>
      import('./historical/historical.module').then((m) => m.HistoricalPageModule),
  },
  {
    path: Path.Workbench,
    loadComponent: () =>
      import('./workbench/workbench.page').then((m) => m.WorkbenchPage),
  },
  {
    path: Path.Promittor,
    loadChildren: () =>
      import('./promittor/promittor.routes').then((m) => m.routes),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
