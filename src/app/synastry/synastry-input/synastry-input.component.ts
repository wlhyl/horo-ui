import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { Path } from 'src/app/type/enum/path';
import { Path as subPath } from '../enum/path';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';
import { AlertController, ModalController } from '@ionic/angular';
import { ArchiveSelectionModalComponent } from '../archive-selection-modal/archive-selection-modal.component';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-synastry-input',
  templateUrl: './synastry-input.component.html',
  styleUrls: ['./synastry-input.component.scss'],
  standalone: false,
})
export class SynastryInputComponent implements OnInit {
  readonly houses: ReadonlyArray<string> = this.config.houses;
  path = Path;
  subPath = subPath;

  originalHoroData: HoroRequest = structuredClone(this.storage.horoData);
  comparisonHoroData: HoroRequest = structuredClone(this.storage.synastryData);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private config: Horoconfig,
    private storage: HoroStorageService,
    private modalController: ModalController,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('合盘信息输入');
  }

  swapHoroData(): void {
    const temp = this.originalHoroData;
    this.originalHoroData = this.comparisonHoroData;
    this.comparisonHoroData = temp;
  }

  getSynastry(): void {
    this.storage.horoData = structuredClone(this.originalHoroData);
    this.storage.synastryData = {
      ...structuredClone(this.comparisonHoroData),
      house: this.originalHoroData.house,
    };
    this.router.navigate([subPath.Horo], {
      relativeTo: this.route,
    });
  }

  private convertRecordToHoroRequest(record: HoroscopeRecord): HoroRequest {
    let long =
      record.location.longitude_degree +
      record.location.longitude_minute / 60 +
      record.location.longitude_second / 3600;
    let lat =
      record.location.latitude_degree +
      record.location.latitude_minute / 60 +
      record.location.latitude_second / 3600;
    if (!record.location.is_east) long = -long;
    if (!record.location.is_north) lat = -lat;

    return {
      id: record.id,
      date: {
        year: record.birth_year,
        month: record.birth_month,
        day: record.birth_day,
        hour: record.birth_hour,
        minute: record.birth_minute,
        second: record.birth_second,
        tz: record.time_zone_offset,
        st: record.is_dst,
      },
      geo_name: record.location.name,
      geo: {
        long,
        lat,
      },
      house: this.originalHoroData.house,
      name: record.name ? record.name : '',
      sex: record.gender,
    };
  }

  async selectFromArchive(isOriginal: boolean): Promise<void> {
    if (!this.authService.isAuth) {
      const alert = await this.alertController.create({
        header: '提示',
        message: '请先登录后再从档案库选择记录',
        buttons: ['确定'],
      });
      await alert.present();
      return;
    }

    const modal = await this.modalController.create({
      component: ArchiveSelectionModalComponent,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      const horoData = this.convertRecordToHoroRequest(data);
      if (isOriginal) {
        this.originalHoroData = horoData;
      } else {
        this.comparisonHoroData = horoData;
      }
    }
  }
}
