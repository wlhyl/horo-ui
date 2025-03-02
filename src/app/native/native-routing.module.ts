import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NativePage } from './native.page';
import { ImageComponent } from './image/image.component';
import { DetailComponent } from './detail/detail.component';
import { NoteComponent } from './note/note.component';
import { Path } from './enum';

const routes: Routes = [
  {
    path: '',
    component: NativePage,
  },
  { path: Path.Image, component: ImageComponent },
  { path: Path.Image + '/' + Path.Detail, component: DetailComponent },
  { path: Path.Image + '/' + Path.Note, component: NoteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NativePageRoutingModule {}
