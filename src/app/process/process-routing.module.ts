import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProcessPage } from './process.page';

import { ProcessName } from './enum/process';

import { ProfectionComponent } from './profection/profection.component';
import { ReturnComponent } from './return/return.component';
import { CompareComponent } from './compare/compare.component';
import { FirdariaComponent } from './firdaria/firdaria.component';
import { DetailComponent as ReturnDetailComponent } from './return/detail/detail.component';
import { DetailComponent as ComparisonDetailComponent } from './compare/detail/detail.component';
import { Path } from './enum/path';

const routes: Routes = [
  {
    path: '',
    component: ProcessPage,
  },
  {
    path: ProcessName.path(ProcessName.Profection),
    component: ProfectionComponent,
  },
  {
    path: ProcessName.path(ProcessName.Firdaria),
    component: FirdariaComponent,
  },
  {
    path: ProcessName.path(ProcessName.Transit),
    component: CompareComponent,
    data: { process_name: ProcessName.Transit },
  },
  {
    path: ProcessName.path(ProcessName.SolarcomparNative),
    component: CompareComponent,
    data: { process_name: ProcessName.SolarcomparNative },
  },
  {
    path: ProcessName.path(ProcessName.NativecomparSolar),
    component: CompareComponent,
    data: { process_name: ProcessName.NativecomparSolar },
  },
  {
    path: ProcessName.path(ProcessName.LunarcomparNative),
    component: CompareComponent,
    data: { process_name: ProcessName.LunarcomparNative },
  },
  {
    path: ProcessName.path(ProcessName.NativecomparLunar),
    component: CompareComponent,
    data: { process_name: ProcessName.NativecomparLunar },
  },

  {
    path: ProcessName.path(ProcessName.SolarReturn),
    component: ReturnComponent,
    data: { process_name: ProcessName.SolarReturn },
  },

  {
    path: ProcessName.path(ProcessName.LunarReturn),
    component: ReturnComponent,
    data: { process_name: ProcessName.LunarReturn },
  },

  {
    path: Path.SolarReturn + '/' + Path.ReturnDetails,
    component: ReturnDetailComponent,
  },

  {
    path: Path.LunarReturn + '/' + Path.ReturnDetails,
    component: ReturnDetailComponent,
  },

  {
    path: Path.Transit + '/' + Path.ComparisonDetails,
    component: ComparisonDetailComponent,
  },

  {
    path: Path.SolarcomparNative + '/' + Path.ComparisonDetails,
    component: ComparisonDetailComponent,
  },

  {
    path: Path.NativecomparSolar + '/' + Path.ComparisonDetails,
    component: ComparisonDetailComponent,
  },

  {
    path: Path.LunarcomparNative + '/' + Path.ComparisonDetails,
    component: ComparisonDetailComponent,
  },

  {
    path: Path.NativecomparLunar + '/' + Path.ComparisonDetails,
    component: ComparisonDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessPageRoutingModule {}
