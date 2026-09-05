import { AfterViewInit, Component, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { Horoscope, HistoricalHoroResponse } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService, HistoricalStorageData } from 'src/app/services/horostorage/horostorage.service';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { ApiService } from 'src/app/services/api/api.service';
import { finalize, Subject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { StaticCanvas } from 'fabric';
import { drawAspect, drawHorosco } from 'src/app/utils/image/horo';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Path as subPath } from '../enum';
import { adaptHistoricalToHoroscope } from 'src/app/utils/image/historical-adapter';
import { HistoricalHoroRequest } from 'src/app/type/interface/request-data';
import { zoomImage } from 'src/app/utils/image/zoom-image';
import { getApiErrorMessage } from 'src/app/utils/api-error/api-error';
import {
  compassOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-historical-image',
  templateUrl: 'image.component.html',
  styleUrls: ['image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ImageComponent implements AfterViewInit, OnDestroy {
  readonly historicalData = this.storage.historicalData;
  readonly title = '古代星盘';
  loading = signal(false);
  isDrawing = false;

  public horoscoData = signal<Horoscope | null>(null);
  private canvasCache: { version: string; objects: Object[] } | undefined = undefined;
  private canvas?: StaticCanvas;
  private destroy$ = new Subject<void>();

  isAlertOpen = signal(false);
  alertButtons = ['OK'];
  message = signal('');

  private _isAspect = false;

  constructor(
    private platform: Platform,
    private api: ApiService,
    public config: Horoconfig,
    private storage: HoroStorageService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    addIcons({ compassOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  ngAfterViewInit(): void {
    this.canvas = new StaticCanvas('historical-canvas');
    this.drawHoroscope(this.historicalData);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }

  private drawHoroscope(data: DeepReadonly<HistoricalStorageData>) {
    if (this.isDrawing || this.loading()) return;

    this.isDrawing = true;
    this.loading.set(true);
    this.canvasCache = undefined;

    const request: HistoricalHoroRequest = {
      planet_positions: [...data.planet_positions],
      house_cusps: [...data.house_cusps],
    };

    this.api
      .getHistoricalHoroscope(request)
      .pipe(
        finalize(() => {
          this.isDrawing = false;
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: HistoricalHoroResponse) => {
          this.horoscoData.set(adaptHistoricalToHoroscope(response, data.house_system, data.planet_positions));
          this.isAlertOpen.set(false);
          this.draw();
        },
        error: (error) => {
          this.message.set(getApiErrorMessage(error));
          this.isAlertOpen.set(true);
        },
      });
  }

  private draw() {
    const horosco = this.horoscoData();
    if (horosco === null) return;

    if (this.isAspect) {
      drawAspect(horosco.aspects, this.canvas!, this.config, {
        width: this.config.aspectImage.width,
        height: this.config.aspectImage.height,
      });
    } else {
      drawHorosco(horosco, this.canvas!, this.config, {
        width: this.config.horoscoImage.width,
        height: this.config.horoscoImage.height,
      });
    }
    zoomImage(this.canvas!, this.platform);
  }

  get isAspect(): boolean {
    return this._isAspect;
  }

  set isAspect(value: boolean) {
    if (this.isAspect === value) return;
    if (this.isDrawing || this.loading()) return;

    this._isAspect = value;
    let tempCache = this.canvasCache;
    this.canvasCache = this.canvas?.toJSON();

    if (tempCache) {
      this.canvas?.loadFromJSON(tempCache).then((canvas) => canvas.renderAll());
    } else {
      this.draw();
    }
  }

  onDetail() {
    const horosco = this.horoscoData();
    if (horosco) {
      this.router.navigate([subPath.Detail], {
        relativeTo: this.route,
        state: { data: horosco },
      });
    }
  }

  onPromittor() {
    const horosco = this.horoscoData();
    if (horosco) {
      this.router.navigate([subPath.Promittor], {
        relativeTo: this.route,
        state: { data: horosco },
      });
    }
  }
}
