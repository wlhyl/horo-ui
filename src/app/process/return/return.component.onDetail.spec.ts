import { TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ReturnComponent } from './return.component';
import { RouterModule, Router } from '@angular/router';
import { ProcessName } from '../enum/process';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Path } from '../enum/path';
import { ReturnHoroscope } from 'src/app/type/interface/response-data';
import { mockSolarReturnHoroscopeData } from '../compare/compare.component.const.spec';

describe('onDetail', () => {
  let component: ReturnComponent;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

    const mockSnapshot: Partial<ActivatedRouteSnapshot> = {
      data: {
        process_name: ProcessName.SolarReturn,
      },
    };

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: mockSnapshot,
    });

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: NavController, useValue: {} },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;
  });

  it('should navigate to detail page with data if returnHoroscopeData exists', () => {
    const mockData: ReturnHoroscope = mockSolarReturnHoroscopeData;
    component.returnHoroscopeData = mockData;
    component.onDetail();
    expect(mockRouter.navigate).toHaveBeenCalledWith([Path.ReturnDetails], {
      relativeTo: mockActivatedRoute,
      state: { data: mockData },
    });
  });

  it('should not navigate if returnHoroscopeData is null', () => {
    component.returnHoroscopeData = null;
    component.onDetail();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
