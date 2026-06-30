import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { FirdariaRequest, HoroRequest } from 'src/app/type/interface/request-data';
import { FirdariaPeriod } from 'src/app/type/interface/response-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';

@Component({
  selector: 'app-firdaria',
  templateUrl: './firdaria.component.html',
  styleUrls: ['./firdaria.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FirdariaComponent implements OnInit, OnChanges {
  @Input() inputHoroData?: HoroRequest;
  @Input() embedded: boolean = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  title = '法达';

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;

  firdariaData: Array<FirdariaPeriod> = [];

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
  ) {}

  ngOnInit() {
    if (this.embedded) {
      if (!this.inputHoroData) {
        return;
      }
      this.horoData = this.inputHoroData;
    } else {
      this.titleService.setTitle(this.title);
    }

    this.initialized = true;
    this.fetchFirdaria();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;
    // 首次初始化由 ngOnInit 处理，避免重复 fetch
    if (!this.initialized) return;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      this.fetchFirdaria();
    }
  }

  private fetchFirdaria(): void {
    const requestData: FirdariaRequest = {
      native_date: this.horoData.date,
      geo: this.horoData.geo, // 用于确实是白天盘或夜间盘
    };

    this.api.firdaria(requestData).subscribe({
      next: (respone) => (this.firdariaData = respone),
      error: (error) => {
        const message = error.message + ' ' + error.error.message;
        this.message = message;
        this.isAlertOpen = true;
      },
    });
  }
}
