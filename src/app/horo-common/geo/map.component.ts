import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { addIcons } from 'ionicons';
import { navigateOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { LongLatResponse } from 'src/app/type/interface/horo-admin/longLat-response';

@Component({
  selector: 'horo-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
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

  query = {
    errorMessage: '',
    error: false,
    loading: false,
  };

  locations: LongLatResponse[] = [];
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
    this.locations = [];
    this.selectedLocation = null;
    this.query.errorMessage = '';
  }

  queryGeo() {
    if (!this.localName) {
      return;
    }
    this.query.loading = true;
    this.query.error = false;
    this.locations = [];
    this.selectedLocation = null;

    this.api
      .getLongLat(this.localName)
      .pipe(
        finalize(() => {
          this.query.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.locations = res;
          if (res.length === 0) {
            this.query.error = true;
            this.query.errorMessage = '未查询到任何结果';
          }
        },
        error: (error) => {
          this.query.error = true;
          this.query.errorMessage = error.error?.error || '未知错误';
        },
      });
  }
}
