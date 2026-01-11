import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ModalController,
  IonContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-archive-selection-modal',
  templateUrl: './archive-selection-modal.component.html',
  styleUrls: ['./archive-selection-modal.component.scss'],
  standalone: false,
})
export class ArchiveSelectionModalComponent implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  natives: HoroscopeRecord[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  private page = 0;
  private size = 20;
  private totalPages = 0;
  private isLoadingMore = false;
  private allRecords: HoroscopeRecord[] = [];

  constructor(
    private modalController: ModalController,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords(isLoadMore: boolean = false): void {
    if (isLoadMore) {
      this.isLoadingMore = true;
    } else {
      this.loading = true;
      this.natives = [];
      this.page = 0;
    }

    this.api
      .getNatives(this.page, this.size)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isLoadingMore = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (isLoadMore) {
            this.natives.push(...res.data);
            this.allRecords.push(...res.data);
          } else {
            this.natives = res.data;
            this.allRecords = res.data;
          }
          this.totalPages = res.total;
        },
        error: (error) => {
          console.error('Failed to load records:', error);
        },
      });
  }

  onSearchChange(event: any): void {
    const query = event.detail.value.toLowerCase();
    if (!query) {
      // 清空搜索，显示所有记录
      this.natives = [...this.allRecords];
    } else {
      // 在本地数据中搜索
      this.natives = this.allRecords.filter((record) =>
        record.name.toLowerCase().includes(query)
      );
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    // 如果正在加载数据，则不处理滚动事件
    if (this.isLoadingMore) {
      event.target.complete();
      return;
    }

    // 检查是否还有更多页面可以加载
    if (this.page >= this.totalPages - 1) {
      event.target.complete();
      return;
    }

    this.page++;
    this.loadRecords(true);
    event.target.complete();
  }

  selectRecord(record: HoroscopeRecord): void {
    this.modalController.dismiss(record);
  }

  dismiss(): void {
    this.modalController.dismiss(null);
  }
}
