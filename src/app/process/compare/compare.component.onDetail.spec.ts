import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { CompareComponent } from './compare.component';
import { RouterModule, Router } from '@angular/router';
import { ProcessName } from '../enum/process';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Path } from '../enum/path';

describe('onDetail', () => {
  let component: CompareComponent;
  let fixture: ComponentFixture<CompareComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockNavController: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockNavController = jasmine.createSpyObj('NavController', [], {
      // Mock the subscribe property that's causing the error
      events: {
        subscribe: jasmine.createSpy('subscribe'),
      },
    });

    // Create a proper mock for ActivatedRouteSnapshot
    const mockSnapshot: Partial<ActivatedRouteSnapshot> = {
      data: {
        process_name: ProcessName.Transit,
      },
    };

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: mockSnapshot,
    });

    const mockApiService = jasmine.createSpyObj('ApiService', ['compare']);

    await TestBed.configureTestingModule({
      declarations: [CompareComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;

    // Mock canvas for component initialization
    const canvas = ((component as any).canvas = {
      dispose: jasmine.createSpy('dispose'),
      toJSON: jasmine.createSpy('toJSON'),
      loadFromJSON: jasmine.createSpy('loadFromJSON'),
      renderAll: jasmine.createSpy('renderAll'),
    });
    canvas.loadFromJSON.and.returnValue(Promise.resolve(canvas));

    // Prevent actual drawing in tests
    spyOn(component as any, 'drawHoroscope').and.stub();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to detail page with data if horoscopeComparisonData exists', () => {
    const mockData = {} as any;
    component.horoscopeComparisonData = mockData;
    component.onDetail();
    expect(mockRouter.navigate).toHaveBeenCalledWith([Path.ComparisonDetails], {
      relativeTo: mockActivatedRoute,
      state: { data: mockData },
    });
  });

  it('should not navigate if horoscopeComparisonData is null', () => {
    component.horoscopeComparisonData = null;
    component.onDetail();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
