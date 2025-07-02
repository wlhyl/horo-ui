import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Path } from './path';

import { QizhengPage } from './qizheng.page';
import { HoroComponent } from './horo/horo.component';
import { QizhengHoroDetailComponent } from './horo/detail/detail.component'; // 导入新的组件

const routes: Routes = [
  {
    path: Path.Input,
    component: QizhengPage,
  },
  {
    path: Path.Horo,
    component: HoroComponent,
  },
  {
    path: Path.Horo + '/' + Path.HoroDetail, // 新增的详情路由
    component: QizhengHoroDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QizhengPageRoutingModule {}
