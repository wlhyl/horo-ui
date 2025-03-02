import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HoroCommonModule } from '../horo-common/horo-common.module';

import { NativePageRoutingModule } from './native-routing.module';
import { NativePage } from './native.page';
import { ImageComponent } from './image/image.component';
import { DetailComponent } from './detail/detail.component';
import { NoteComponent } from './note/note.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NativePageRoutingModule,
    HoroCommonModule,
  ],
  declarations: [NativePage, ImageComponent, DetailComponent, NoteComponent],
})
export class NativePageModule {}
