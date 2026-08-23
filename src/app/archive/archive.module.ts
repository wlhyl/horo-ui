import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonAlert,
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonText,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';

import { ArchivePageRoutingModule } from './archive-routing.module';

import { ArchivePage } from './archive.page';
import { EditComponent } from './edit/edit.component';
import { HoroCommonModule } from '../horo-common/horo-common.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonAlert,
    IonAvatar,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonPicker,
    IonPickerColumn,
    IonPickerColumnOption,
    IonRadio,
    IonRadioGroup,
    IonSearchbar,
    IonText,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar,
    ArchivePageRoutingModule,
    HoroCommonModule,
  ],
  declarations: [ArchivePage, EditComponent],
})
export class ArchivePageModule {}
