import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';

import { HoroCommonModule } from '../horo-common/horo-common.module';
import { PromittorComponent } from '../promittor/promittor.component';

import { HistoricalPageRoutingModule } from './historical-routing.module';
import { HistoricalPage } from './historical.page';
import { ImageComponent } from './image/image.component';
import { DetailComponent } from './detail/detail.component';
import { HistoricalPromittorComponent } from './promittor/promittor.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonAlert,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonFooter,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToggle,
    IonToolbar,
    HistoricalPageRoutingModule,
    HoroCommonModule,
    PromittorComponent,
  ],
  declarations: [
    HistoricalPage,
    ImageComponent,
    DetailComponent,
    HistoricalPromittorComponent,
  ],
})
export class HistoricalPageModule {}
