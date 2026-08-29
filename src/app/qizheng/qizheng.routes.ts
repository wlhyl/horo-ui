import { Routes } from '@angular/router';

import { Path } from './path';

import { QizhengPage } from './qizheng.page';
import { HoroComponent } from './horo/horo.component';
import { QizhengHoroDetailComponent } from './horo/detail/detail.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';

export const routes: Routes = [
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
  {
    path: Path.Knowledge,
    component: KnowledgeComponent,
  },
];
