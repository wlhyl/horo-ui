import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArchivePageRoutingModule } from './archive-routing.module';

import { ArchivePage } from './archive.page';
import { EditComponent } from './edit/edit.component';
import { HoroCommonModule } from '../horo-common/horo-common.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArchivePageRoutingModule,
    HoroCommonModule,
  ],
  declarations: [ArchivePage, EditComponent],
})
export class ArchivePageModule {}
