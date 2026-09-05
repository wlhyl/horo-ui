import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistoricalPage } from './historical.page';
import { ImageComponent } from './image/image.component';
import { DetailComponent } from './detail/detail.component';
import { HistoricalPromittorComponent } from './promittor/promittor.component';
import { Path } from './enum';

const routes: Routes = [
  {
    path: '',
    component: HistoricalPage,
  },
  { path: Path.Image, component: ImageComponent },
  { path: Path.Image + '/' + Path.Detail, component: DetailComponent },
  {
    path: Path.Image + '/' + Path.Promittor,
    component: HistoricalPromittorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoricalPageRoutingModule {}
