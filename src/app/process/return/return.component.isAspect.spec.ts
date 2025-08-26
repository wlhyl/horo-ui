import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ReturnComponent } from './return.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReturnHoroscope } from 'src/app/type/interface/response-data';
import { ProcessName } from 'src/app/process/enum/process';

describe('isAspect property', () => {
  let component: ReturnComponent;

  let drawSpy: jasmine.Spy;

  beforeEach(() => {
    const mockActivatedRoute = {
      snapshot: { data: { process_name: ProcessName.SolarReturn } },
    };

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
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;

    const canvas = ((component as any).canvas = {
      dispose: jasmine.createSpy('dispose'),
      toJSON: jasmine.createSpy('toJSON'),
      loadFromJSON: jasmine.createSpy('loadFromJSON'),
      renderAll: jasmine.createSpy('renderAll'),
    });
    canvas.loadFromJSON.and.returnValue(Promise.resolve(canvas));

    drawSpy = spyOn(component as any, 'draw').and.stub();
  });

  //   it('should create', () => {
  //     expect(component).toBeTruthy();
  //   });

  it('should have an initial value of false and allow getting and setting', () => {
    // 初始值应该是false
    expect(component.isAspect).toBe(false);

    // 设置为 true
    component.isAspect = true;
    expect(component.isAspect).toBe(true);

    // 设置回 false
    component.isAspect = false;
    expect(component.isAspect).toBe(false);
  });

  it('should not redraw when the same value is set', () => {
    component.isAspect = true;
    drawSpy.calls.reset(); // 重置 spy

    // 再次设置为 true
    component.isAspect = true;
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should redraw when the value changes and not drawing/loading', () => {
    component.isDrawing = false;
    component.loading = false;
    component['canvasCache'] = undefined;
    component['returnHoroscopeData'] = {} as ReturnHoroscope;

    component.isAspect = true;
    expect(component.isAspect).toBe(true);
    expect(drawSpy).toHaveBeenCalled();

    drawSpy.calls.reset();
    component['canvasCache'] = undefined;

    component.isAspect = false;
    expect(component.isAspect).toBe(false);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should not change value or redraw if drawing is in progress', () => {
    component.isAspect = false;
    component.isDrawing = true;

    component.isAspect = true;

    expect(component.isAspect).toBe(false);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should not change value or redraw if loading is in progress', () => {
    component.isAspect = false;
    component.loading = true;

    component.isAspect = true;

    expect(component.isAspect).toBe(false);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should use canvas cache when available', fakeAsync(() => {
    // 设置初始状态
    component.isDrawing = false;
    component.loading = false;
    const expectedCanvasCache = { version: 'test', objects: [] };
    component['canvasCache'] = expectedCanvasCache;
    component['returnHoroscopeData'] = {} as ReturnHoroscope;

    const canvas = (component as any).canvas;
    const loadFromJSONSpy = canvas.loadFromJSON;
    const renderAllSpy = canvas.renderAll;

    drawSpy.calls.reset();

    // 改变 isAspect 值
    component.isAspect = true;
    tick(); // 等待异步操作完成

    // 验证使用了缓存而不是重新绘制
    expect(loadFromJSONSpy).toHaveBeenCalledWith(expectedCanvasCache);
    expect(renderAllSpy).toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  }));

  it('should save canvas to cache when changing isAspect value', () => {
    component.isDrawing = false;
    component.loading = false;
    component['canvasCache'] = undefined;
    component['returnHoroscopeData'] = {} as ReturnHoroscope;

    const expectedCanvasJson = { version: 'test', objects: [] };
    const canvas = (component as any).canvas;
    const toJSONSpy = canvas.toJSON.and.returnValue(expectedCanvasJson);
    drawSpy.calls.reset();

    // 改变 isAspect 值
    component.isAspect = true;

    // 验证保存了当前画布状态到缓存
    expect(toJSONSpy).toHaveBeenCalled();
    expect(component['canvasCache']).toEqual(expectedCanvasJson as any);
    expect(drawSpy).toHaveBeenCalled();
  });
});
