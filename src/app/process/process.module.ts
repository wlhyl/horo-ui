import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProcessPageRoutingModule } from './process-routing.module';

import { HoroCommonModule } from '../horo-common/horo-common.module';

import { ProcessPage } from './process.page';
import { ProfectionComponent } from './profection/profection.component';
import { ReturnComponent } from './return/return.component';
import { CompareComponent } from './compare/compare.component';
import { FirdariaComponent } from './firdaria/firdaria.component';
import { DirectionComponent } from './direction/direction.component';
import { QuadrantProcessComponent } from './quadrant_process/quadrant_process.component';
import { DetailComponent as ReturnDetailComponent } from './return/detail/detail.component';
import { DetailComponent as ComparisonDetailComponent } from './compare/detail/detail.component';

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
    ReturnComponent,
    CompareComponent,
    FirdariaComponent,
    DirectionComponent,
    QuadrantProcessComponent,
    ReturnDetailComponent,
    ComparisonDetailComponent,
  ],
})
export class ProcessPageModule {}
