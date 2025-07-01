import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { Horoconfig } from '../services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { Path } from '../type/enum/path';
import { deepClone } from '../utils/deep-clone';
import { HoroRequest } from '../type/interface/request-data';

@Component({
    selector: 'app-native',
    templateUrl: './native.page.html',
    styleUrls: ['./native.page.scss'],
    standalone: false
})
export class NativePage implements OnInit {
  readonly houses: Array<string> = this.config.houses;
  horoData: HoroRequest = deepClone(this.storage.horoData);

  path = Path;
  title = '本命星盘';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: HoroStorageService,
    private config: Horoconfig,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  getHoro() {
    this.storage.horoData = this.horoData;
    this.router.navigate(['./image'], { relativeTo: this.route });
  }
}
