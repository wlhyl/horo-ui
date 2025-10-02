/**
 * 将getNatives的测试分离到一个单独的测试文件，
 * 避免因异步引起的测试失败
 * 在异步测试中，setTimeout容易污染异步
 */

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { ArchivePage } from './archive.page';
import { Title } from '@angular/platform-browser';
import { ApiService } from '../services/api/api.service';
import { HoroStorageService } from '../services/horostorage/horostorage.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { delay, of, throwError } from 'rxjs';
import { PageResponser } from '../type/interface/page';
import { HoroscopeRecord } from '../type/interface/horo-admin/horoscope-record';
import { HoroRequest } from '../type/interface/request-data';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonicModule,
  NavController,
} from '@ionic/angular';

describe('getNatives', () => {
  let component: ArchivePage;
  let fixture: ComponentFixture<ArchivePage>;
  let titleService: jasmine.SpyObj<Title>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let storageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let ionContentSpy: jasmine.SpyObj<IonContent>;

  const mockHoroscopeRecords: HoroscopeRecord[] = [
    {
      id: 1,
      name: 'Test User',
      gender: true,
      birth_year: 1990,
      birth_month: 1,
      birth_day: 1,
      birth_hour: 12,
      birth_minute: 0,
      birth_second: 0,
      time_zone_offset: 8,
      is_dst: false,
      location: {
        id: 1,
        name: 'Beijing',
        longitude_degree: 116,
        longitude_minute: 23,
        longitude_second: 29,
        latitude_degree: 39,
        latitude_minute: 54,
        latitude_second: 23,
        is_east: true,
        is_north: true,
      },
      description: '',
      created_at: '2023-01-01',
      updated_at: null,
      lock: false,
    },
  ];

  const mockPageResponse: PageResponser<Array<HoroscopeRecord>> = {
    data: mockHoroscopeRecords,
    total: 5,
  };

  beforeEach(async () => {
    titleService = jasmine.createSpyObj('Title', ['setTitle']);
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getNatives',
      'deleteNative',
    ]);
    storageServiceSpy = jasmine.createSpyObj('HoroStorageService', [], {
      horoData: { house: 'Alcabitus' } as HoroRequest,
    });
    routerSpy = jasmine.createSpyObj('Router', [
      'navigate',
      'navigateByUrl',
      // 用于防止routerlink报错
      'createUrlTree',
    ]);
    activatedRouteSpy = jasmine.createSpyObj(
      'ActivatedRoute',
      ['snapshot'],
      {}
    );
    ionContentSpy = jasmine.createSpyObj('IonContent', ['getScrollElement']);

    await TestBed.configureTestingModule({
      declarations: [ArchivePage],
      imports: [
        IonicModule.forRoot(),
        // 用于防止ionion-title中routerlink报错
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: Title, useValue: titleService },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: HoroStorageService, useValue: storageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: NavController, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivePage);
    component = fixture.componentInstance;

    // 第一次调用会触发angular的部分生命周期函数，如OnInit
    fixture.detectChanges();

    // fixture.detectChanges()会将html中的content赋值给component.content
    // 因此在fixture.detectChanges()后再修改component.content的值
    component.content = ionContentSpy;

    // Reset component state before each test
    component.natives = {
      data: [],
      total: 0,
    };
    component['page'] = 0;

    apiServiceSpy.getNatives.calls.reset();
  });

  it('should load first page of natives and replace existing data', fakeAsync(() => {
    apiServiceSpy.getNatives.and.returnValue(
      of(structuredClone(mockPageResponse)).pipe(delay(0))
    );

    component.getNatives();
    tick();

    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
    expect(component.natives.data.length).toBe(1);
    expect(component.natives.total).toBe(5);
    expect(component['loading']).toBeFalse();
    expect(ionContentSpy.getScrollElement).not.toHaveBeenCalled();

    flush();
  }));

  it('should load additional pages of natives and append to existing data', fakeAsync(() => {
    // Set up initial data
    component.natives = structuredClone(mockPageResponse);

    // Create mock data for second page
    const secondPageRecord: HoroscopeRecord = {
      ...mockHoroscopeRecords[0],
      id: 2,
      name: 'Test User 2',
    };

    const secondPageResponse: PageResponser<Array<HoroscopeRecord>> = {
      data: [secondPageRecord],
      total: 5,
    };

    apiServiceSpy.getNatives.and.returnValue(
      of(secondPageResponse).pipe(delay(0))
    );

    // 模拟加载第二页数据，
    component['page'] = 1;

    // 检查第二次调用是否正确地追加了数据
    component.getNatives(); // First call loads page 1
    tick();
    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(1, 10);
    expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);

    expect(component.natives.data.length).toBe(2);
    expect(component.natives.data[0].id).toBe(1);
    expect(component.natives.data[1].id).toBe(2);
    expect(component.natives.total).toBe(5);
    expect(component['page']).toBe(1);
    expect(ionContentSpy.getScrollElement).not.toHaveBeenCalled();

    flush();
  }));

  it('should handle infinite scroll event and complete it', fakeAsync(() => {
    const event = {
      target: {
        complete: jasmine.createSpy('complete'),
      },
    } as unknown as InfiniteScrollCustomEvent;

    apiServiceSpy.getNatives.and.returnValue(
      of(structuredClone(mockPageResponse)).pipe(delay(0))
    );

    component.getNatives(event);
    tick();

    expect(component['loading']).toBeFalse();

    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
    expect(event.target.complete).toHaveBeenCalled();
    expect(ionContentSpy.getScrollElement).not.toHaveBeenCalled();

    flush();
  }));

  it('should continue loading more data if initial load and content not filled', fakeAsync(() => {
    // Mock HTMLElement with required properties
    const scrollElementNotFilled = {
      scrollHeight: 100,
      clientHeight: 200,
    } as unknown as HTMLElement;

    const scrollElementFilled = {
      scrollHeight: 300,
      clientHeight: 200,
    } as unknown as HTMLElement;

    ionContentSpy.getScrollElement.and.returnValues(
      Promise.resolve(scrollElementNotFilled),
      Promise.resolve(scrollElementFilled)
    );
    const secondPageRecord: HoroscopeRecord = {
      ...mockHoroscopeRecords[0],
      id: 2,
      name: 'Test User 2',
    };

    const secondPageResponse: PageResponser<Array<HoroscopeRecord>> = {
      data: [secondPageRecord],
      total: 5,
    };
    apiServiceSpy.getNatives.and.returnValues(
      // 注意：必需要使用structuredClone
      // 如果直接返回mockPageResponse，
      // mockPageResponse的引用会被赋值给component.natives
      // 当第二次调用component.getNatives时，
      // secondPageRecord被追加到component.natives.data中，
      // 实际也就会添加到mockPageResponse中
      // 这亲就污染mockPageResponse
      // 导致后续的测试结果错误
      of(structuredClone(mockPageResponse)).pipe(delay(0)),
      of(secondPageResponse).pipe(delay(0))
    );

    // Initial load with initialLoad = true
    component.getNatives(undefined, true);

    // 触发api.getNatives
    tick();

    expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
    expect(component.natives.data.length).toBe(1);

    // trigger ngZone.onStable
    fixture.detectChanges();

    // Should have called getNatives twice (initial + additional)
    expect(ionContentSpy.getScrollElement).toHaveBeenCalledTimes(1);

    tick();

    expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(2);
    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(1, 10);
    expect(component['page']).toBe(1);
    expect(component.natives.data.length).toBe(2);

    // scrollElement.scrollHeight < scrollElement.clientHeight
    // 由于上述条件仍然成立，apiServiceSpy.getNatives()还会被调用，
    // 因此异步中仍然还有剩余任务。
    // 这会污染后续的测试。
    // 因此应当确保所有异步任务已经完成。
    // 但简单的使用tick()无法解决
    // 因为上述条件仍然成立，apiServiceSpy.getNatives()还会被调用，
    // 使用apiServiceSpy.getNatives()会无限调用。

    // 再次触发onStable，由于ionContentSpy.getScrollElement会返回scrollElementFilled，
    // scrollHeight > clientHeight，因此不会再调用getNatives
    fixture.detectChanges();
    tick();

    expect(ionContentSpy.getScrollElement).toHaveBeenCalledTimes(2);
    // 确认没有更多调用
    expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(2);
  }));

  it('should not continue loading more data if initial load and content is filled', fakeAsync(() => {
    // Mock HTMLElement with required properties
    const scrollElement = {
      scrollHeight: 300,
      clientHeight: 200,
    } as unknown as HTMLElement;

    ionContentSpy.getScrollElement.and.returnValue(
      Promise.resolve(scrollElement)
    );

    const secondPageRecord: HoroscopeRecord = {
      ...mockHoroscopeRecords[0],
      id: 2,
      name: 'Test User 2',
    };

    const secondPageResponse: PageResponser<Array<HoroscopeRecord>> = {
      data: [secondPageRecord],
      total: 5,
    };

    const thirdPageRecord: HoroscopeRecord = {
      ...mockHoroscopeRecords[0],
      id: 3,
      name: 'Test User 3',
    };

    const thirdPageResponse: PageResponser<Array<HoroscopeRecord>> = {
      data: [thirdPageRecord],
      total: 5,
    };

    apiServiceSpy.getNatives.and.returnValues(
      of(structuredClone(mockPageResponse)).pipe(delay(0)),
      of(secondPageResponse).pipe(delay(0)),
      of(thirdPageResponse).pipe(delay(0))
    );

    // Initial load with initialLoad = true
    component.getNatives(undefined, true);

    // 触发api.getNatives
    tick();

    expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
    expect(component['page']).toBe(0);
    expect(component.natives.data.length).toBe(1);

    // trigger ngZone.onStable
    fixture.detectChanges();

    // Should not have called getScrollElement (ngZone.onStable might not be triggered in tests)
    expect(ionContentSpy.getScrollElement).toHaveBeenCalledTimes(1);

    tick();

    // And should not have called getNatives again (no additional loading)
    expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
    expect(component['page']).toBe(0);
    expect(component.natives.data.length).toBe(1);
  }));

  it('should handle error when getting natives and reset loading state', () => {
    const errorResponse = { error: { error: 'Test error' } };
    apiServiceSpy.getNatives.and.returnValue(throwError(() => errorResponse));

    component.getNatives();

    expect(component.message).toBe('获取档案数据失败！Test error');
    expect(component.isAlertOpen).toBeTrue();
    // Verify that loading state is reset after error
    expect(component['loading']).toBeFalse();
  });

  it('should handle error with no error message', () => {
    const errorResponse = { error: {} };
    apiServiceSpy.getNatives.and.returnValue(throwError(() => errorResponse));

    component.getNatives();

    expect(component.message).toBe('获取档案数据失败！');
    expect(component.isAlertOpen).toBeTrue();
  });
});
