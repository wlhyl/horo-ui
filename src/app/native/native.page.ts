import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { Horoconfig } from '../services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { Path } from './enum';
import { HoroRequest } from '../type/interface/request-data';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-native',
  templateUrl: './native.page.html',
  styleUrls: ['./native.page.scss'],
  standalone: false,
})
export class NativePage implements OnInit, ViewWillEnter {
  readonly houses: ReadonlyArray<string> = this.config.houses;
  horoData: HoroRequest = {
    id: 0,
    name: '',
    sex: true,
    date: {
      year: 2000,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: '',
    geo: {
      long: 0,
      lat: 0,
    },
    house: '',
  };

  path = Path;
  title = '本命星盘';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: HoroStorageService,
    private config: Horoconfig,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  ionViewWillEnter(): void {
    this.horoData = structuredClone(this.storage.horoData);
  }

  getHoro() {
    this.storage.horoData = structuredClone(this.horoData);
    this.router.navigate(['./image'], { relativeTo: this.route });
  }

  onArchiveSelected(horoData: HoroRequest): void {
    this.horoData = horoData;
  }
}
