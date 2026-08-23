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
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { HoroCommonModule } from '../horo-common/horo-common.module';

import { QizhengPageRoutingModule } from './qizheng-routing.module';

import { QizhengPage } from './qizheng.page';
import { HoroComponent } from './horo/horo.component';
import { QizhengHoroDetailComponent } from './horo/detail/detail.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';

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
    IonCardSubtitle,
    IonCardTitle,
    IonCheckbox,
    IonCol,
    IonContent,
    IonFooter,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRadio,
    IonRadioGroup,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar,
    QizhengPageRoutingModule,
    HoroCommonModule,
  ],
  declarations: [
    QizhengPage,
    HoroComponent,
    QizhengHoroDetailComponent,
    KnowledgeComponent,
  ],
})
export class QizhengPageModule {}
