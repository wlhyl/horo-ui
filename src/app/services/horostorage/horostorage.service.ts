import { Injectable } from '@angular/core';
import { ProcessName } from 'src/app/process/enum/process';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import { deepFreeze } from 'src/app/utils/deep-freeze/deep-freeze';

@Injectable({
  providedIn: 'root',
})
export class HoroStorageService {
  private _horoData!: HoroRequest;
  private _processData!: ProcessRequest;

  constructor() {
    this._initProcessData();
    this._initHoroData();
  }

  public get horoData(): DeepReadonly<HoroRequest> {
    return this._horoData;
  }

  public set horoData(data: HoroRequest) {
    this._horoData = deepFreeze(data);
    localStorage.setItem('horo_data', JSON.stringify(data));
  }

  public get processData(): DeepReadonly<ProcessRequest> {
    return this._processData;
  }

  public set processData(data: ProcessRequest) {
    this._processData = deepFreeze(data);
    localStorage.setItem('process_data', JSON.stringify(data));
  }

  public clean() {
    localStorage.removeItem('horo_data');
    localStorage.removeItem('process_data');
    this._initHoroData();
    this._initProcessData();
  }

  private _initProcessData() {
    let processData = this._getParsedItem<ProcessRequest>('process_data');
    if (processData) {
      this._processData = Object.freeze(processData);
    } else {
      let t = this.nowDate();

      this._processData = Object.freeze({
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
      });
    }
  }

  private _initHoroData() {
    let horoData = this._getParsedItem<HoroRequest>('horo_data');
    if (horoData) {
      this._horoData = Object.freeze(horoData);
    } else {
      let t = this.nowDate();
      horoData = {
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
      this._horoData = Object.freeze(horoData);
    }
  }

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

  private _getParsedItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }
}
