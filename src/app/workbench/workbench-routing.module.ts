import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbenchPage } from './workbench.page';

const routes: Routes = [
  {
    path: '',
    component: WorkbenchPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkbenchPageRoutingModule {}
