import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { ProcessName } from './enum/process';
import { DirectionMethod } from './enum/direction-method';
import { ArcToDateMethod } from './enum/arc-to-date-method';
import { ProfectionArcToDateMethod } from './enum/profection-arc-to-date-method';
import { DailyDirectionMethod } from './enum/daily-direction-method';
import { ActivatedRoute, Router } from '@angular/router';
import { Horoconfig } from '../services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { HoroRequest, ProcessRequest } from '../type/interface/request-data';
import { HoroCommonModule } from '../horo-common/horo-common.module';
import { isInChineseDST } from '../utils/dst/dst';

@Component({
  selector: 'app-process',
  templateUrl: './process.page.html',
  styleUrls: ['./process.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HoroCommonModule],
})
export class ProcessPage implements OnInit {
  readonly houses: Array<string> = this.config.houses;
  horaData: HoroRequest = structuredClone(this.storage.horoData);
  processData: ProcessRequest = structuredClone(this.storage.processData);
  title = '推运';

  currentProcess = this.processData.process_name;

  get processName(): string {
    return ProcessName.name(this.currentProcess);
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: HoroStorageService,
    private config: Horoconfig,
    private titleService: Title,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  get processNameEnum(): typeof ProcessName {
    return ProcessName;
  }

  getProcess() {
    this.storage.horoData = structuredClone(this.horaData);
    this.storage.processData = structuredClone(this.processData);
    const path = ProcessName.path(this.processData.process_name);
    this.router.navigate([path], {
      relativeTo: this.route,
    });
  }

  async onNativeDateChange(): Promise<void> {
    const date = this.horaData.date;
    if (date.tz !== 8) return;
    if (!isInChineseDST({
      year: date.year,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
    })) return;
    const alert = await this.alertController.create({
      header: '夏令时提示',
      message: `${date.year}年${date.month}月${date.day}日处于中国夏令时实施期间，请确认是否需要勾选夏令时。`,
      buttons: ['确定'],
    });
    await alert.present();
  }

  processOptions = [
    ProcessName.Firdaria,
    ProcessName.Profection,
    ProcessName.MedievalProfection,
    ProcessName.CustomDayProfection,
    ProcessName.Direction,
    ProcessName.DailyDirection,
    ProcessName.SolarArc,
    ProcessName.QuadrantProcess,
    ProcessName.Transit,
    ProcessName.SolarReturn,
    ProcessName.LunarReturn,
    ProcessName.DailyReturn,
    ProcessName.SolarcomparNative,
    ProcessName.NativecomparSolar,
    ProcessName.LunarcomparNative,
    ProcessName.NativecomparLunar,
    ProcessName.DailycomparNative,
    ProcessName.NativecomparDaily,
  ].map((process_name) => {
    return {
      text: ProcessName.name(process_name),
      value: process_name,
    };
  });

  directionMethodOptions = Object.values(DirectionMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: DirectionMethod.name(method),
      value: method,
    }));

  arcToDateMethodOptions = Object.values(ArcToDateMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: ArcToDateMethod.name(method),
      value: method,
    }));

  dailyDirectionMethodOptions = Object.values(DailyDirectionMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: DailyDirectionMethod.name(method),
      value: method,
    }));

  profectionArcToDateMethodOptions = Object.values(ProfectionArcToDateMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: ProfectionArcToDateMethod.name(method),
      value: method,
    }));

  onIonChange(event: CustomEvent) {
    this.currentProcess = event.detail.value;
  }

  onDidDismiss(event: CustomEvent) {
    if (event.detail.data === null) {
      this.currentProcess = this.processData.process_name;
    } else {
      this.processData = {
        ...this.processData,
        process_name: event.detail.data,
      };
    }
  }

  onArchiveSelected(horoData: HoroRequest): void {
    this.horaData = horoData;
  }
}
