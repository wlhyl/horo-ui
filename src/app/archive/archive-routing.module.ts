import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArchivePage } from './archive.page';
import { EditComponent } from './edit/edit.component';

import {Path} from './enum';

const routes: Routes = [
  {
    path: '',
    component: ArchivePage,
  },
  {
    path: Path.Edit,
    component: EditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArchivePageRoutingModule {}
