import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HoroCommonModule } from '../horo-common/horo-common.module';

import { SynastryRoutingModule } from './synastry-routing.module';

import { SynastryInputComponent } from './synastry-input/synastry-input.component';
import { SynastryComponent } from './synastry/synastry.component';
import { PlanetFriendshipComponent } from './planet-friendship/planet-friendship.component';
import { QizhengSynastryComponent } from './qizheng-synastry/qizheng-synastry.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SynastryRoutingModule,
    HoroCommonModule,
  ],
  declarations: [
    SynastryInputComponent,
    SynastryComponent,
    PlanetFriendshipComponent,
    QizhengSynastryComponent,
  ],
})
export class SynastryModule { }
