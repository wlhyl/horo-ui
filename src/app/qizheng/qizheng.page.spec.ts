import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { QizhengPage } from './qizheng.page';
import { Path as subPath } from './path';
import { IonicModule, NavController } from '@ionic/angular';
import { HoroCommonModule } from '../horo-common/horo-common.module';
import { FormsModule } from '@angular/forms';
import { HoroRequest, ProcessRequest } from '../type/interface/request-data';
import { ProcessName } from '../process/enum/process';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TimeZoneComponent } from '../horo-common/time-zone/time-zone.component';
import { MapComponent } from '../horo-common/geo/map.component';
import { GeoComponent } from '../horo-common/geo/geo.component';
import { DateTimeComponent } from '../horo-common/date-time/date-time.component';
import { Path } from '../type/enum/path';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('QizhengPage', () => {
  let component: QizhengPage;
  let fixture: ComponentFixture<QizhengPage>;
  let horoStorageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  const mockHoroData: HoroRequest = {
    id: 0,
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
    geo: {
      long: 120,
      lat: 30,
    },
    name: 'name',
    sex: true,
    geo_name: 'city',
    house: 'Alcabitus',
  };

  const mockProcessData: ProcessRequest = {
    date: {
      year: 2020,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: 'cty',
    geo: {
      long: 120,
      lat: 30,
    },
    process_name: ProcessName.Profection,
    isSolarReturn: false,
  };

  mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
    snapshot: { dat: 'test' },
  });

  beforeEach(async () => {
    horoStorageServiceSpy = jasmine.createSpyObj('HoroStorageService', [], {
      horoData: mockHoroData,
      processData: mockProcessData,
    });

    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      // 以下属性是为了模拟 RouterLink
      {
        routerState: { root: mockActivatedRoute },
        events: of(),
      }
    );

    await TestBed.configureTestingModule({
      declarations: [QizhengPage],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        FormsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HoroStorageService, useValue: horoStorageServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NavController, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QizhengPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title on init', () => {
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('七政四余');
  });

  it('should initialize horoData and processData from storage service', () => {
    expect(component.horoData).toEqual(mockHoroData);
    expect(component.processData).toEqual(mockProcessData);

    // 检查 getter 是否被正确调用
    const horoDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )?.get;
    const processDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'processData'
    )?.get;

    expect(horoDataGetterSpy).toBeDefined();
    expect(processDataGetterSpy).toBeDefined();

    expect(horoDataGetterSpy).toHaveBeenCalled();
    expect(processDataGetterSpy).toHaveBeenCalled();
  });

  it('should get process and navigate', () => {
    // 由于属性已经在 createSpyObj 中定义，我们直接检查调用情况
    const originalHoroData = component.horoData;
    const originalProcessData = component.processData;

    component.getProcess();

    // 检查 setter 是否被正确调用
    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )?.set as jasmine.Spy;
    const processDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'processData'
    )?.set as jasmine.Spy;

    expect(horoDataSetterSpy).toHaveBeenCalledWith(originalHoroData);
    expect(processDataSetterSpy).toHaveBeenCalledWith(originalProcessData);

    expect(routerSpy.navigate).toHaveBeenCalledWith([subPath.Horo], {
      relativeTo: mockActivatedRoute,
    });
  });

  it('should have correct title', () => {
    expect(component.title).toBe('七政四余');
  });

  it('should have correct path property', () => {
    expect(component.path).toBe(Path);
  });

  it('should not affect original storage.horoData when modifying horoData property', () => {
    // 保存原始对象引用
    const originalHoroData = component.horoData;

    // 修改组件的horoData属性
    component.horoData.name = 'modified name';
    component.horoData.sex = false;
    component.horoData.date.year = 1990;

    // 验证storage中的horoData未被修改
    expect(horoStorageServiceSpy.horoData).toEqual(mockHoroData);
    expect(horoStorageServiceSpy.horoData).not.toBe(component.horoData);

    // 验证是相同的对象实例
    expect(originalHoroData).toBe(component.horoData);
  });

  it('should not affect original storage.processData when modifying processData property', () => {
    // 保存原始对象引用
    const originalProcessData = component.processData;

    // 修改组件的processData属性
    component.processData.process_name = ProcessName.Firdaria;
    component.processData.date.year = 2000;
    component.processData.isSolarReturn = true;

    // 验证storage中的processData未被修改
    expect(horoStorageServiceSpy.processData).toEqual(mockProcessData);
    expect(horoStorageServiceSpy.processData).not.toBe(component.processData);

    // 验证是不同的对象实例
    expect(originalProcessData).toBe(component.processData);
  });

  it('should store different objects in storage when calling getProcess', () => {
    // 修改组件数据
    component.horoData.name = 'test name';
    component.processData.process_name = ProcessName.Firdaria;

    // 调用getProcess方法
    component.getProcess();

    // 检查setter是否被正确调用
    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )?.set as jasmine.Spy;
    const processDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'processData'
    )?.set as jasmine.Spy;

    // 验证storage.horoData与component.horoData是不同的对象
    const storedHoroData = horoDataSetterSpy.calls.mostRecent().args[0];
    expect(storedHoroData).toEqual(component.horoData);
    expect(storedHoroData).not.toBe(component.horoData);

    // 验证storage.processData与component.processData是不同的对象
    const storedProcessData = processDataSetterSpy.calls.mostRecent().args[0];
    expect(storedProcessData).toEqual(component.processData);
    expect(storedProcessData).not.toBe(component.processData);
  });

  describe('Form Controls', () => {
    let nameInput: DebugElement;
    let radioGroup: DebugElement;
    let birthDSTCheckbox: DebugElement;
    let processDSTCheckbox: DebugElement;
    let submitButton: DebugElement;
    let birthTimezone: DebugElement;
    let processTimezone: DebugElement;
    let mapComponent: DebugElement;
    let geoComponent: DebugElement;
    let birthDateTime: DebugElement;
    let processDateTime: DebugElement;

    beforeEach(() => {
      // 使用 id 获取表单控件元素
      nameInput = fixture.debugElement.query(By.css('#horo-name'));
      radioGroup = fixture.debugElement.query(By.css('#horo-sex'));
      birthDSTCheckbox = fixture.debugElement.query(By.css('#horo-birth-dst'));
      processDSTCheckbox = fixture.debugElement.query(By.css('#process-dst'));
      submitButton = fixture.debugElement.query(By.css('#submit-button'));
      birthTimezone = fixture.debugElement.query(
        By.css('#horo-birth-timezone')
      );
      processTimezone = fixture.debugElement.query(By.css('#process-timezone'));
      mapComponent = fixture.debugElement.query(By.css('horo-map'));
      geoComponent = fixture.debugElement.query(By.css('horo-geo'));
      birthDateTime = fixture.debugElement.query(By.css('#horo-birth-date'));
      processDateTime = fixture.debugElement.query(By.css('#process-date'));

      fixture.detectChanges();
    });

    it('should update name when input changes', () => {
      const newName = 'new name';
      const inputElement = nameInput.nativeElement as HTMLInputElement;

      // 模拟用户输入
      inputElement.value = newName;
      inputElement.dispatchEvent(new Event('ionInput'));
      fixture.detectChanges();

      expect(component.horoData.name).toBe(newName);
    });

    it('should update sex when radio changes', () => {
      const radioGroupElement = radioGroup.nativeElement;

      // 模拟选择女性
      radioGroupElement.value = false;
      radioGroupElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.horoData.sex).toBe(false);

      // 模拟选择男性
      radioGroupElement.value = true;
      radioGroupElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.horoData.sex).toBe(true);
    });

    it('should update birth DST when checkbox changes', () => {
      const checkboxElement =
        birthDSTCheckbox.nativeElement as HTMLIonCheckboxElement;

      // 模拟用户点击复选框
      checkboxElement.checked = true;
      checkboxElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.horoData.date.st).toBe(true);

      checkboxElement.checked = false;
      checkboxElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.horoData.date.st).toBe(false);
    });

    it('should update process DST when checkbox changes', () => {
      const checkboxElement =
        processDSTCheckbox.nativeElement as HTMLIonCheckboxElement;

      // 模拟用户点击复选框
      checkboxElement.checked = true;
      checkboxElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.processData.date.st).toBe(true);

      checkboxElement.checked = false;
      checkboxElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.processData.date.st).toBe(false);
    });

    it('should update birth timezone when selection changes', () => {
      const newTimezone = -5;
      const timezoneComponent =
        birthTimezone.componentInstance as TimeZoneComponent;

      // 模拟组件内部修改 zone 输出
      timezoneComponent.zone = newTimezone;
      timezoneComponent.zoneChange.emit(newTimezone);
      fixture.detectChanges();

      expect(component.horoData.date.tz).toBe(newTimezone);
    });

    it('should update process timezone when selection changes', () => {
      const newTimezone = -5;
      const timezoneComponent =
        processTimezone.componentInstance as TimeZoneComponent;

      // 模拟组件内部修改 zone 输出
      timezoneComponent.zone = newTimezone;
      timezoneComponent.zoneChange.emit(newTimezone);
      fixture.detectChanges();

      expect(component.processData.date.tz).toBe(newTimezone);
    });

    it('should update birth place name when map component changes', () => {
      const newPlaceName = 'New City';
      const mapComp = mapComponent.componentInstance as MapComponent;

      // 模拟组件内部修改 localName 输出
      mapComp.localName = newPlaceName;
      mapComp.localNameChange.emit(newPlaceName);
      fixture.detectChanges();

      expect(component.horoData.geo_name).toBe(newPlaceName);
    });

    it('should update birth longitude when map component changes', () => {
      const newLongitude = 110.5;
      const mapComp = mapComponent.componentInstance as MapComponent;

      // 模拟组件内部修改 long 输出
      mapComp.long = newLongitude;
      mapComp.longChange.emit(newLongitude);
      fixture.detectChanges();

      expect(component.horoData.geo.long).toBe(newLongitude);
    });

    it('should update birth latitude when map component changes', () => {
      const newLatitude = 35.2;
      const mapComp = mapComponent.componentInstance as MapComponent;

      // 模拟组件内部修改 lat 输出
      mapComp.lat = newLatitude;
      mapComp.latChange.emit(newLatitude);
      fixture.detectChanges();

      expect(component.horoData.geo.lat).toBe(newLatitude);
    });

    it('should update birth place name when geo component changes', () => {
      const newPlaceName = 'Another City';
      const geoComp = geoComponent.componentInstance as GeoComponent;

      // 模拟组件内部修改 geoLocalName 输出
      geoComp.geoLocalName = newPlaceName;
      geoComp.geoLocalNameChange.emit(newPlaceName);
      fixture.detectChanges();

      expect(component.horoData.geo_name).toBe(newPlaceName);
    });

    it('should update birth longitude when geo component changes', () => {
      const newLongitude = 125.8;
      const geoComp = geoComponent.componentInstance as GeoComponent;

      // 模拟组件内部修改 geoLong 输出
      geoComp.geoLong = newLongitude;
      geoComp.geoLongChange.emit(newLongitude);
      fixture.detectChanges();

      expect(component.horoData.geo.long).toBe(newLongitude);
    });

    it('should update birth latitude when geo component changes', () => {
      const newLatitude = 45.3;
      const geoComp = geoComponent.componentInstance as GeoComponent;

      // 模拟组件内部修改 geoLat 输出
      geoComp.geoLat = newLatitude;
      geoComp.geoLatChange.emit(newLatitude);
      fixture.detectChanges();

      expect(component.horoData.geo.lat).toBe(newLatitude);
    });

    it('should update birth date when date-time component changes', () => {
      const newYear = 1990;
      const newMonth = 5;
      const newDay = 15;
      const newHour = 12;
      const newMinute = 30;
      const newSecond = 45;

      const dateTimeComponent =
        birthDateTime.componentInstance as DateTimeComponent;

      // 模拟组件内部修改年份输出
      dateTimeComponent.year = newYear;
      dateTimeComponent.yearChange.emit(newYear);
      fixture.detectChanges();
      expect(component.horoData.date.year).toBe(newYear);

      // 模拟组件内部修改月份输出
      dateTimeComponent.month = newMonth;
      dateTimeComponent.monthChange.emit(newMonth);
      fixture.detectChanges();
      expect(component.horoData.date.month).toBe(newMonth);

      // 模拟组件内部修改日期输出
      dateTimeComponent.day = newDay;
      dateTimeComponent.dayChange.emit(newDay);
      fixture.detectChanges();
      expect(component.horoData.date.day).toBe(newDay);

      // 模拟组件内部修改小时输出
      dateTimeComponent.hour = newHour;
      dateTimeComponent.hourChange.emit(newHour);
      fixture.detectChanges();
      expect(component.horoData.date.hour).toBe(newHour);

      // 模拟组件内部修改分钟输出
      dateTimeComponent.minute = newMinute;
      dateTimeComponent.minuteChange.emit(newMinute);
      fixture.detectChanges();
      expect(component.horoData.date.minute).toBe(newMinute);

      // 模拟组件内部修改秒数输出
      dateTimeComponent.second = newSecond;
      dateTimeComponent.secondChange.emit(newSecond);
      fixture.detectChanges();
      expect(component.horoData.date.second).toBe(newSecond);
    });

    it('should update process date when date-time component changes', () => {
      const newYear = 2025;
      const newMonth = 8;
      const newDay = 20;
      const newHour = 18;
      const newMinute = 45;
      const newSecond = 30;

      const dateTimeComponent =
        processDateTime.componentInstance as DateTimeComponent;

      // 模拟组件内部修改年份输出
      dateTimeComponent.year = newYear;
      dateTimeComponent.yearChange.emit(newYear);
      fixture.detectChanges();
      expect(component.processData.date.year).toBe(newYear);

      // 模拟组件内部修改月份输出
      dateTimeComponent.month = newMonth;
      dateTimeComponent.monthChange.emit(newMonth);
      fixture.detectChanges();
      expect(component.processData.date.month).toBe(newMonth);

      // 模拟组件内部修改日期输出
      dateTimeComponent.day = newDay;
      dateTimeComponent.dayChange.emit(newDay);
      fixture.detectChanges();
      expect(component.processData.date.day).toBe(newDay);

      // 模拟组件内部修改小时输出
      dateTimeComponent.hour = newHour;
      dateTimeComponent.hourChange.emit(newHour);
      fixture.detectChanges();
      expect(component.processData.date.hour).toBe(newHour);

      // 模拟组件内部修改分钟输出
      dateTimeComponent.minute = newMinute;
      dateTimeComponent.minuteChange.emit(newMinute);
      fixture.detectChanges();
      expect(component.processData.date.minute).toBe(newMinute);

      // 模拟组件内部修改秒数输出
      dateTimeComponent.second = newSecond;
      dateTimeComponent.secondChange.emit(newSecond);
      fixture.detectChanges();
      expect(component.processData.date.second).toBe(newSecond);
    });

    it('should call getProcess when submit button is clicked', () => {
      spyOn(component, 'getProcess');

      // 模拟点击提交按钮
      submitButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.getProcess).toHaveBeenCalled();
    });
  });
});
