import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { Path } from '../enum/path';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';

@Component({
  selector: 'app-synastry-input',
  templateUrl: './synastry-input.component.html',
  styleUrls: ['./synastry-input.component.scss'],
  standalone: false,
})
export class SynastryInputComponent implements OnInit {
  readonly houses: ReadonlyArray<string> = this.config.houses;

  originalHoroData: HoroRequest = structuredClone(this.storage.horoData);
  comparisonHoroData: HoroRequest = structuredClone(this.storage.synastryData);
  isQizheng = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private config: Horoconfig,
    private storage: HoroStorageService
  ) { }

  ngOnInit() {
    this.titleService.setTitle('合盘信息输入');
  }

  swapHoroData(): void {
    const temp = this.originalHoroData;
    this.originalHoroData = this.comparisonHoroData;
    this.comparisonHoroData = temp;
  }

  getSynastry(): void {
    this.storage.horoData = structuredClone(this.originalHoroData);
    this.storage.synastryData = {
      ...structuredClone(this.comparisonHoroData),
      house: this.originalHoroData.house,
    };
    if (this.isQizheng) {
      this.router.navigate([Path.Qizheng], {
        relativeTo: this.route,
      });
    } else {
      this.router.navigate([Path.Horo], {
        relativeTo: this.route,
      });
    }
  }

  onOriginalSelected(horoData: HoroRequest): void {
    this.originalHoroData = horoData;
  }

  onComparisonSelected(horoData: HoroRequest): void {
    this.comparisonHoroData = horoData;
  }
}
