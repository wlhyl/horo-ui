import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { HoroRequest, ProcessRequest, ProfectionRequest } from 'src/app/type/interface/request-data';
import { HoroDateTime, Profection } from 'src/app/type/interface/response-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';

@Component({
  selector: 'app-profection',
  templateUrl: './profection.component.html',
  styleUrls: ['./profection.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class ProfectionComponent implements OnInit, OnChanges {
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() embedded: boolean = false;

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  processData: DeepReadonly<ProcessRequest> = this.storage.processData;
  profection: Profection = {
    year_house: 0,
    month_house: 0,
    day_house: 0,
    hour_house: 0,
    date_per_house: [],
    hour_per_house: [],
  };

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  isDatePerHouseCollapsed = false;
  isHourPerHouseCollapsed = false;

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  title = '小限';

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    if (this.embedded) {
      if (!this.inputHoroData || !this.inputProcessData) {
        return;
      }
      this.horoData = this.inputHoroData;
      this.processData = this.inputProcessData;
    } else {
      this.titleService.setTitle(this.title);
    }

    this.initialized = true;
    this.fetchProfection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;
    // 首次初始化由 ngOnInit 处理，避免重复 fetch
    if (!this.initialized) return;

    let needRefetch = false;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      needRefetch = true;
    }

    if (changes['inputProcessData'] && this.inputProcessData) {
      this.processData = this.inputProcessData;
      needRefetch = true;
    }

    if (needRefetch) {
      this.fetchProfection();
    }
  }

  private fetchProfection(): void {
    const profectionData: ProfectionRequest = {
      native_date: this.horoData.date,
      process_date: this.processData.date,
    };
    this.api.profection(profectionData).subscribe({
      next: (response) => (this.profection = response),
      error: (error) => {
        const message = error.message + ' ' + error.error.message;
        this.message = message;
        this.isAlertOpen = true;
      },
    });
  }

  formatDate(date: HoroDateTime): string {
    return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')} ${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}`;
  }
}
