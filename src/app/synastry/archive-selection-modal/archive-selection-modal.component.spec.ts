import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ModalController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { delay, of, throwError } from 'rxjs';
import { ArchiveSelectionModalComponent } from './archive-selection-modal.component';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';
import { PageResponser } from 'src/app/type/interface/page';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  createMockHoroscopeRecord,
  createMockLocationRecord,
} from '../../test-utils/test-data-factory.spec';

describe('ArchiveSelectionModalComponent', () => {
  let component: ArchiveSelectionModalComponent;
  let fixture: ComponentFixture<ArchiveSelectionModalComponent>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockApiService: jasmine.SpyObj<ApiService>;

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
    mockModalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getNatives']);

    await TestBed.configureTestingModule({
      declarations: [ArchiveSelectionModalComponent],
      imports: [FormsModule, IonicModule],
      providers: [
        { provide: ModalController, useValue: mockModalController },
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveSelectionModalComponent);
    component = fixture.componentInstance;
  });

  describe('初始状态', () => {
    it('should have correct initial state', () => {
      expect(component.natives).toEqual([]);
      expect(component.searchQuery).toBe('');
      expect(component.loading).toBe(false);
      expect(component['page']).toBe(0);
      expect(component['size']).toBe(20);
      expect(component['totalPages']).toBe(0);
      expect(component['isLoadingMore']).toBe(false);
      expect(component['allRecords']).toEqual([]);
    });
  });

  describe('ngOnInit', () => {
    it('should load records on initialization', () => {
      mockApiService.getNatives.and.returnValue(of(mockPageResponse));
      spyOn(component, 'loadRecords');

      component.ngOnInit();

      expect(component.loadRecords).toHaveBeenCalled();
    });
  });

  describe('loadRecords', () => {
    it('should call API with correct parameters', fakeAsync(() => {
      mockApiService.getNatives.and.returnValue(of(mockPageResponse));

      component.loadRecords();

      expect(mockApiService.getNatives).toHaveBeenCalledWith(0, 20);
    }));

    it('should load initial records', fakeAsync(() => {
      mockApiService.getNatives.and.returnValue(of(mockPageResponse));

      component.loadRecords();

      expect(component.natives.length).toBe(2);
      expect(component.natives[0]).toEqual(mockRecord1);
      expect(component.natives[1]).toEqual(mockRecord2);
      expect(component.loading).toBe(false);
    }));

    it('should set loading to true before loading', fakeAsync(() => {
      mockApiService.getNatives.and.returnValue(
        of(mockPageResponse).pipe(delay(0))
      );

      component.loading = false;
      component.loadRecords();

      expect(component.loading).toBe(true);
    }));

    it('should reset page and natives when not loading more', fakeAsync(() => {
      component.natives = [mockRecord1];
      mockApiService.getNatives.and.returnValue(
        of(mockPageResponse).pipe(delay(0))
      );

      component.loadRecords(false);

      expect(component.natives.length).toBe(0);

      tick();

      expect(component.natives.length).toBe(2);
    }));

    it('should append records when loading more', fakeAsync(() => {
      component.natives = [mockRecord1];
      const additionalRecords: PageResponser<HoroscopeRecord[]> = {
        data: [mockRecord2],
        total: 2,
      };
      mockApiService.getNatives.and.returnValue(
        of(additionalRecords).pipe(delay(0))
      );

      component.loadRecords(true);

      expect(component.natives.length).toBe(1);

      tick();

      expect(component.natives.length).toBe(2);
      expect(component.natives[1]).toEqual(mockRecord2);
    }));

    it('should handle error when loading records', () => {
      mockApiService.getNatives.and.returnValue(
        throwError(() => new Error('Failed to load'))
      );
      spyOn(console, 'error');

      component.loadRecords();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should reset loading states in finalize', fakeAsync(() => {
      const delayResponse = of(mockPageResponse).pipe(delay(100));
      mockApiService.getNatives.and.returnValue(delayResponse);

      component.loadRecords(true);
      expect(component['isLoadingMore']).toBe(true);

      tick(100);
      expect(component['isLoadingMore']).toBe(false);
    }));

    it('should reset loading state on error', fakeAsync(() => {
      mockApiService.getNatives.and.returnValue(
        throwError(() => new Error('Failed'))
      );

      component.loadRecords();
      tick();

      expect(component.loading).toBe(false);
      expect(component['isLoadingMore']).toBe(false);
    }));
  });

  describe('onSearchChange', () => {
    beforeEach(() => {
      component['allRecords'] = [mockRecord1, mockRecord2];
    });

    it('should be case insensitive', () => {
      const event = {
        detail: {
          value: 'jane',
        },
      };

      component.onSearchChange(event);

      expect(component.natives.length).toBe(1);
      expect(component.natives[0]).toEqual(mockRecord2);
    });

    it('should return empty list when no matches found', () => {
      const event = {
        detail: {
          value: 'NonExistent',
        },
      };

      component.onSearchChange(event);

      expect(component.natives.length).toBe(0);
    });

    it('should handle partial name matching', () => {
      const event = {
        detail: {
          value: 'Smith',
        },
      };

      component.onSearchChange(event);

      expect(component.natives.length).toBe(1);
      expect(component.natives[0]).toEqual(mockRecord2);
    });

    it('should handle empty query', () => {
      const event = {
        detail: {
          value: '',
        },
      };

      component.onSearchChange(event);

      expect(component.natives.length).toBe(2);
      expect(component.natives).toEqual(component['allRecords']);
    });

    it('should handle empty allRecords', () => {
      component['allRecords'] = [];
      const event = {
        detail: {
          value: 'test',
        },
      };

      component.onSearchChange(event);

      expect(component.natives.length).toBe(0);
    });

    it('should maintain allRecords separately from natives', fakeAsync(() => {
      mockApiService.getNatives.and.returnValue(of(mockPageResponse));

      component.ngOnInit();
      tick();

      const searchEvent = {
        detail: {
          value: 'John',
        },
      };
      component.onSearchChange(searchEvent);

      expect(component.natives.length).toBe(1);
      expect(component['allRecords'].length).toBe(2);

      const clearSearchEvent = {
        detail: {
          value: '',
        },
      };
      component.onSearchChange(clearSearchEvent);

      expect(component.natives.length).toBe(2);
      expect(component['allRecords'].length).toBe(2);
    }));
  });

  describe('onIonInfinite', () => {
    let mockInfiniteScrollEvent: jasmine.SpyObj<InfiniteScrollCustomEvent>;

    beforeEach(() => {
      mockInfiniteScrollEvent = jasmine.createSpyObj(
        'InfiniteScrollCustomEvent',
        ['complete']
      );
      mockInfiniteScrollEvent.target = jasmine.createSpyObj(
        'IonInfiniteScroll',
        ['complete']
      );
    });

    it('should not load more when already loading', () => {
      component['isLoadingMore'] = true;
      spyOn(component, 'loadRecords');

      component.onIonInfinite(mockInfiniteScrollEvent);

      expect(component.loadRecords).not.toHaveBeenCalled();
      expect(mockInfiniteScrollEvent.target.complete).toHaveBeenCalled();
    });

    it('should not load more when at last page', () => {
      component['page'] = 4;
      component['totalPages'] = 5;
      component['isLoadingMore'] = false;
      spyOn(component, 'loadRecords');

      component.onIonInfinite(mockInfiniteScrollEvent);

      expect(component.loadRecords).not.toHaveBeenCalled();
      expect(mockInfiniteScrollEvent.target.complete).toHaveBeenCalled();
    });

    it('should load more records when not at last page', () => {
      component['page'] = 0;
      component['totalPages'] = 2;
      component['isLoadingMore'] = false;
      mockApiService.getNatives.and.returnValue(of(mockPageResponse));
      spyOn(component, 'loadRecords');

      component.onIonInfinite(mockInfiniteScrollEvent);

      expect(component['page']).toBe(1);
      expect(component.loadRecords).toHaveBeenCalledWith(true);
      expect(mockInfiniteScrollEvent.target.complete).toHaveBeenCalled();
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
