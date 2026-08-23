import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonIcon, IonLabel, IonTitle, IonToolbar, HomePageRoutingModule],
  declarations: [HomePage],
})
export class HomePageModule {}
