import { Routes } from '@angular/router';
import { Path } from '../native/enum';
import { NativePage } from '../native/native.page';
import { KnowledgeComponent } from '../native/knowledge/knowledge.component';
import { PromittorComponent } from './promittor.component';

export const routes: Routes = [
  { path: '', component: NativePage },
  { path: Path.Image, component: PromittorComponent },
  { path: Path.Knowledge, component: KnowledgeComponent },
];
