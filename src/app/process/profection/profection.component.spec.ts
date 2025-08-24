import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ProfectionComponent } from './profection.component';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  HoroRequest,
  ProcessRequest,
  ProfectionRequest,
} from 'src/app/type/interface/request-data';
import { Profection } from 'src/app/type/interface/response-data';
import { ProcessName } from '../enum/process';

// Mock data
const mockHoroData: DeepReadonly<HoroRequest> = {
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
};

const mockProcessData: DeepReadonly<ProcessRequest> = {
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
};

const mockProfectionData: Profection = {
  year_house: 5,
  month_house: 9,
  day_house: 2,
  date_per_house: [
    {
      year: 2023,
      month: 1,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      tz: 8,
    },
    {
      year: 2023,
      month: 2,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      tz: 8,
    },
  ],
};

describe('ProfectionComponent', () => {
  let component: ProfectionComponent;
  let fixture: ComponentFixture<ProfectionComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockHoroStorageService: jasmine.SpyObj<HoroStorageService>;
  let mockTitleService: jasmine.SpyObj<Title>;

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['profection']);
    mockHoroStorageService = jasmine.createSpyObj('HoroStorageService', [], {
      horoData: mockHoroData,
      processData: mockProcessData,
    });
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);

    TestBed.configureTestingModule({
      declarations: [ProfectionComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: HoroStorageService, useValue: mockHoroStorageService },
        { provide: Title, useValue: mockTitleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfectionComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set the title on ngOnInit', () => {
      // Provide a default mock return value to prevent errors in other tests
      mockApiService.profection.and.returnValue(of(mockProfectionData));

      component.ngOnInit();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('小限');
    });

    it('should call api.profection with correct request data', () => {
      mockApiService.profection.and.returnValue(of(mockProfectionData));

      component.ngOnInit();

      const expectedRequest: ProfectionRequest = {
        native_date: mockHoroData.date,
        process_date: mockProcessData.date,
      };

      expect(mockApiService.profection).toHaveBeenCalledWith(expectedRequest);
      expect(component.profection).toEqual(mockProfectionData);
    });

    it('should handle API error and show alert', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      mockApiService.profection.and.returnValue(
        throwError(() => errorResponse)
      );

      component.ngOnInit();

      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toBe('API Error Internal Server Error');
    });
  });

  describe('Component Properties', () => {
    it('should have correct initial profection data', () => {
      const initialProfection: Profection = {
        year_house: 0,
        month_house: 0,
        day_house: 0,
        date_per_house: [],
      };

      expect(component.profection).toEqual(initialProfection);
    });

    it('should have correct alert properties', () => {
      expect(component.isAlertOpen).toBe(false);
      expect(component.alertButtons).toEqual(['OK']);
      expect(component.message).toBe('');
    });

    it('should have correct path property', () => {
      expect(component.path).toBeTruthy();
    });
  });
});
