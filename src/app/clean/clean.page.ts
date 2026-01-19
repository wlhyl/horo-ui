import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HoroStorageService } from '../services/horostorage/horostorage.service';

@Component({
  selector: 'app-clean',
  templateUrl: './clean.page.html',
  styleUrls: ['./clean.page.scss'],
  standalone: false,
})
export class CleanPage implements OnInit {
  title = '清除缓存';
  message = '';

  constructor(
    private titleService: Title,
    private storage: HoroStorageService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  clean() {
    this.message = '正在清除缓存...';
    this.storage.clean();
    this.message = '清除缓存完成';
  }
}
