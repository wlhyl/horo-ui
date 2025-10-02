import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  ViewWillEnter,
} from '@ionic/angular';
import { finalize, take } from 'rxjs/operators';
import { ApiService } from '../services/api/api.service';
import { PageResponser } from '../type/interface/page';
import { HoroscopeRecord } from '../type/interface/horo-admin/horoscope-record';
import { ActivatedRoute, Router } from '@angular/router';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { HoroRequest } from '../type/interface/request-data';
import { Path } from '../type/enum/path';
import { Path as SubPath } from './enum';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
  standalone: false,
})
export class ArchivePage implements OnInit, ViewWillEnter {
  @ViewChild(IonContent) content!: IonContent;

  title = '档案库';

  path = Path;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  private page = 0;
  private size = 10;
  private loading = false;
  natives: PageResponser<Array<HoroscopeRecord>> = {
    data: [],
    total: 0, // 总页数
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private api: ApiService,
    private storage: HoroStorageService,
    private ngZone: NgZone
  ) {}

  ionViewWillEnter(): void {
    this.page = 0; // 重置页码
    this.natives.data = [];
    this.natives.total = 0;
    this.getNatives(undefined, true);
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  getNatives(event?: InfiniteScrollCustomEvent, initialLoad: boolean = false) {
    // 设置loading状态
    this.loading = true;

    this.api
      .getNatives(this.page, this.size)
      .pipe(
        finalize(() => {
          // 无论请求成功还是失败，都会执行这里的代码
          this.loading = false;

          if (event) {
            event.target.complete();
          }
        })
      )
      .subscribe({
        next: (res) => {
          // 如果是分页加载，需要将新数据追加到现有数据中
          if (this.page === 0) {
            this.natives = res;
          } else {
            this.natives.data.push(...res.data);
            this.natives.total = res.total;
          }

          // 如果是初始加载，检查是否需要继续加载更多数据
          if (initialLoad && this.page < this.natives.total - 1) {
            // 检查当前数据是否足够填满页面
            this.ngZone.onStable.pipe(take(1)).subscribe(() => {
              if (this.content) {
                this.content
                  .getScrollElement()
                  .then((scrollElement) => {
                    // 检查是否有滚动条
                    if (
                      scrollElement.scrollHeight <= scrollElement.clientHeight
                    ) {
                      // 没有滚动条，说明数据不够填满页面
                      this.page++;
                      this.getNatives(undefined, true);
                    }
                  })
                  .catch((error) => {
                    // 处理 getScrollElement 错误
                    console.error('Failed to get scroll element:', error);
                    this.message = '获取页面滚动信息失败！';
                    if (error && error.message) {
                      this.message += ' ' + error.message;
                    }
                    this.isAlertOpen = true;
                  });
              }
            });
          }
        },
        error: (error) => {
          const msg = error.error.error;
          let message = '获取档案数据失败！';
          if (msg) message += msg;
          this.message = message;
          this.isAlertOpen = true;
          // this.message = error.error + ' ' + error.error.message;
        },
      });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    // 如果正在加载数据，则不处理滚动事件
    if (this.loading) {
      event.target.complete();
      return;
    }

    // 检查是否还有更多页面可以加载
    if (this.page >= this.natives.total - 1) {
      event.target.complete();
      return;
    }

    this.page++;
    this.getNatives(event);
  }

  add() {
    this.router.navigate([SubPath.Edit], {
      relativeTo: this.route,
    });
  }

  delete(id: number) {
    this.api.deleteNative(id).subscribe({
      next: () => {
        this.page = 0; // 重置页码
        this.getNatives(undefined, true); // 刷新数据
      },
      error: (error) => {
        const msg = error.error.error;
        let message = '删除档案失败！';
        if (msg) message += msg;
        this.message = message;
        this.isAlertOpen = true;
      },
    });
  }

  edit(native: HoroscopeRecord) {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
      state: native,
    });
  }

  toHoro(native: HoroscopeRecord, path: string) {
    let long =
      native.location.longitude_degree +
      native.location.longitude_minute / 60 +
      native.location.longitude_second / 3600;
    let lat =
      native.location.latitude_degree +
      native.location.latitude_minute / 60 +
      native.location.latitude_second / 3600;
    if (!native.location.is_east) long = -long;
    if (!native.location.is_north) lat = -lat;

    const date: HoroRequest = {
      id: native.id,
      date: {
        year: native.birth_year,
        month: native.birth_month,
        day: native.birth_day,
        hour: native.birth_hour,
        minute: native.birth_minute,
        second: native.birth_second,
        tz: native.time_zone_offset,
        st: native.is_dst,
      },
      geo_name: native.location.name,
      geo: {
        long,
        lat,
      },
      house: this.storage.horoData.house,
      name: native.name ? native.name : '',
      sex: native.gender,
    };

    this.storage.horoData = date;
    this.router.navigateByUrl(path);
  }
}
