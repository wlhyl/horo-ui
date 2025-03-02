import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth/auth.guard';

import { Path } from './type/enum/path';

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
      import('./native/native.module').then((m) => m.NativePageModule),
  },
  {
    path: Path.Process,
    loadChildren: () =>
      import('./process/process.module').then((m) => m.ProcessPageModule),
  },
  {
    path: Path.Qizheng,
    loadChildren: () =>
      import('./qizheng/qizheng.module').then((m) => m.QizhengPageModule),
  },
  {
    path: Path.Clean,
    loadChildren: () =>
      import('./clean/clean.module').then((m) => m.CleanPageModule),
  },
  {
    path: Path.Power,
    loadChildren: () =>
      import('./power/power.module').then((m) => m.PowerPageModule),
  },
  {
    path: Path.User,
    loadChildren: () =>
      import('./user/user.module').then((m) => m.UserPageModule),
  },
  {
    path: Path.Archive,
    loadChildren: () =>
      import('./archive/archive.module').then((m) => m.ArchivePageModule),
    canMatch: [authGuard],
  },
  {
    path: Path.About,
    loadChildren: () =>
      import('./about/about.module').then((m) => m.AboutPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
