import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj, fakeAsync, tick, flush } from 'src/test-utils/spy';
import {
  ComponentFixture,
    TestBed,
    } from '@angular/core/testing';
import {
  InfiniteScrollCustomEvent,
  IonAlert,
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { delay, of, throwError } from 'rxjs';
import { ArchiveSelectionModalComponent } from './archive-selection-modal.component';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';
import { PageResponser } from 'src/app/type/interface/page';
import { FormsModule } from '@angular/forms';
import {
  createMockHoroscopeRecord,
  createMockLocationRecord,
} from '../../test-utils/test-data-factory.spec';

describe('ArchiveSelectionModalComponent', () => {
  let component: ArchiveSelectionModalComponent;
  let fixture: ComponentFixture<ArchiveSelectionModalComponent>;
  let mockModalController: SpyObj<ModalController>;
  let mockApiService: SpyObj<ApiService>;

  const mockRecord1: HoroscopeRecord = createMockHoroscopeRecord({
    id: 1,
    name: 'John Doe',
    gender: true,
    birth_year: 1990,
    birth_month: 1,
    birth_day: 15,
    birth_hour: 10,
    birth_minute: 30,
    birth_second: 0,
    time_zone_offset: 8,
    is_dst: false,
    location: createMockLocationRecord({
      id: 1,
      name: 'Beijing',
      is_east: true,
      longitude_degree: 116,
      longitude_minute: 24,
      longitude_second: 26,
      is_north: true,
      latitude_degree: 39,
      latitude_minute: 54,
      latitude_second: 15,
    }),
    description: 'Test record 1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
    lock: false,
  });

  const mockRecord2: HoroscopeRecord = createMockHoroscopeRecord({
    id: 2,
    name: 'Jane Smith',
    gender: false,
    birth_year: 1992,
    birth_month: 6,
    birth_day: 20,
    birth_hour: 14,
    birth_minute: 45,
    birth_second: 0,
    time_zone_offset: 8,
    is_dst: false,
    location: createMockLocationRecord({
      id: 2,
      name: 'Shanghai',
      is_east: true,
      longitude_degree: 121,
      longitude_minute: 28,
      longitude_second: 0,
      is_north: true,
      latitude_degree: 31,
      latitude_minute: 14,
      latitude_second: 0,
    }),
    description: 'Test record 2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: null,
    lock: false,
  });

  const mockPageResponse: PageResponser<HoroscopeRecord[]> = {
    data: [mockRecord1, mockRecord2],
    total: 2,
  };

  beforeEach(async () => {
    mockModalController = createSpyObj('ModalController', ['dismiss']);
    mockApiService = createSpyObj('ApiService', [
      'getNatives',
      'searchHoroscopes',
    ]);

    await TestBed.configureTestingModule({
      declarations: [ArchiveSelectionModalComponent],
      imports: [FormsModule, IonAlert, IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonSearchbar, IonSpinner, IonText, IonTitle, IonToolbar],
      providers: [
        { provide: ModalController, useValue: mockModalController },
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveSelectionModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('初始状态', () => {
    it('should have correct initial state', () => {
      expect(component.natives).toEqual([]);
      expect(component.searchQuery).toBe('');
      expect(component.loading).toBeFalsy();
      expect(component['page']).toBe(0);
      expect(component['size']).toBe(20);
      expect(component['totalPages']).toBe(0);
      expect(component['isLoadingMore']).toBeFalsy();
      expect(component['isSearchMode']).toBeFalsy();
    });

    it('should initialize searchSubject', () => {
      expect(component['searchSubject$']).toBeDefined();
    });

    it('should initialize infiniteScrollSubject', () => {
      expect(component['infiniteScrollSubject$']).toBeDefined();
    });

    it('should initialize destroy$', () => {
      expect(component['destroy$']).toBeDefined();
    });
  });

  describe('Lifecycle Hooks', () => {
    let loadRecordsSpy: Spy;
    let searchSpy: Spy;
    let handleInfiniteScrollSpy: Spy;

    beforeEach(() => {
      loadRecordsSpy =vi.spyOn(component as any, 'loadRecords').mockReturnValue(undefined);
      searchSpy =vi.spyOn(component as any, 'search').mockReturnValue(undefined);
      handleInfiniteScrollSpy =vi.spyOn(
        component as any,
        'handleInfiniteScroll',
      ).mockReturnValue(undefined);
    });

    describe('ngOnInit', () => {
      it('should load records on initialization', () => {
        component.ngOnInit();

        expect(loadRecordsSpy).toHaveBeenCalled();
      });

      it('should subscribe to searchSubject for debounced search', fakeAsync(async () => {
        component.ngOnInit();
        component['searchSubject$'].next('test');
        await tick(300);

        expect(component.searchQuery).toBe('test');
        expect(searchSpy).toHaveBeenCalled();
        await flush();
      }));

      it('should subscribe to infiniteScrollSubject for debounced infinite scroll', fakeAsync(async () => {
        component.ngOnInit();
        component['infiniteScrollSubject$'].next();
        await tick(300);

        expect(handleInfiniteScrollSpy).toHaveBeenCalled();
        await flush();
      }));
    });

    describe('ngOnDestroy', () => {
      it('should complete destroy$ on destroy', fakeAsync(async () => {
        component.ngOnInit();

       vi.spyOn(component['destroy$'], 'next');
       vi.spyOn(component['destroy$'], 'complete');

        component.ngOnDestroy();

        expect(component['searchSubject$']).toBeDefined();
        expect(component['infiniteScrollSubject$']).toBeDefined();
        expect(component['destroy$']).toBeDefined();
        expect(component['destroy$'].next).toHaveBeenCalled();
        expect(component['destroy$'].complete).toHaveBeenCalled();
        await flush();
      }));
    });
  });

  describe('loadRecords', () => {
    beforeEach(() => {
      mockApiService.getNatives.mockReturnValue(
        of(mockPageResponse).pipe(delay(0)),
      );
    });

    it('should call API with correct parameters', fakeAsync(async () => {
      component.loading = false;
      component.loadRecords();

      expect(component.loading).toBe(true);
      expect(component.natives.length).toBe(0);
      expect(component['page']).toBe(0);
      expect(component['searchParams'].page).toBe(0);

      await tick();

      expect(mockApiService.getNatives).toHaveBeenCalledWith(0, 20);

      expect(component.natives.length).toBe(2);
      expect(component.natives[0]).toEqual(mockRecord1);
      expect(component.natives[1]).toEqual(mockRecord2);
      expect(component['totalPages']).toBe(2);
      expect(component.loading).toBeFalsy();
      expect(component['isLoadingMore']).toBeFalsy();
    }));

    it('should append records when loading more', fakeAsync(async () => {
      component.natives = [mockRecord1];
      const additionalRecords: PageResponser<HoroscopeRecord[]> = {
        data: [mockRecord2],
        total: 2,
      };
      mockApiService.getNatives.mockReturnValue(
        of(additionalRecords).pipe(delay(0)),
      );

      component.loadRecords(true);

      expect(component.natives.length).toBe(1);
      expect(component['isLoadingMore']).toBeTruthy();

      await tick();

      expect(component.natives.length).toBe(2);
      expect(component.natives[1]).toEqual(mockRecord2);
      expect(component['totalPages']).toBe(2);
      expect(component.loading).toBeFalsy();
      expect(component['isLoadingMore']).toBeFalsy();
    }));

    it('should handle error when loading records', () => {
      mockApiService.getNatives.mockReturnValue(
        throwError(() => new Error('Failed to load')),
      );

      component.loadRecords();

      expect(component.alertMessage).toContain('Failed to load');
      expect(component.alertMessage).toContain('Failed to load');
      expect(component.isAlertOpen).toBeTruthy();
      expect(component.loading).toBeFalsy();
      expect(component['isLoadingMore']).toBeFalsy();
    });

    it('should return early if already loading', () => {
      component['loading'] = true;

      component.loadRecords();

      expect(mockApiService.getNatives).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      mockApiService.searchHoroscopes.mockReturnValue(
        of(mockPageResponse).pipe(delay(0)),
      );
    });

    it('should call searchHoroscopes API with correct parameters', fakeAsync(async () => {
      component.searchQuery = 'John';

      component.search();

      expect(component.loading).toBe(true);
      expect(component['isSearchMode']).toBeTruthy();
      expect(component['searchParams'].page).toBe(0);

      await tick();

      expect(mockApiService.searchHoroscopes).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 20,
          name: 'John',
        }),
      );

      expect(component.natives.length).toBe(2);
      expect(component.natives[0]).toEqual(mockRecord1);
      expect(component.natives[1]).toEqual(mockRecord2);
      expect(component['totalPages']).toBe(2);
      expect(component.loading).toBeFalsy();
      expect(component['isLoadingMore']).toBeFalsy();
    }));

    it('should not include undefined values in request params', fakeAsync(async () => {
      component.searchQuery = 'John';

      component.search();
      await tick();

      const callArgs = mockApiService.searchHoroscopes.mock.calls.at(-1)![0] as Record<string, unknown>;
      expect(callArgs.hasOwnProperty('year')).toBe(false);
      expect(callArgs.hasOwnProperty('month')).toBe(false);
      expect(callArgs.hasOwnProperty('day')).toBe(false);
      expect(callArgs.hasOwnProperty('hour')).toBe(false);
      expect(callArgs.hasOwnProperty('minute')).toBe(false);
      expect(callArgs.hasOwnProperty('second')).toBe(false);
    }));

    it('should handle search error', () => {
      mockApiService.searchHoroscopes.mockReturnValue(
        throwError(() => new Error('Search failed')),
      );
      component.searchQuery = 'test';

      component.search();

      expect(component.alertMessage).toContain('Search failed');
      expect(component.alertMessage).toContain('Search failed');
      expect(component.isAlertOpen).toBeTruthy();
      expect(component.loading).toBeFalsy();
      expect(component['isLoadingMore']).toBeFalsy();
    });

    it('should return early if already loading', () => {
      component['loading'] = true;

      component.search();

      expect(mockApiService.searchHoroscopes).not.toHaveBeenCalled();
    });

    it('should return early if already loading more', () => {
      component['isLoadingMore'] = true;

      component.search();

      expect(mockApiService.searchHoroscopes).not.toHaveBeenCalled();
    });

    it('should return early if already loading more', fakeAsync(async () => {
      component['isLoadingMore'] = true;

      component.search();

      expect(mockApiService.searchHoroscopes).not.toHaveBeenCalled();
      expect(component['isLoadingMore']).toBeTruthy();
    }));
  });

  describe('onSearchChange', () => {
    let loadRecordsSpy: Spy;
    let searchSubjectNextSpy: Spy;
    beforeEach(() => {
      loadRecordsSpy =vi.spyOn(component as any, 'loadRecords').mockReturnValue(undefined);
      searchSubjectNextSpy =vi.spyOn(
        component['searchSubject$'],
        'next',
      ).mockReturnValue(undefined);
    });

    it('should push to searchSubject when query is not empty', () => {
      const event = {
        detail: {
          value: 'John',
        },
      };
      component.onSearchChange(event);

      expect(searchSubjectNextSpy).toHaveBeenCalledWith('John');
    });

    it('should reset search mode and reload records when query is empty', () => {
      const event = {
        detail: {
          value: '',
        },
      };
      component.onSearchChange(event);

      expect(component['isSearchMode']).toBeFalsy();
      expect(component['page']).toBe(0);
      expect(loadRecordsSpy).toHaveBeenCalled();
    });

    it('should handle whitespace only query as empty', () => {
      const event = {
        detail: {
          value: '   ',
        },
      };
      component.onSearchChange(event);

      expect(component['isSearchMode']).toBeFalsy();
      expect(component['page']).toBe(0);
      expect(loadRecordsSpy).toHaveBeenCalled();
    });
  });

  describe('onIonInfinite', () => {
    let infiniteScrollSubjectNextSpy: Spy;
    let mockInfiniteScrollEvent: SpyObj<InfiniteScrollCustomEvent>;

    beforeEach(() => {
      infiniteScrollSubjectNextSpy =vi.spyOn(
        component['infiniteScrollSubject$'],
        'next',
      ).mockReturnValue(undefined);

      mockInfiniteScrollEvent = createSpyObj(
        'InfiniteScrollCustomEvent',
        [''],
      );
      mockInfiniteScrollEvent.target = createSpyObj(
        'IonInfiniteScroll',
        ['complete'],
      );
    });

    it('should not load more when already loading', () => {
      component['isLoadingMore'] = true;

      component.onIonInfinite(mockInfiniteScrollEvent);

      expect(infiniteScrollSubjectNextSpy).not.toHaveBeenCalled();
      expect(mockInfiniteScrollEvent.target.complete).toHaveBeenCalled();
    });

    it('should set isLoadingMore to true and push to subject', () => {
      component.onIonInfinite(mockInfiniteScrollEvent);

      expect(mockInfiniteScrollEvent.target.complete).toHaveBeenCalled();
      expect(infiniteScrollSubjectNextSpy).toHaveBeenCalled();
    });
  });

  describe('handleInfiniteScroll', () => {
    let searchLoadMoreSpy: Spy;
    let loadRecordsSpy: Spy;

    beforeEach(() => {
      searchLoadMoreSpy =vi.spyOn(component as any, 'searchLoadMore').mockReturnValue(undefined);
      loadRecordsSpy =vi.spyOn(component as any, 'loadRecords').mockReturnValue(undefined);
    });

    it('should not load more when at last page', () => {
      component['page'] = 4;
      component['totalPages'] = 5;
      component['isLoadingMore'] = true;

      component['handleInfiniteScroll']();

      expect(component['isLoadingMore']).toBeFalsy();
      expect(component['page']).toBe(4);
      expect(loadRecordsSpy).not.toHaveBeenCalled();
      expect(searchLoadMoreSpy).not.toHaveBeenCalled();
    });

    it('should increment page and load more records', () => {
      component['page'] = 0;
      component['totalPages'] = 2;
      component['isLoadingMore'] = true;
      component['isSearchMode'] = false;

      component['handleInfiniteScroll']();

      expect(component['page']).toBe(1);
      expect(component['searchParams'].page).toBe(1);
      expect(loadRecordsSpy).toHaveBeenCalledWith(true);
      expect(searchLoadMoreSpy).not.toHaveBeenCalled();
    });

    it('should call searchLoadMore when in search mode', () => {
      component['page'] = 0;
      component['totalPages'] = 2;
      component['isLoadingMore'] = true;
      component['isSearchMode'] = true;

      component['handleInfiniteScroll']();

      expect(component['page']).toBe(1);
      expect(component['searchParams'].page).toBe(1);
      expect(loadRecordsSpy).not.toHaveBeenCalled();
      expect(searchLoadMoreSpy).toHaveBeenCalled();
    });
  });

  describe('searchLoadMore', () => {
    beforeEach(() => {
      mockApiService.searchHoroscopes.mockReturnValue(
        of(mockPageResponse).pipe(delay(0)),
      );
    });

    it('should call searchHoroscopes API with incremented page', fakeAsync(async () => {
      component['isSearchMode'] = true;
      component['searchParams'].page = 0;
      component['size'] = 20;
      component.searchQuery = 'test';

      component['searchLoadMore']();
      await tick();

      expect(mockApiService.searchHoroscopes).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        name: 'test',
      });
    }));

    it('should append results to natives', fakeAsync(async () => {
      component.natives = [mockRecord1];
      component['isSearchMode'] = true;
      component['searchParams'].page = 0;
      component['size'] = 20;
      component.searchQuery = 'test';

      component['searchLoadMore']();
      await tick();

      expect(component.natives.length).toBe(3);
      expect(component.natives[0]).toEqual(mockRecord1);
      expect(component.natives[1]).toEqual(mockRecord1);
      expect(component.natives[2]).toEqual(mockRecord2);
    }));

    it('should handle error when loading more', () => {
      mockApiService.searchHoroscopes.mockReturnValue(
        throwError(() => new Error('Load more failed')),
      );
      component.natives = [mockRecord1];
      component['isSearchMode'] = true;
      component['searchParams'].page = 0;
      component['size'] = 20;
      component.searchQuery = 'test';

      component['searchLoadMore']();

      expect(component.alertMessage).toContain('Load more failed');
      expect(component.alertMessage).toContain('Load more failed');
      expect(component.isAlertOpen).toBeTruthy();
      expect(component['isLoadingMore']).toBeFalsy();
    });
  });

  describe('selectRecord', () => {
    it('should dismiss modal with selected record', () => {
      component.selectRecord(mockRecord1);
      expect(mockModalController.dismiss).toHaveBeenCalledWith(mockRecord1);

      component.selectRecord(mockRecord2);
      expect(mockModalController.dismiss).toHaveBeenCalledWith(mockRecord2);
    });
  });

  describe('dismiss', () => {
    it('should dismiss modal with null', () => {
      component.dismiss();

      expect(mockModalController.dismiss).toHaveBeenCalledWith(null);
    });
  });
});
