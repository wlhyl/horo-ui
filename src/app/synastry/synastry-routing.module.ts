import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SynastryInputComponent } from './synastry-input/synastry-input.component';
import { SynastryComponent } from './synastry/synastry.component';
import { PlanetFriendshipComponent } from './planet-friendship/planet-friendship.component';
import { QizhengSynastryComponent } from './qizheng-synastry/qizheng-synastry.component';
import { Path } from './enum/path';

const routes: Routes = [
  {
    path: '',
    component: SynastryInputComponent,
  },
  {
    path: Path.Horo,
    component: SynastryComponent,
  },
  {
    path: Path.Horo + '/' + Path.PlanetFriendship,
    component: PlanetFriendshipComponent,
  },
  {
    path: Path.Qizheng,
    component: QizhengSynastryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SynastryRoutingModule { }
