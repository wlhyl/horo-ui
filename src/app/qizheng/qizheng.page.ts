import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Path as subPath } from './path';
import { Path } from '../type/enum/path';
import { deepClone } from '../utils/deep-clone';
import { HoroRequest, ProcessRequest } from '../type/interface/request-data';

@Component({
  selector: 'app-qizheng',
  templateUrl: './qizheng.page.html',
  styleUrls: ['./qizheng.page.scss'],
  standalone: false,
})
export class QizhengPage implements OnInit {
  path = Path;

  horoData: HoroRequest = deepClone(this.storage.horoData);
  processData: ProcessRequest = deepClone(this.storage.processData);

  title = '七政四余';

  constructor(
    private storage: HoroStorageService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  getProcess() {
    this.storage.horoData = this.horoData;
    this.storage.processData = this.processData;
    const path = subPath.Horo;
    this.router.navigate([path], {
      relativeTo: this.route,
    });
  }
}
