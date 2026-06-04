import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HoroStorageService, HistoricalStorageData } from '../services/horostorage/horostorage.service';
import { DeepReadonly } from '../type/interface/deep-readonly';
import { Title } from '@angular/platform-browser';
import { Path } from './enum';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-historical',
  templateUrl: './historical.page.html',
  styleUrls: ['./historical.page.scss'],
  standalone: false,
})
export class HistoricalPage implements OnInit, ViewWillEnter {
  path = Path;
  historicalData: DeepReadonly<HistoricalStorageData> = this.storage.historicalData;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: HoroStorageService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('古代星盘');
  }

  ionViewWillEnter(): void {
    this.historicalData = this.storage.historicalData;
  }

  getHoro() {
    this.router.navigate(['./' + Path.Image], { relativeTo: this.route });
  }

  onArchiveSelected(historicalData: HistoricalStorageData): void {
    this.storage.historicalData = historicalData;
    this.historicalData = this.storage.historicalData;
  }
}
