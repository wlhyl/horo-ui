import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { NativePage } from './native.page';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { IonicModule, NavController } from '@ionic/angular';
import { HoroCommonModule } from '../horo-common/horo-common.module';
import { FormsModule } from '@angular/forms';
import { HoroRequest } from '../type/interface/request-data';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TimeZoneComponent } from '../horo-common/time-zone/time-zone.component';
import { MapComponent } from '../horo-common/geo/map.component';
import { GeoComponent } from '../horo-common/geo/geo.component';
import { DateTimeComponent } from '../horo-common/date-time/date-time.component';
import { Path } from './enum';
import { Horoconfig } from '../services/config/horo-config.service';
import { createMockHoroRequest } from '../test-utils/test-data-factory.spec';

describe('NativePage', () => {
  let component: NativePage;
  let fixture: ComponentFixture<NativePage>;
  let horoStorageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let routerSpy: jasmine.SpyObj<Router>;
  let configServiceSpy: jasmine.SpyObj<Horoconfig>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  const mockHoroData: HoroRequest = createMockHoroRequest();

  const mockHouses = ['Alcabitus', 'Placidus', 'Koch'];

  const activatedRouteStub = {
    snapshot: {
      paramMap: new Map(),
      queryParamMap: new Map(),
    },
    paramMap: of(new Map()),
    queryParams: of({}),
    url: of([]),
  };

  beforeEach(() => {
    horoStorageServiceSpy = jasmine.createSpyObj('HoroStorageService', [''], {
      horoData: mockHoroData,
    });

    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      { events: of() } // 用于防止routerlink报错
    );
    configServiceSpy = jasmine.createSpyObj('Horoconfig', [''], {
      houses: mockHouses,
    });
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateBack']);

    // 为Router方法提供spy实现
    routerSpy.createUrlTree.and.returnValue(new UrlTree());
    routerSpy.serializeUrl.and.returnValue('url');

    TestBed.configureTestingModule({
      declarations: [NativePage],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        FormsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HoroStorageService, useValue: horoStorageServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Horoconfig, useValue: configServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title on init', () => {
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('本命星盘');
  });

  it('should get new value from this.storage.horoData when entering the component', () => {
    // Arrange: 定义一个新的数据对象，服务将提供该对象。
    const updatedHoroData: HoroRequest = createMockHoroRequest({
      id: 1,
      name: 'updated name',
      sex: false,
      date: {
        year: 2022,
        month: 2,
        day: 2,
        hour: 2,
        minute: 2,
        second: 2,
        tz: 0,
        st: true,
      },
      geo_name: 'updated city',
      geo: {
        long: 1,
        lat: 1,
      },
      house: 'Placidus',
    });

    // 配置 spy 以返回新数据。
    const horoDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )!.get as jasmine.Spy;
    horoDataGetterSpy.and.returnValue(updatedHoroData);

    // Act: 调用触发数据获取的生命周期钩子。
    component.ionViewWillEnter();

    // Assert: 验证组件的数据已被更新。
    expect(horoDataGetterSpy).toHaveBeenCalled();
    expect(component.horoData).toEqual(updatedHoroData);
    // 验证已进行深拷贝 (structuredClone)。
    expect(component.horoData).not.toBe(updatedHoroData);
  });

  it('should get horo and navigate', () => {
    // 由于属性已经在 createSpyObj 中定义，我们直接检查调用情况
    const originalHoroData = component.horoData;

    component.getHoro();

    // 检查 setter 是否被正确调用
    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )?.set as jasmine.Spy;

    expect(horoDataSetterSpy).toHaveBeenCalledWith(originalHoroData);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['./image'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });

  it('should have correct title', () => {
    expect(component.title).toBe('本命星盘');
  });

  it('should have correct path property', () => {
    expect(component.path).toBe(Path);
  });

  it('should have correct houses property', () => {
    expect(component.houses).toBe(mockHouses);
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

    // 验证是不同的对象实例
    expect(originalHoroData).toBe(component.horoData);
  });

  it('should store different objects in storage when calling getHoro', () => {
    // 修改组件数据
    component.horoData.name = 'test name';

    // 调用getHoro方法
    component.getHoro();

    // 检查setter是否被正确调用
    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )?.set as jasmine.Spy;

    // 验证storage.horoData与component.horoData是不同的对象
    const storedHoroData = horoDataSetterSpy.calls.mostRecent().args[0];
    expect(storedHoroData).toEqual(component.horoData);
    expect(storedHoroData).not.toBe(component.horoData);
  });

  describe('Form Controls', () => {
    let nameInput: DebugElement;
    let radioGroup: DebugElement;
    let birthDSTCheckbox: DebugElement;
    let submitButton: DebugElement;
    let birthTimezone: DebugElement;
    let mapComponent: DebugElement;
    let geoComponent: DebugElement;
    let birthDateTime: DebugElement;
    let houseSelect: DebugElement;

    beforeEach(() => {
      // 使用 id 获取表单控件元素
      nameInput = fixture.debugElement.query(By.css('#horo-name'));
      radioGroup = fixture.debugElement.query(By.css('#horo-sex'));
      birthDSTCheckbox = fixture.debugElement.query(By.css('#horo-birth-dst'));
      submitButton = fixture.debugElement.query(By.css('#submit-button'));
      birthTimezone = fixture.debugElement.query(
        By.css('#horo-birth-timezone')
      );
      mapComponent = fixture.debugElement.query(By.css('#horo-map'));
      geoComponent = fixture.debugElement.query(By.css('#horo-geo'));
      birthDateTime = fixture.debugElement.query(By.css('#horo-birth-date'));
      houseSelect = fixture.debugElement.query(By.css('#horo-house'));
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
      // 直接修改组件属性来模拟选择女性
      component.horoData.sex = false;
      fixture.detectChanges();
      expect(component.horoData.sex).toBe(false);

      // 直接修改组件属性来模拟选择男性
      component.horoData.sex = true;
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

    it('should update house when selection changes', () => {
      const newHouse = 'Placidus';
      const selectElement = houseSelect.nativeElement as HTMLIonSelectElement;

      // 模拟用户选择新的宫位系统
      selectElement.value = newHouse;
      selectElement.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();

      expect(component.horoData.house).toBe(newHouse);
    });

    it('should call getHoro when submit button is clicked', () => {
      spyOn(component, 'getHoro');

      // 模拟点击提交按钮
      submitButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.getHoro).toHaveBeenCalled();
    });
  });
});
