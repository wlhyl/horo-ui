import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import {
  HoroscopeRecord,
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from 'src/app/type/interface/horoscope-record';
import { deepClone } from 'src/app/utils/deepclone';
import { Path } from '../../type/enum/path';
import { LocationRecord } from 'src/app/type/interface/location-record';
import { isLocationEqual } from 'src/app/utils/location-record';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  title = '编辑';
  path = Path;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  isSaving = false;

  native: HoroscopeRecord;
  oldNative: HoroscopeRecord;

  showDateTimePicker = false;
  showTimeZonePicker = false;
  showLongitudeInput = false;
  showLatitudeInput = false;
  timeZoneOptions = Array.from({ length: 25 }, (_, i) => {
    const value = i - 12;
    return {
      text:
        value === 0
          ? '0时区'
          : value > 0
          ? `东${value}区`
          : `西${Math.abs(value)}区`,
      value,
    };
  });
  longitudeDirections = [
    { text: '东经', value: true },
    { text: '西经', value: false },
  ];
  latitudeDirections = [
    { text: '北纬', value: true },
    { text: '南纬', value: false },
  ];
  longitudeDegrees = Array.from({ length: 181 }, (_, i) => i);
  longitudeMinutes = Array.from({ length: 60 }, (_, i) => i);
  longitudeSeconds = Array.from({ length: 60 }, (_, i) => i);
  latitudeDegrees = Array.from({ length: 91 }, (_, i) => i);
  latitudeMinutes = Array.from({ length: 60 }, (_, i) => i);
  latitudeSeconds = Array.from({ length: 60 }, (_, i) => i);

  constructor(
    private router: Router,
    private titleService: Title,
    private api: ApiService
  ) {
    const now = new Date();
    this.native = {
      id: 0,
      name: '',
      gender: true,
      birth_year: now.getFullYear(),
      birth_month: now.getMonth() + 1,
      birth_day: now.getDate(),
      birth_hour: now.getHours(),
      birth_minute: now.getMinutes(),
      birth_second: now.getSeconds(),
      time_zone_offset: -now.getTimezoneOffset() / 60, // 获取当前时区
      is_dst: false, // 夏令时需要根据具体情况设置
      location: {
        id: 0,
        name: '北京',
        is_east: true,
        longitude_degree: 116,
        longitude_minute: 23,
        longitude_second: 0,
        is_north: true,
        latitude_degree: 39,
        latitude_minute: 54,
        latitude_second: 0,
      },
      description: '',
      created_at: '',
      updated_at: '',
    };
    this.oldNative = deepClone(this.native);
  }

  ngOnInit() {
    const native = this.router.getCurrentNavigation()?.extras.state;

    if (native) {
      this.native = deepClone(native);
      this.oldNative = deepClone(native);
      this.title = '编辑';
    } else {
      this.title = '新增';
    }
    this.titleService.setTitle(this.title);
  }

  get dateTime(): string {
    return `${this.native.birth_year}-${this.native.birth_month
      .toString()
      .padStart(2, '0')}-${this.native.birth_day
      .toString()
      .padStart(2, '0')}T${this.native.birth_hour
      .toString()
      .padStart(2, '0')}:${this.native.birth_minute
      .toString()
      .padStart(2, '0')}:${this.native.birth_second
      .toString()
      .padStart(2, '0')}`;
  }

  set dateTime(value: string) {
    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    this.native.birth_year = year;
    this.native.birth_month = month;
    this.native.birth_day = day;
    this.native.birth_hour = hour;
    this.native.birth_minute = minute;
  }

  get formattedDateTime(): string {
    return this.dateTime.replace('T', ' ');
  }

  get formattedTimeZone(): string {
    if (this.native.time_zone_offset === 0) {
      return '0时区';
    } else if (this.native.time_zone_offset > 0) {
      return `东${this.native.time_zone_offset}区`;
    } else {
      return `西${Math.abs(this.native.time_zone_offset)}区`;
    }
  }

  get formattedLongitude(): string {
    const direction = this.native.location.is_east ? '东经' : '西经';
    return `${direction}${this.native.location.longitude_degree}°${this.native.location.longitude_minute}′${this.native.location.longitude_second}″`;
  }

  get formattedLatitude(): string {
    const direction = this.native.location.is_north ? '北纬' : '南纬';
    return `${direction}${this.native.location.latitude_degree}°${this.native.location.latitude_minute}′${this.native.location.latitude_second}″`;
  }

  onTimeZoneChange(event: any) {
    this.native.time_zone_offset = event.detail.value;
  }

  onLongitudeDirectionChange(event: any) {
    this.native.location.is_east = event.detail.value;
  }

  onLongitudeDegreeChange(event: any) {
    this.native.location.longitude_degree = event.detail.value;
  }

  onLongitudeMinuteChange(event: any) {
    this.native.location.longitude_minute = event.detail.value;
  }

  onLongitudeSecondChange(event: any) {
    this.native.location.longitude_second = event.detail.value;
  }

  onLatitudeDirectionChange(event: any) {
    this.native.location.is_north = event.detail.value;
  }

  onLatitudeDegreeChange(event: any) {
    this.native.location.latitude_degree = event.detail.value;
  }

  onLatitudeMinuteChange(event: any) {
    this.native.location.latitude_minute = event.detail.value;
  }

  onLatitudeSecondChange(event: any) {
    this.native.location.latitude_second = event.detail.value;
  }

  get long() {
    const long =
      this.native.location.longitude_degree +
      this.native.location.longitude_minute / 60 +
      this.native.location.longitude_second / 3600;

    return this.native.location.is_east ? long : -long;
  }

  get lat() {
    const lat =
      this.native.location.latitude_degree +
      this.native.location.latitude_minute / 60 +
      this.native.location.latitude_second / 3600;

    return this.native.location.is_north ? lat : -lat;
  }

  set long(value: number) {
    this.native.location.is_east = value >= 0;
    value = Math.abs(value);
    this.native.location.longitude_degree = Math.floor(value);
    const remainderMinutes =
      (value - this.native.location.longitude_degree) * 60;
    this.native.location.longitude_minute = Math.floor(remainderMinutes);
    this.native.location.longitude_second = Math.floor(
      (remainderMinutes - this.native.location.longitude_minute) * 60
    );
  }

  set lat(value: number) {
    this.native.location.is_north = value >= 0;
    value = Math.abs(value);
    this.native.location.latitude_degree = Math.floor(value);
    const remainderMinutes =
      (value - this.native.location.latitude_degree) * 60;
    this.native.location.latitude_minute = Math.floor(remainderMinutes);
    this.native.location.latitude_second = Math.floor(
      (remainderMinutes - this.native.location.latitude_minute) * 60
    );
  }

  validateSecond() {
    if (this.native.birth_second < 0) {
      this.native.birth_second = 0;
    } else if (this.native.birth_second > 59) {
      this.native.birth_second = 59;
    }
  }

  onSubmit() {
    // 向后端提交数据
    // 如果id==0，调用新增api；id!=0，调用更新api
    // native中name==''，将此字段同设置为null
    // native中describe==''，将此字段同设置为null
    // 根据native生成请求数据，请求数据的类型是NativeRequest
    // 调用api的新增或更新方法

    this.isSaving = true;

    if (this.native.id === 0) {
      this.add();
    } else {
      this.update();
    }
  }

  private add() {
    const requestData: HoroscopeRecordRequest = {
      ...this.native,
      name: this.native.name,
      description: this.native.description,
    };

    if (Math.abs(this.long) > 180) {
      this.isAlertOpen = true;
      this.message = '经度范围为-180~180';
      this.isSaving = false;
      return;
    }

    if (Math.abs(this.lat) > 90) {
      this.isAlertOpen = true;
      this.message = '纬度范围为-90~90';
      this.isSaving = false;
      return;
    }

    this.isSaving = true;

    this.api.addNative(requestData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.native.id = res.id;
        this.oldNative = res;
      },
      error: (err: any) => {
        this.isAlertOpen = true;
        this.message = '新增失败';
        this.isSaving = false;
      },
    });
  }

  private update() {
    const requestData: UpdateHoroscopeRecordRequest = {
      name: this.native.name === this.oldNative.name ? null : this.native.name,
      gender:
        this.native.gender === this.oldNative.gender
          ? null
          : this.native.gender,
      birth_year:
        this.native.birth_year === this.oldNative.birth_year
          ? null
          : this.native.birth_year,
      birth_month:
        this.native.birth_month === this.oldNative.birth_month
          ? null
          : this.native.birth_month,
      birth_day:
        this.native.birth_day === this.oldNative.birth_day
          ? null
          : this.native.birth_day,
      birth_hour:
        this.native.birth_hour === this.oldNative.birth_hour
          ? null
          : this.native.birth_hour,
      birth_minute:
        this.native.birth_minute === this.oldNative.birth_minute
          ? null
          : this.native.birth_minute,
      birth_second:
        this.native.birth_second === this.oldNative.birth_second
          ? null
          : this.native.birth_second,
      time_zone_offset:
        this.native.time_zone_offset === this.oldNative.time_zone_offset
          ? null
          : this.native.time_zone_offset,
      is_dst:
        this.native.is_dst === this.oldNative.is_dst
          ? null
          : this.native.is_dst,
      location: isLocationEqual(this.native.location, this.oldNative.location)
        ? null
        : this.native.location,
      description:
        this.native.description === this.oldNative.description
          ? null
          : this.native.description,
    };

    if (requestData.location) {
      if (Math.abs(this.long) > 180) {
        this.isAlertOpen = true;
        this.message = '经度范围为-180~180';
        this.isSaving = false;
        return;
      }

      if (Math.abs(this.lat) > 90) {
        this.isAlertOpen = true;
        this.message = '纬度范围为-90~90';
        this.isSaving = false;
        return;
      }
    }

    this.isSaving = true;

    this.api.updateNative(this.native.id, requestData).subscribe({
      next: (res) => {
        this.oldNative = deepClone(this.native);
        this.isSaving = false;
      },
      error: (err: any) => {
        this.isAlertOpen = true;
        this.message = '更新失败';
        this.isSaving = false;
      },
    });
  }
}
