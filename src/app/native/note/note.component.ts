import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from 'src/app/type/interface/horo-admin/horoscope-record';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { Mode } from '../enum';
import { Path } from 'src/app/type/enum/path';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class NoteComponent implements OnInit {
  title = '笔记';

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';
  isLoading = true;

  mode: string;
  horoData: DeepReadonly<HoroRequest>;

  describe: string = '';
  initialDescribe: string | null = null;

  constructor(
    private titleService: Title,
    private api: ApiService,
    private storage: HoroStorageService,
    private router: Router,
  ) {
    this.mode = this.router.url.startsWith('/' + Path.Event) ? Mode.Event : Mode.Native;
    this.horoData = this.mode === Mode.Event ? this.storage.eventData : this.storage.horoData;
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.loadNativeData();
  }

  private loadNativeData() {
    if (this.horoData.id == 0) {
      this.isLoading = false;
      return;
    }

    this.api.getNativeById(this.horoData.id).subscribe({
      next: (data) => {
        this.describe = data.description;
        this.initialDescribe = data.description;
        this.isLoading = false;
      },
      error: (error) => {
        this.message = '加载数据时出错: ' + error.message;
        this.isAlertOpen = true;
        this.isLoading = false;
        console.error('Error loading native data', error);
      },
    });
  }

  onSubmit() {
    if (this.horoData.id == 0) {
      const long = degreeToDMS(Math.abs(this.horoData.geo.long));
      const lat = degreeToDMS(Math.abs(this.horoData.geo.lat));

      const nativeRequest: HoroscopeRecordRequest = {
        name: this.horoData.name,
        gender: this.horoData.sex,
        birth_year: this.horoData.date.year,
        birth_month: this.horoData.date.month,
        birth_day: this.horoData.date.day,
        birth_hour: this.horoData.date.hour,
        birth_minute: this.horoData.date.minute,
        birth_second: this.horoData.date.second,
        time_zone_offset: this.horoData.date.tz,
        is_dst: this.horoData.date.st,
        chart_type: 'natal',
        is_time_precise: false,
        location: {
          name: this.horoData.geo_name,
          is_east: this.horoData.geo.long > 0,
          longitude_degree: long.d,
          longitude_minute: long.m,
          longitude_second: long.s,
          is_north: this.horoData.geo.lat > 0,
          latitude_degree: lat.d,
          latitude_minute: lat.m,
          latitude_second: lat.s,
        },
        description: this.describe,
        lock: false,
      };

      this.api.addNative(nativeRequest).subscribe({
        next: (data) => {
          const updatedData = { ...this.horoData, id: data.id };
          if (this.mode === Mode.Event) {
            this.storage.eventData = updatedData;
          } else {
            this.storage.horoData = updatedData;
          }
          this.horoData = updatedData;
          this.initialDescribe = this.describe;
          this.message = '已新增记录';
          this.isAlertOpen = true;
        },
        error: (error) => {
          this.message = '保存数据时出错: ' + error.message;
          this.isAlertOpen = true;
        },
      });
    } else {
      const native: UpdateHoroscopeRecordRequest = {
        name: null,
        gender: null,
        birth_year: null,
        birth_month: null,
        birth_day: null,
        birth_hour: null,
        birth_minute: null,
        birth_second: null,
        time_zone_offset: null,
        is_dst: null,
        chart_type: null,
        is_time_precise: null,
        location: null,
        description: this.describe,
        lock: null,
      };
      this.api.updateNative(this.horoData.id, native).subscribe({
        next: () => {
          this.initialDescribe = this.describe;
          this.message = '已更新记录';
          this.isAlertOpen = true;
        },
        error: (error) => {
          this.message = '保存数据时出错: ' + error.message;
          this.isAlertOpen = true;
        },
      });
    }
  }

  isDescribeChanged(): boolean {
    return this.describe !== this.initialDescribe;
  }
}
