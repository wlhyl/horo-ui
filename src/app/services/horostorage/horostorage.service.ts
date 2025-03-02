import { Injectable } from '@angular/core';
import { ProcessName } from 'src/app/process/enum/process';
import {
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';

@Injectable({
  providedIn: 'root',
})
export class HoroStorageService {
  private _horoData: (HoroRequest & { save: () => void }) | null = null;

  constructor() {}

  private nowDate() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      tz: now.getTimezoneOffset() / -60,
      st: false,
    };
  }

  public get horoData(): HoroRequest & { save: () => void } {
    if (this._horoData) {
      return this._horoData;
    }

    let j = localStorage.getItem('horo_data');
    let data: HoroRequest;

    if (j) {
      data = JSON.parse(j) as HoroRequest;
    } else {
      let t = this.nowDate();
      data = {
        id: 0,
        date: {
          year: t.year,
          month: t.month,
          day: t.day,
          hour: t.hour,
          minute: t.minute,
          second: t.second,
          tz: t.tz,
          st: t.st,
        },
        geo_name: '北京',
        geo: {
          long: 116 + 25 / 60.0,
          lat: 39 + 54 / 60.0,
        },
        house: 'Alcabitus',
        sex: true,
        name: '',
      };
    }

    // 创建一个新的对象，包含 HoroRequest 的所有属性以及 save 方法
    this._horoData = {
      ...data,
      save: function () {
        localStorage.setItem('horo_data', JSON.stringify(this));
      },
    };

    return this._horoData;
  }

  public set horoData(data: HoroRequest) {
    this._horoData = {
      ...data,
      save: function () {
        localStorage.setItem('horo_data', JSON.stringify(this));
      },
    };
  }

  public set processData(data: ProcessRequest) {
    localStorage.setItem('process_data', JSON.stringify(data));
  }

  public get processData(): ProcessRequest {
    let j = localStorage.getItem('process_data');
    if (j) {
      return JSON.parse(j) as ProcessRequest;
    }

    let t = this.nowDate();

    return {
      date: {
        year: t.year,
        month: t.month,
        day: t.day,
        hour: t.hour,
        minute: t.minute,
        second: t.second,
        tz: t.tz,
        st: t.st,
      },
      geo_name: '北京',
      geo: {
        long: 116 + 25 / 60.0,
        lat: 39 + 54 / 60.0,
      },
      process_name: ProcessName.Profection,
      isSolarReturn: false,
    };
  }
  clean() {
    localStorage.removeItem('horo_data');
    localStorage.removeItem('process_data');
    this._horoData = null;
  }
}
