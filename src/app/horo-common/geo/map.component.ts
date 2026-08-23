import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, signal } from '@angular/core';
import { addIcons } from 'ionicons';
import { navigateOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { LongLatResponse } from 'src/app/type/interface/horo-admin/longLat-response';

@Component({
  selector: 'horo-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MapComponent implements OnInit {
  isModalOpen = false;

  @Input()
  localName: string = '';
  @Input()
  long: number = 0;
  @Input()
  lat: number = 0;

  @Output()
  localNameChange = new EventEmitter<string>();
  @Output()
  longChange = new EventEmitter<number>();
  @Output()
  latChange = new EventEmitter<number>();

  // 查询状态用 signal：modal 内容经 ngTemplateOutlet 挂在 ion-modal(OnPush) 下，
  // markForCheck 无法传播到该 embedded view，signal 写入才能触发其刷新
  queryLoading = signal(false);
  queryError = signal(false);
  queryErrorMessage = signal('');

  locations = signal<LongLatResponse[]>([]);
  selectedLocation: LongLatResponse | null = null;

  constructor(private api: ApiService) {
    addIcons({ navigateOutline });
  }

  ngOnInit() {}

  ok(): void {
    if (this.selectedLocation) {
      this.localNameChange.emit(this.selectedLocation.name);
      this.longChange.emit(Number(this.selectedLocation.longitude));
      this.latChange.emit(Number(this.selectedLocation.latitude));
    }
    this.isModalOpen = false;
  }
  cancel(): void {
    this.isModalOpen = false;
  }
  open(): void {
    this.isModalOpen = true;
    this.locations.set([]);
    this.selectedLocation = null;
    this.queryErrorMessage.set('');
  }

  queryGeo() {
    if (!this.localName) {
      return;
    }
    this.queryLoading.set(true);
    this.queryError.set(false);
    this.locations.set([]);
    this.selectedLocation = null;

    this.api
      .getLongLat(this.localName)
      .pipe(
        finalize(() => {
          this.queryLoading.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.locations.set(res);
          if (res.length === 0) {
            this.queryError.set(true);
            this.queryErrorMessage.set('未查询到任何结果');
          }
        },
        error: (error) => {
          this.queryError.set(true);
          this.queryErrorMessage.set(error.error?.error || '未知错误');
        },
      });
  }
}
