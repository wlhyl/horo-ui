import {
  ComponentFixture,
  TestBed,
  fakeAsync,
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
import { Path as SubPath } from './enum';
import { Path } from '../type/enum/path';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonicModule,
  NavController,
} from '@ionic/angular';
import { createMockHoroRequest } from '../test-utils/test-data-factory.spec';

describe('ArchivePage', () => {
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
        { provide: IonContent, useValue: ionContentSpy },
        { provide: NavController, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivePage);
    component = fixture.componentInstance;

    fixture.detectChanges();

    // fixture.detectChanges()会将html中的content赋值给component.content
    // 因此在fixture.detectChanges()后再修改component.content的值
    component.content = ionContentSpy;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set title on init', () => {
    titleService.setTitle.calls.reset();
    component.ngOnInit();
    expect(titleService.setTitle).toHaveBeenCalledWith('档案库');
  });

  it('should initialize with correct default values', () => {
    expect(component.title).toBe('档案库');
    expect(component.path).toBe(Path);
    expect(component.isAlertOpen).toBeFalse();
    expect(component.alertButtons).toEqual(['OK']);
    expect(component.message).toBe('');
    expect(component.natives).toEqual({
      data: [],
      total: 0,
    });
  });

  it('should load natives on view will enter', () => {
    component.getNatives = jasmine.createSpy().and.stub();
    component['page'] = 2;
    component.natives.data = [mockPageResponse.data[0]];
    component.natives.total = 10;

    component.ionViewWillEnter();
    expect(component['page']).toBe(0);
    expect(component.natives.data).toEqual([]);
    expect(component.natives.total).toBe(0);
    expect(component.getNatives).toHaveBeenCalledWith(undefined, true);
  });

  describe('onIonInfinite', () => {
    let event: InfiniteScrollCustomEvent;

    beforeEach(() => {
      event = {
        target: {
          complete: jasmine.createSpy('complete'),
        },
      } as unknown as InfiniteScrollCustomEvent;

      // Spy on getNatives to verify it's called
      component.getNatives = jasmine.createSpy().and.stub();

      // Set up initial state
      component.natives = {
        data: [...mockHoroscopeRecords],
        total: 5,
      };
      component['page'] = 0;
      component['loading'] = false;
    });

    it('should handle infinite scroll event correctly', () => {
      component.onIonInfinite(event);

      // Verify that getNatives is called with the event
      expect(component.getNatives).toHaveBeenCalledWith(event);
      // Verify that page is incremented
      expect(component['page']).toBe(1);
    });

    it('should not load more if no more pages', () => {
      // Set up state where we're on the last page
      component.natives = {
        data: [...mockHoroscopeRecords],
        total: 1, // Only 1 page total
      };

      component.onIonInfinite(event);

      // Verify that getNatives is NOT called
      expect(component.getNatives).not.toHaveBeenCalled();
      // Verify that the event is completed
      expect(event.target.complete).toHaveBeenCalled();
    });

    it('should not load more if loading is true', () => {
      component['loading'] = true;

      component.onIonInfinite(event);

      expect(component.getNatives).not.toHaveBeenCalled();
      expect(event.target.complete).toHaveBeenCalled();
    });
  });

  describe('add', () => {
    it('should add new archive by navigating to edit page', () => {
      component.add();

      expect(routerSpy.navigate).toHaveBeenCalledWith([SubPath.Edit], {
        relativeTo: activatedRouteSpy,
      });
    });
  });

  describe('delete', () => {
    it('should delete native and reload natives', fakeAsync(() => {
      apiServiceSpy.deleteNative.and.returnValue(of(undefined).pipe(delay(0)));
      apiServiceSpy.getNatives.and.returnValue(
        of(mockPageResponse).pipe(delay(0))
      );

      // Spy on component's getNatives method to verify it's called with correct parameters
      spyOn(component, 'getNatives').and.callThrough();

      component.delete(1);
      tick();

      expect(component['page']).toBe(0);
      expect(apiServiceSpy.deleteNative).toHaveBeenCalledWith(1);
      expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
      // 验证getNatives方法被调用，参数为undefined和true
      expect(component.getNatives).toHaveBeenCalledWith(undefined, true);
      // 验证删除后数据是否已刷新
      expect(component.natives).toEqual(mockPageResponse);
    }));

    it('should handle error when deleting native', () => {
      const errorResponse = { error: { error: 'Delete error' } };
      apiServiceSpy.deleteNative.and.returnValue(
        throwError(() => errorResponse)
      );
      apiServiceSpy.getNatives.and.returnValue(of(mockPageResponse));

      component.delete(1);

      expect(component.message).toBe('删除档案失败！Delete error');
      expect(component.isAlertOpen).toBeTrue();
    });
  });

  describe('edit native', () => {
    it('should edit native by navigating to edit page', () => {
      const native = mockHoroscopeRecords[0];
      component.edit(native);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['edit'], {
        relativeTo: activatedRouteSpy,
        state: native,
      });
    });
  });

  describe('toHoro', () => {
    it('should navigate to horo page with correct data', () => {
      const native = mockHoroscopeRecords[0];
      const expectedHoroRequest: HoroRequest = createMockHoroRequest({
        id: 1,
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
          long: 116 + 23 / 60 + 29 / 3600,
          lat: 39 + 54 / 60 + 23 / 3600,
        },
        house: 'Alcabitus', // Default value from storageServiceSpy
        name: 'Test User',
        sex: true,
      });

      const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
        storageServiceSpy,
        'horoData'
      )?.set as jasmine.Spy;

      component.toHoro(native, '/test-path');

      expect(horoDataSetterSpy).toHaveBeenCalledWith(expectedHoroRequest);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/test-path');
    });

    it('should handle negative longitude and latitude in toHoro', () => {
      const native: HoroscopeRecord = {
        ...mockHoroscopeRecords[0],
        location: {
          ...mockHoroscopeRecords[0].location,
          is_east: false,
          is_north: false,
        },
      };

      const expectedHoroRequest: HoroRequest = createMockHoroRequest({
        id: 1,
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
          long: -(116 + 23 / 60 + 29 / 3600),
          lat: -(39 + 54 / 60 + 23 / 3600),
        },
        house: 'Alcabitus', // Default value from storageServiceSpy
        name: 'Test User',
        sex: true,
      });

      // Spy on the setter for horoData
      const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
        storageServiceSpy,
        'horoData'
      )?.set as jasmine.Spy;

      component.toHoro(native, '/test-path');

      expect(horoDataSetterSpy).toHaveBeenCalledWith(expectedHoroRequest);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/test-path');
    });

    it('should handle empty native name in toHoro', () => {
      const native: HoroscopeRecord = {
        ...mockHoroscopeRecords[0],
        name: '', // Set name to empty string
      };

      const expectedHoroRequest: HoroRequest = createMockHoroRequest({
        id: 1,
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
          long: 116 + 23 / 60 + 29 / 3600,
          lat: 39 + 54 / 60 + 23 / 3600,
        },
        house: 'Alcabitus',
        name: '', // Expect empty string
        sex: true,
      });

      const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
        storageServiceSpy,
        'horoData'
      )?.set as jasmine.Spy;

      component.toHoro(native, '/test-path');

      expect(horoDataSetterSpy).toHaveBeenCalledWith(expectedHoroRequest);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/test-path');
    });
  });

  // describe('getNatives', () => {
  //   beforeEach(() => {
  //     // Reset component state before each test
  //     component.natives = {
  //       data: [],
  //       total: 0,
  //     };
  //     component['page'] = 0;
  //   });

  //   it('should load first page of natives and replace existing data', fakeAsync(() => {
  //     apiServiceSpy.getNatives.and.returnValue(
  //       of(mockPageResponse).pipe(delay(0))
  //     );

  //     component.getNatives();
  //     tick();

  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
  //     expect(component.natives.data.length).toBe(1);
  //     expect(component.natives.total).toBe(5);
  //     expect(component['loading']).toBeFalse();
  //   }));

  //   it('should load additional pages of natives and append to existing data', fakeAsync(() => {
  //     // Set up initial data
  //     component.natives = {
  //       data: [...mockHoroscopeRecords],
  //       total: 5,
  //     };

  //     // Create mock data for second page
  //     const secondPageRecord: HoroscopeRecord = {
  //       ...mockHoroscopeRecords[0],
  //       id: 2,
  //       name: 'Test User 2',
  //     };

  //     const secondPageResponse: PageResponser<Array<HoroscopeRecord>> = {
  //       data: [secondPageRecord],
  //       total: 5,
  //     };

  //     apiServiceSpy.getNatives.and.returnValue(
  //       of(secondPageResponse).pipe(delay(0))
  //     );

  //     // 模拟加载第二页数据，
  //     component['page'] = 1;

  //     // 检查第二次调用是否正确地追加了数据
  //     component.getNatives(); // First call loads page 1
  //     tick();
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(1, 10);
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);

  //     expect(component.natives.data.length).toBe(2);
  //     expect(component.natives.data[0].id).toBe(1);
  //     expect(component.natives.data[1].id).toBe(2);
  //     expect(component.natives.total).toBe(5);
  //     expect(component['page']).toBe(1);
  //   }));

  //   it('should handle infinite scroll event and complete it', fakeAsync(() => {
  //     const event = {
  //       target: {
  //         complete: jasmine.createSpy('complete'),
  //       },
  //     } as unknown as InfiniteScrollCustomEvent;

  //     apiServiceSpy.getNatives.and.returnValue(
  //       of(mockPageResponse).pipe(delay(0))
  //     );

  //     component.getNatives(event);
  //     tick();

  //     expect(component['loading']).toBeFalse();

  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
  //     expect(event.target.complete).toHaveBeenCalled();
  //     expect(ionContentSpy.getScrollElement).not.toHaveBeenCalled();
  //   }));

  //   it('should continue loading more data if initial load and content not filled', fakeAsync(() => {
  //     // Mock HTMLElement with required properties
  //     const scrollElement = {
  //       scrollHeight: 100,
  //       clientHeight: 200,
  //     } as unknown as HTMLElement;

  //     ionContentSpy.getScrollElement.and.returnValue(
  //       Promise.resolve(scrollElement)
  //     );
  //     apiServiceSpy.getNatives.and.returnValue(
  //       of(mockPageResponse).pipe(delay(0))
  //     );

  //     // Initial load with initialLoad = true
  //     component.getNatives(undefined, true);
  //     tick();
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
  //     expect(ionContentSpy.getScrollElement).not.toHaveBeenCalled();

  //     // Wait for the setTimeout in getNatives
  //     tick(101);
  //     expect(ionContentSpy.getScrollElement).toHaveBeenCalledTimes(1);

  //     // Should have called getNatives twice (initial + additional)
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(2);
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(1, 10);
  //     expect(component['page']).toBe(1);
  //     expect(component.natives.data.length).toBe(2);
  //   }));

  //   it('should not continue loading more data if initial load and content is filled', fakeAsync(() => {
  //     // Mock HTMLElement with required properties
  //     const scrollElement = {
  //       scrollHeight: 300,
  //       clientHeight: 200,
  //     } as unknown as HTMLElement;

  //     ionContentSpy.getScrollElement.and.returnValue(
  //       Promise.resolve(scrollElement)
  //     );
  //     apiServiceSpy.getNatives.and.returnValue(
  //       of(mockPageResponse).pipe(delay(0))
  //     );

  //     // Initial load with initialLoad = true
  //     component.getNatives(undefined, true);
  //     tick();

  //     // Wait for the setTimeout in getNatives
  //     tick(101);

  //     // Should have only called getNatives once (initial)
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledTimes(1);
  //     expect(apiServiceSpy.getNatives).toHaveBeenCalledWith(0, 10);
  //     expect(ionContentSpy.getScrollElement).toHaveBeenCalled();
  //   }));

  //   it('should handle error when getting natives and reset loading state', () => {
  //     const errorResponse = { error: { error: 'Test error' } };
  //     apiServiceSpy.getNatives.and.returnValue(throwError(() => errorResponse));

  //     component.getNatives();

  //     expect(component.message).toBe('获取档案数据失败！Test error');
  //     expect(component.isAlertOpen).toBeTrue();
  //     // Verify that loading state is reset after error
  //     expect(component['loading']).toBeFalse();
  //   });

  //   it('should handle error with no error message', () => {
  //     const errorResponse = { error: {} };
  //     apiServiceSpy.getNatives.and.returnValue(throwError(() => errorResponse));

  //     component.getNatives();

  //     expect(component.message).toBe('获取档案数据失败！');
  //     expect(component.isAlertOpen).toBeTrue();
  //   });
  // });
});
