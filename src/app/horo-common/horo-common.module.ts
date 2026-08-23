import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonAlert,
  IonAvatar,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

// 数据双向绑定
import { FormsModule } from '@angular/forms';

import { DateTimeComponent } from './date-time/date-time.component';
import { TimeZoneComponent } from './time-zone/time-zone.component';

import { GeoComponent } from './geo/geo.component';
import { MapComponent } from './geo/map.component';
import { DateTimeChangeComponent } from './date-time-change/date-time-change.component';
import { ArchiveSelectionModalComponent } from './archive-selection-modal/archive-selection-modal.component';
import { ArchiveSelectorComponent } from './archive-selector/archive-selector.component';
import { HistoricalArchiveSelectionModalComponent } from './historical-archive-selection-modal/historical-archive-selection-modal.component';
import { HistoricalArchiveSelectorComponent } from './historical-archive-selector/historical-archive-selector.component';

@NgModule({
  declarations: [
    DateTimeComponent,
    TimeZoneComponent,
    GeoComponent,
    MapComponent,
    DateTimeChangeComponent,
    ArchiveSelectionModalComponent,
    ArchiveSelectorComponent,
    HistoricalArchiveSelectionModalComponent,
    HistoricalArchiveSelectorComponent,
  ],
  imports: [CommonModule, IonAlert, IonAvatar, IonButton, IonButtons, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonInput, IonItem, IonLabel, IonList, IonModal, IonPicker, IonPickerColumn, IonPickerColumnOption, IonRadio, IonRadioGroup, IonRow, IonSearchbar, IonSelect, IonSelectOption, IonSpinner, IonText, IonTitle, IonToolbar, FormsModule],
  exports: [
    FormsModule,
    DateTimeComponent,
    TimeZoneComponent,
    GeoComponent,
    MapComponent,
    DateTimeChangeComponent,
    ArchiveSelectorComponent,
    HistoricalArchiveSelectorComponent,
  ],
})
export class HoroCommonModule {}
