import { Component, EventEmitter, Output } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { HistoricalArchiveSelectionModalComponent } from '../historical-archive-selection-modal/historical-archive-selection-modal.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HistoricalHoroscopeRecord } from 'src/app/type/interface/horo-admin/historical-horoscope';
import { HistoricalStorageData } from 'src/app/services/horostorage/horostorage.service';

@Component({
  selector: 'app-historical-archive-selector',
  templateUrl: './historical-archive-selector.component.html',
  styleUrls: ['./historical-archive-selector.component.scss'],
  standalone: false,
})
export class HistoricalArchiveSelectorComponent {
  @Output() historicalSelected = new EventEmitter<HistoricalStorageData>();

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private authService: AuthService,
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
      component: HistoricalArchiveSelectionModalComponent,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      const historicalData = this.convertRecordToHistoricalStorageData(data);
      this.historicalSelected.emit(historicalData);
    }
  }

  private convertRecordToHistoricalStorageData(
    record: HistoricalHoroscopeRecord,
  ): HistoricalStorageData {
    return {
      name: record.name,
      description: record.description,
      house_system: record.house_system ?? '未知',
      house_cusps: record.house_cusps,
      planet_positions: record.planet_positions,
    };
  }
}
