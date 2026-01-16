import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ArchiveSelectionModalComponent } from '../archive-selection-modal/archive-selection-modal.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';

@Component({
  selector: 'app-archive-selector',
  templateUrl: './archive-selector.component.html',
  styleUrls: ['./archive-selector.component.scss'],
  standalone: false,
})
export class ArchiveSelectorComponent {
  @Input() defaultHouse: string = 'Regiomontanus';
  @Output() horoRequestSelected = new EventEmitter<HoroRequest>();

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  async selectFromArchive(): Promise<void> {
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
      this.horoRequestSelected.emit(horoData);
    }
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
      house: this.defaultHouse,
      name: record.name ? record.name : '',
      sex: record.gender,
    };
  }
}
