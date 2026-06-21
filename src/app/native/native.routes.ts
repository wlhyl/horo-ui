import { Routes } from '@angular/router';
import { Path } from './enum';
import { NativePage } from './native.page';
import { ImageComponent } from './image/image.component';
import { NoteComponent } from './note/note.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';

export const routes: Routes = [
  { path: '', component: NativePage },
  { path: Path.Image, component: ImageComponent },
  { path: Path.Image + '/' + Path.Note, component: NoteComponent },
  { path: Path.Knowledge, component: KnowledgeComponent },
];