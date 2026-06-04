import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HoroCommonModule } from '../horo-common/horo-common.module';

import { HistoricalPageRoutingModule } from './historical-routing.module';
import { HistoricalPage } from './historical.page';
import { ImageComponent } from './image/image.component';
import { DetailComponent } from './detail/detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoricalPageRoutingModule,
    HoroCommonModule,
  ],
  declarations: [
    HistoricalPage,
    ImageComponent,
    DetailComponent,
  ],
})
export class HistoricalPageModule {}
