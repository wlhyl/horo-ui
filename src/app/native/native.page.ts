import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ViewWillEnter } from '@ionic/angular';
import { HoroCommonModule } from '../horo-common/horo-common.module';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { Horoconfig } from '../services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { Path, Mode } from './enum';
import { HoroRequest } from '../type/interface/request-data';
import { isInChineseDST } from '../utils/dst/dst';

@Component({
  selector: 'app-native',
  templateUrl: './native.page.html',
  styleUrls: ['./native.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HoroCommonModule, RouterLink],
})
export class NativePage implements OnInit, ViewWillEnter {
  readonly houses: ReadonlyArray<string> = this.config.houses;
  horoData: HoroRequest = {
    id: 0,
    name: '',
    sex: true,
    date: {
      year: 2000,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: '',
    geo: {
      long: 0,
      lat: 0,
    },
    house: '',
  };

  path = Path;
  modeEnum = Mode;
  mode = Mode.Native;
  title: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: HoroStorageService,
    private config: Horoconfig,
    private titleService: Title,
    private alertController: AlertController,
  ) {
    this.mode = this.route.snapshot.data?.['mode'] || Mode.Native;
    this.title = this.mode === Mode.Event ? '天象盘' : '本命星盘';
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  ionViewWillEnter(): void {
    this.horoData = structuredClone(
      this.mode === Mode.Event ? this.storage.eventData : this.storage.horoData,
    );
  }

  getHoro() {
    if (this.mode === Mode.Event) {
      this.storage.eventData = structuredClone(this.horoData);
    } else {
      this.storage.horoData = structuredClone(this.horoData);
    }
    this.router.navigate(['./image'], { relativeTo: this.route });
  }

  async onDateChange(): Promise<void> {
    const date = this.horoData.date;
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

  onArchiveSelected(horoData: HoroRequest): void {
    this.horoData = horoData;
  }
}
