import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProcessPageRoutingModule } from './process-routing.module';

import { HoroCommonModule } from '../horo-common/horo-common.module';

import { ProcessPage } from './process.page';
import { ProfectionComponent } from './profection/profection.component';
import { MedievalProfectionComponent } from './medieval_profection/medieval_profection.component';
import { FirdariaComponent } from './firdaria/firdaria.component';
import { DirectionComponent } from './direction/direction.component';
import { QuadrantProcessComponent } from './quadrant_process/quadrant_process.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProcessPageRoutingModule,
    HoroCommonModule,
  ],
  declarations: [
    ProcessPage,
    ProfectionComponent,
    MedievalProfectionComponent,
    FirdariaComponent,
    DirectionComponent,
    QuadrantProcessComponent,
  ],
  exports: [
    ProfectionComponent,
    MedievalProfectionComponent,
    FirdariaComponent,
    DirectionComponent,
    QuadrantProcessComponent,
  ],
})
export class ProcessPageModule {}
