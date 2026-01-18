import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  ModalController,
  IonContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import {
  HoroscopeRecord,
  SearchHoroscopeRecordRequest,
} from 'src/app/type/interface/horo-admin/horoscope-record';
import { finalize, Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-archive-selection-modal',
  templateUrl: './archive-selection-modal.component.html',
  styleUrls: ['./archive-selection-modal.component.scss'],
  standalone: false,
})
export class ArchiveSelectionModalComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  natives: HoroscopeRecord[] = [];
  searchQuery: string = '';
  loading: boolean = false;

  isAlertOpen = false;
  alertMessage = '';
  alertButtons = ['确定'];

  private page = 0;
  private size = 20;
  private totalPages = 0;
  private isLoadingMore = false;
  private isSearchMode = false;
  private searchParams: SearchHoroscopeRecordRequest = {
    page: 0,
    size: this.size,
    name: undefined,
  };
  private searchSubject$ = new Subject<string>();
  private infiniteScrollSubject$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.loadRecords();

    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query;
        this.search();
      });

    this.infiniteScrollSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.handleInfiniteScroll();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecords(isLoadMore: boolean = false): void {
    if (this.loading || this.isLoadingMore) {
      return;
    }

    if (isLoadMore) {
      this.isLoadingMore = true;
    } else {
      this.loading = true;
      this.natives = [];
      this.page = 0;
      this.searchParams.page = 0;
    }

    this.api
      .getNatives(this.page, this.size)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isLoadingMore = false;
        }),
      )
      .subscribe({
        next: (res) => {
          if (isLoadMore) {
            this.natives.push(...res.data);
          } else {
            this.natives = res.data;
          }
          this.totalPages = res.total;
        },
        error: (error) => {
          this.alertMessage =
            '加载记录失败：' +
            (error.message || '未知错误') +
            ' ' +
            (error.error?.message || error.error || '');
          this.isAlertOpen = true;
        },
      });
  }

  search(): void {
    if (this.loading || this.isLoadingMore) {
      return;
    }

    this.loading = true;
    this.isSearchMode = true;

    const params = this.buildSearchParams();
    this.searchParams.page = 0;

    const requestParams = this.filterUndefined({
      ...this.searchParams,
      ...params,
    });

    this.api
      .searchHoroscopes(requestParams)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (res) => {
          this.natives = res.data;
          this.totalPages = res.total;
        },
        error: (error) => {
          this.alertMessage =
            '搜索失败：' +
            (error.message || '未知错误') +
            ' ' +
            (error.error?.message || error.error || '');
          this.isAlertOpen = true;
        },
      });
  }

  private buildSearchParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page: 0,
      size: this.size,
    };

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      params['name'] = this.searchQuery.trim();
    }

    return params;
  }

  private filterUndefined(
    obj: SearchHoroscopeRecordRequest & Record<string, unknown>,
  ): SearchHoroscopeRecordRequest & Record<string, string | number> {
    const result: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = value as string | number;
      }
    }
    return result as SearchHoroscopeRecordRequest &
      Record<string, string | number>;
  }

  onSearchChange(event: any): void {
    const query = event.detail.value;
    if (!query || query.trim() === '') {
      this.isSearchMode = false;
      this.page = 0;
      this.loadRecords();
    } else {
      this.searchSubject$.next(query);
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    if (this.isLoadingMore) {
      event.target.complete();
      return;
    }

    event.target.complete();
    this.infiniteScrollSubject$.next();
  }

  private handleInfiniteScroll(): void {
    if (this.page >= this.totalPages - 1) {
      this.isLoadingMore = false;
      return;
    }

    this.page++;
    this.searchParams.page = this.page;

    if (this.isSearchMode) {
      this.searchLoadMore();
    } else {
      this.loadRecords(true);
    }
  }

  private searchLoadMore(): void {
    this.isLoadingMore = true;

    const params = this.buildSearchParams();
    const requestParams = this.filterUndefined({
      ...this.searchParams,
      ...params,
    });

    this.api
      .searchHoroscopes(requestParams)
      .pipe(
        finalize(() => {
          this.isLoadingMore = false;
        }),
      )
      .subscribe({
        next: (res) => {
          this.natives.push(...res.data);
        },
        error: (error) => {
          this.isLoadingMore = false;
          this.alertMessage =
            '加载更多失败：' +
            (error.message || '未知错误') +
            ' ' +
            (error.error?.message || error.error || '');
          this.isAlertOpen = true;
        },
      });
  }

  selectRecord(record: HoroscopeRecord): void {
    this.modalController.dismiss(record);
  }

  dismiss(): void {
    this.modalController.dismiss(null);
  }
}
