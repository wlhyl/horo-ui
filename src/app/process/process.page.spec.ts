import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProcessPage } from './process.page';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { Horoconfig } from '../services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { ProcessName } from './enum/process';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HoroCommonModule } from '../horo-common/horo-common.module';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { ProcessRequest, HoroRequest } from '../type/interface/request-data';
import { createMockHoroRequest, createMockProcessRequest } from '../test-utils/test-data-factory.spec';

describe('ProcessPage', () => {
  let component: ProcessPage;
  let fixture: ComponentFixture<ProcessPage>;
  let horoStorageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let routerSpy: jasmine.SpyObj<Router>;
  let configServiceSpy: jasmine.SpyObj<Horoconfig>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  const mockHoroData: HoroRequest = createMockHoroRequest({
    id: 1,
    name: 'Test User',
    sex: true,
    house: 'Placidus',
    date: {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: 'Beijing',
    geo: {
      long: 116.4,
      lat: 39.9,
    },
  });

  const mockProcessData: ProcessRequest = createMockProcessRequest({
    process_name: ProcessName.Profection,
    date: {
      year: 2023,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: 'Shanghai',
    geo: {
      long: 121.5,
      lat: 31.2,
    },
    isSolarReturn: false,
  });

  const mockHouses = ['Placidus', 'Koch', 'Campanus'];

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
      processData: mockProcessData,
    });

    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    routerSpy = jasmine.createSpyObj('Router', [
      'navigate',
      'createUrlTree',
      'serializeUrl',
    ]);
    configServiceSpy = jasmine.createSpyObj('Horoconfig', [''], {
      houses: mockHouses,
    });
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateBack']);

    // 为Router方法提供spy实现
    routerSpy.createUrlTree.and.returnValue(new UrlTree());
    routerSpy.serializeUrl.and.returnValue('url');

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      declarations: [ProcessPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HoroStorageService, useValue: horoStorageServiceSpy },
        { provide: Horoconfig, useValue: configServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
        // 正确提供NavController服务
        { provide: NavController, useValue: navControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title on init', () => {
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('推运');
  });

  it('should get new value from this.storage.horoData when entering the component', () => {
    // Arrange: 定义一个新的数据对象，服务将提供该对象。
    const updatedHoroData: HoroRequest = createMockHoroRequest({
      id: 2,
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
      house: 'Koch',
    });

    // 配置 spy 以返回新数据。
    const horoDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )!.get as jasmine.Spy;
    horoDataGetterSpy.and.returnValue(updatedHoroData);

    // 重新创建组件以使用更新的数据
    fixture = TestBed.createComponent(ProcessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert: 验证组件的数据已被正确初始化。
    expect(horoDataGetterSpy).toHaveBeenCalled();
    // 验证已进行深拷贝 (structuredClone)。
    expect(component.horaData).toEqual(updatedHoroData);
    expect(component.horaData).not.toBe(updatedHoroData);
  });

  it('should get new value from this.storage.processData when entering the component', () => {
    // Arrange: 定义一个新的数据对象，服务将提供该对象。
    const updatedProcessData: ProcessRequest = createMockProcessRequest({
      process_name: ProcessName.Firdaria,
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
      isSolarReturn: true,
    });

    // 配置 spy 以返回新数据。
    const processDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'processData'
    )!.get as jasmine.Spy;
    processDataGetterSpy.and.returnValue(updatedProcessData);

    // 重新创建组件以使用更新的数据
    fixture = TestBed.createComponent(ProcessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert: 验证组件的数据已被正确初始化。
    expect(processDataGetterSpy).toHaveBeenCalled();
    // 验证已进行深拷贝 (structuredClone)。
    expect(component.processData).toEqual(updatedProcessData);
    expect(component.processData).not.toBe(updatedProcessData);
  });

  it('should get process and navigate', () => {
    // 由于属性已经在 createSpyObj 中定义，我们直接检查调用情况
    const originalHoroData = component.horaData;
    const originalProcessData = component.processData;

    // 在调用 getProcess 之前设置 spy
    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )?.set as jasmine.Spy;

    const processDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'processData'
    )?.set as jasmine.Spy;

    component.getProcess();

    // 检查 setter 是否被正确调用
    expect(horoDataSetterSpy).toHaveBeenCalledWith(originalHoroData);
    expect(processDataSetterSpy).toHaveBeenCalledWith(originalProcessData);

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      [ProcessName.path(component.processData.process_name)],
      {
        relativeTo: TestBed.inject(ActivatedRoute),
      }
    );
  });

  it('should have correct title', () => {
    expect(component.title).toBe('推运');
  });

  it('should have correct houses property', () => {
    expect(component.houses).toBe(mockHouses);
  });

  it('should not affect original storage.horoData when modifying horaData property', () => {
    // 保存原始对象引用
    const originalHoroData = component.horaData;

    // 修改组件的horaData属性
    component.horaData.name = 'modified name';
    component.horaData.sex = false;
    component.horaData.date.year = 1990;

    // 验证storage中的horoData未被修改
    expect(horoStorageServiceSpy.horoData).toEqual(mockHoroData);
    expect(horoStorageServiceSpy.horoData).not.toBe(component.horaData);

    // 验证是同一个对象实例（因为是从storage获取的）
    expect(originalHoroData).toBe(component.horaData);
  });

  it('should not affect original storage.processData when modifying processData property', () => {
    // 保存原始对象引用
    const originalProcessData = component.processData;

    // 修改组件的processData属性
    component.processData.process_name = ProcessName.Firdaria;
    component.processData.isSolarReturn = true;
    component.processData.date.year = 2020;

    // 验证storage中的processData未被修改
    expect(horoStorageServiceSpy.processData).toEqual(mockProcessData);
    expect(horoStorageServiceSpy.processData).not.toBe(component.processData);

    // 验证是同一个对象实例（因为是从storage获取的）
    expect(originalProcessData).toBe(component.processData);
  });

  it('should store different objects in storage when calling getProcess', () => {
    // 修改组件数据
    component.horaData.name = 'test name';
    component.processData.process_name = ProcessName.Transit;

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

    // 验证storage.horoData与component.horaData是不同的对象
    const storedHoroData = horoDataSetterSpy.calls.mostRecent().args[0];
    expect(storedHoroData).toEqual(component.horaData);
    expect(storedHoroData).not.toBe(component.horaData);

    // 验证storage.processData与component.processData是不同的对象
    const storedProcessData = processDataSetterSpy.calls.mostRecent().args[0];
    expect(storedProcessData).toEqual(component.processData);
    expect(storedProcessData).not.toBe(component.processData);
  });

  it('should return correct process name', () => {
    component.currentProcess = ProcessName.Firdaria;
    expect(component.processName).toBe('法达');

    component.currentProcess = ProcessName.Profection;
    expect(component.processName).toBe('小限');
  });

  it('should return ProcessName enum', () => {
    expect(component.processNameEnum).toBe(ProcessName);
  });

  describe('processOptions', () => {
    it('should contain all process options with correct text and value', () => {
      const expectedOptions = [
        { text: '法达', value: ProcessName.Firdaria },
        { text: '小限', value: ProcessName.Profection },
        { text: '行运', value: ProcessName.Transit },
        { text: '日返', value: ProcessName.SolarReturn },
        { text: '月返', value: ProcessName.LunarReturn },
        { text: '日返比本命', value: ProcessName.SolarcomparNative },
        { text: '本命比日返', value: ProcessName.NativecomparSolar },
        { text: '月返比本命', value: ProcessName.LunarcomparNative },
        { text: '本命比月返', value: ProcessName.NativecomparLunar },
      ];

      expect(component.processOptions).toEqual(expectedOptions);
    });
  });

  describe('onIonChange', () => {
    it('should update currentProcess when ionChange event is triggered', () => {
      const event = {
        detail: {
          value: ProcessName.Firdaria,
        },
      } as CustomEvent;

      component.onIonChange(event);

      expect(component.currentProcess).toBe(ProcessName.Firdaria);
    });
  });

  describe('onDidDismiss', () => {
    it('should restore currentProcess when modal is cancelled', () => {
      const initialProcess = component.currentProcess;
      const event = {
        detail: {
          data: null,
        },
      } as CustomEvent;

      component.onDidDismiss(event);

      expect(component.currentProcess).toBe(initialProcess);
    });

    it('should update processData when modal is confirmed', () => {
      const newProcess = ProcessName.Transit;
      const event = {
        detail: {
          data: newProcess,
        },
      } as CustomEvent;

      component.onDidDismiss(event);

      expect(component.processData.process_name).toBe(newProcess);
    });
  });
});
