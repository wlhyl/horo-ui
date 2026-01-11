import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { SynastryComponent } from './synastry.component';
import { HoroscopeComparison } from 'src/app/type/interface/response-data';

describe('isAspect property', () => {
  let component: SynastryComponent;
  let fixture: ComponentFixture<SynastryComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let drawSpy: jasmine.Spy;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['compare']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockActivatedRoute = {};

    await TestBed.configureTestingModule({
      declarations: [SynastryComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SynastryComponent);
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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
    component['horoscopeComparisonData'] = {} as HoroscopeComparison;

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
    component['horoscopeComparisonData'] = {} as HoroscopeComparison;

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
    component['horoscopeComparisonData'] = {} as HoroscopeComparison;

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
