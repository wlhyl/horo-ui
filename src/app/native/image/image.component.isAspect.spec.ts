import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj, fakeAsync, tick } from 'src/test-utils/spy';
import {
  ComponentFixture,
  TestBed,
    } from '@angular/core/testing';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ImageComponent } from './image.component';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { RouterModule } from '@angular/router';

describe('isAspect property', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  let mockApiService: SpyObj<ApiService>;
  let mockAuthService: SpyObj<AuthService>;

  let drawSpy: Spy;

  beforeEach(async () => {
    mockApiService = createSpyObj('ApiService', ['getNativeHoroscope']);
    mockAuthService = createSpyObj('AuthService', ['isAuth']);

    await TestBed.configureTestingModule({
      imports: [
        ImageComponent,
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;

    const canvas = ((component as any).canvas = {
      dispose: createSpy('dispose'),
      toJSON: createSpy('toJSON'),
      loadFromJSON: createSpy('loadFromJSON'),
      renderAll: createSpy('renderAll'),
    });
    canvas.loadFromJSON.mockReturnValue(Promise.resolve(canvas));

    drawSpy =vi.spyOn(component as any, 'draw').mockImplementation(() => {});

    // fixture.detectChanges(); // 触发 ngOnInit 和 ngAfterViewInit
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
    drawSpy.mockClear(); // 重置 spy

    // 再次设置为 true
    component.isAspect = true;
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should redraw when the value changes and not drawing/loading', () => {
    component.isDrawing = false;
    component.loading = false;
    component['canvasCache'] = undefined;

    // 从 false 变为 true
    component.isAspect = true;
    expect(component.isAspect).toBe(true);
    expect(drawSpy).toHaveBeenCalled();

    drawSpy.mockClear();
    component['canvasCache'] = undefined;

    // 从 true 变为 false
    component.isAspect = false;
    expect(component.isAspect).toBe(false);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should not change value or redraw if drawing is in progress', () => {
    component.isAspect = false; // 初始状态
    component.isDrawing = true;

    // 尝试将值从 false 改为 true
    component.isAspect = true;

    // 值应该保持不变，并且不应该触发绘制
    expect(component.isAspect).toBe(false);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should not change value or redraw if loading is in progress', () => {
    component.isAspect = false; // 初始状态
    component.loading = true;

    // 尝试将值从 false 改为 true
    component.isAspect = true;

    // 值应该保持不变，并且不应该触发绘制
    expect(component.isAspect).toBe(false);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should use canvas cache when available', fakeAsync(async () => {
    // 设置初始状态
    component.isDrawing = false;
    component.loading = false;
    const expectedCanvasCache = { version: 'test', objects: [] };
    component['canvasCache'] = expectedCanvasCache;

    const canvas = (component as any).canvas;
    const loadFromJSONSpy = canvas.loadFromJSON;
    const renderAllSpy = canvas.renderAll;

    drawSpy.mockClear();

    // 改变 isAspect 值
    component.isAspect = true;
    await tick(); // 等待异步操作完成

    // 验证使用了缓存而不是重新绘制
    expect(loadFromJSONSpy).toHaveBeenCalledWith(expectedCanvasCache);
    expect(renderAllSpy).toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  }));

  it('should save canvas to cache when changing isAspect value', () => {
    component.isDrawing = false;
    component.loading = false;
    component['canvasCache'] = undefined;

    const expectedCanvasJson = { version: 'test', objects: [] };
    const canvas = (component as any).canvas;
    const toJSONSpy = canvas.toJSON.mockReturnValue(expectedCanvasJson);
    drawSpy.mockClear();

    // 改变 isAspect 值
    component.isAspect = true;

    // 验证保存了当前画布状态到缓存
    expect(toJSONSpy).toHaveBeenCalled();
    expect(component['canvasCache']).toEqual(expectedCanvasJson as any);
    expect(drawSpy).toHaveBeenCalled();
  });
});
