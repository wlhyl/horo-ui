import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Path } from './path';
import { HoroRequest, ProcessRequest } from '../type/interface/request-data';
import { addIcons } from 'ionicons';
import { bookOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { HoroCommonModule } from '../horo-common/horo-common.module';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

@Component({
  selector: 'app-qizheng',
  templateUrl: './qizheng.page.html',
  styleUrls: ['./qizheng.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    HoroCommonModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonRow,
    IonTitle,
    IonToolbar,
  ],
})
export class QizhengPage implements OnInit {
  horoData: HoroRequest = structuredClone(this.storage.horoData);
  processData: ProcessRequest = structuredClone(this.storage.processData);
  isNanLuoBeiJi: boolean = this.storage.isNanLuoBeiJi;

  title = '七政四余';
  Path = Path;

  constructor(
    private storage: HoroStorageService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    addIcons({ bookOutline });
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  getProcess() {
    this.storage.horoData = structuredClone(this.horoData);
    this.storage.processData = structuredClone(this.processData);
    this.storage.isNanLuoBeiJi = this.isNanLuoBeiJi;

    this.router.navigate([Path.Horo], {
      relativeTo: this.route,
    });
  }

  onArchiveSelected(horoData: HoroRequest): void {
    this.horoData = horoData;
  }
}
