import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ProcessName } from '../enum/process';
import { ReturnComponent } from './return.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

describe('ReturnComponent Constructor', () => {
  let component: ReturnComponent;

  beforeEach(() => {
    const mockActivatedRoute = {
      snapshot: {
        data: {
          process_name: ProcessName.SolarReturn,
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should correctly get process_name from activated route data', () => {
      expect(component.process_name).toBe(ProcessName.SolarReturn);
    });
  });
});

describe('ReturnComponent with LunarReturn', () => {
  let component: ReturnComponent;

  beforeEach(() => {
    const mockLunarActivatedRoute = {
      snapshot: {
        data: {
          process_name: ProcessName.LunarReturn,
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockLunarActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set process_name to LunarReturn when activated route data has LunarReturn', () => {
    expect(component.process_name).toBe(ProcessName.LunarReturn);
  });
});

describe('ReturnComponent with invalid process_name', () => {
  it('should set message and open alert when process_name is invalid', () => {
    const mockInvalidActivatedRoute = {
      snapshot: {
        data: {
          process_name: 'InvalidProcess',
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockInvalidActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.message).toBe('无此种返照盘：InvalidProcess');
    expect(component.isAlertOpen).toBe(true);
  });

  it('should set message and open alert when process_name is null', () => {
    const mockNullActivatedRoute = {
      snapshot: {
        data: {
          process_name: null,
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockNullActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.message).toBe('配置错误，路由没有正确配置返照盘类型');
    expect(component.isAlertOpen).toBe(true);
  });

  it('should set message and open alert when process_name is undefined', () => {
    const mockUndefinedActivatedRoute = {
      snapshot: {
        data: {},
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockUndefinedActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.message).toBe('配置错误，路由没有正确配置返照盘类型');
    expect(component.isAlertOpen).toBe(true);
  });

  it('should set message and open alert when process_name is number', () => {
    const mockNumberActivatedRoute = {
      snapshot: {
        data: {
          process_name: 123,
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockNumberActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.message).toBe('无此种返照盘：123');
    expect(component.isAlertOpen).toBe(true);
  });

  it('should set message and open alert when process_name is object', () => {
    const mockObjectActivatedRoute = {
      snapshot: {
        data: {
          process_name: { name: 'SolarReturn' },
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        ReturnComponent,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockObjectActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.message).toBe('无此种返照盘：[object Object]');
    expect(component.isAlertOpen).toBe(true);
  });
});
