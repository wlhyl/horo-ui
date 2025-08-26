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
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;
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
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockLunarActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;
  });

  it('should set process_name to LunarReturn when activated route data has LunarReturn', () => {
    expect(component.process_name).toBe(ProcessName.LunarReturn);
  });
});

describe('ReturnComponent with invalid process_name', () => {
  it('should alert and log error when process_name is invalid', () => {
    const mockInvalidActivatedRoute = {
      snapshot: {
        data: {
          process_name: 'InvalidProcess',
        },
      },
    };

    const alertSpy = spyOn(window, 'alert');
    const consoleSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockInvalidActivatedRoute },
      ],
    });

    TestBed.createComponent(ReturnComponent);

    expect(alertSpy).toHaveBeenCalledWith('无此种返照盘：InvalidProcess');
    expect(consoleSpy).toHaveBeenCalledWith('无此种返照盘：InvalidProcess');
  });

  it('should alert and log error when process_name is null', () => {
    const mockNullActivatedRoute = {
      snapshot: {
        data: {
          process_name: null,
        },
      },
    };

    const alertSpy = spyOn(window, 'alert');
    const consoleSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockNullActivatedRoute },
      ],
    });

    TestBed.createComponent(ReturnComponent);

    expect(alertSpy).toHaveBeenCalledWith('配置错误，没有正确配置返照盘类型');
    expect(consoleSpy).toHaveBeenCalledWith(
      '配置错误，路由没有正确配置返照盘类型'
    );
  });

  it('should alert and log error when process_name is undefined', () => {
    const mockUndefinedActivatedRoute = {
      snapshot: {
        data: {},
      },
    };

    const alertSpy = spyOn(window, 'alert');
    const consoleSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockUndefinedActivatedRoute },
      ],
    });

    TestBed.createComponent(ReturnComponent);

    expect(alertSpy).toHaveBeenCalledWith('配置错误，没有正确配置返照盘类型');
    expect(consoleSpy).toHaveBeenCalledWith(
      '配置错误，路由没有正确配置返照盘类型'
    );
  });

  it('should alert and log error when process_name is number', () => {
    const mockNumberActivatedRoute = {
      snapshot: {
        data: {
          process_name: 123,
        },
      },
    };

    const alertSpy = spyOn(window, 'alert');
    const consoleSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockNumberActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);

    expect(alertSpy).toHaveBeenCalledWith('无此种返照盘：123');
    expect(consoleSpy).toHaveBeenCalledWith('无此种返照盘：123');
  });

  it('should alert and log error when process_name is object', () => {
    const mockObjectActivatedRoute = {
      snapshot: {
        data: {
          process_name: { name: 'SolarReturn' },
        },
      },
    };

    const alertSpy = spyOn(window, 'alert');
    const consoleSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: mockObjectActivatedRoute },
      ],
    });

    TestBed.createComponent(ReturnComponent);

    expect(alertSpy).toHaveBeenCalledWith('无此种返照盘：[object Object]');
    expect(consoleSpy).toHaveBeenCalledWith('无此种返照盘：[object Object]');
  });
});
