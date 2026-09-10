import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj, fakeAsync, tick } from 'src/test-utils/spy';
import { TestBed } from '@angular/core/testing';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ReturnComponent } from './return.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReturnHoroscope } from 'src/app/type/interface/response-data';
import { ProcessName } from 'src/app/process/enum/process';

describe('isAspect property', () => {
  let component: ReturnComponent;

  let drawSpy: Spy;
  let canvas: {
    dispose: Spy;
    toJSON: Spy;
    loadFromJSON: Spy;
    renderAll: Spy;
  };

  beforeEach(() => {
    const mockActivatedRoute = {
      snapshot: { data: { process_name: ProcessName.SolarReturn } },
    };

    TestBed.configureTestingModule({
      imports: [
        ReturnComponent,
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

    canvas = (component as any).canvas = {
      dispose: createSpy('dispose'),
      toJSON: createSpy('toJSON'),
      loadFromJSON: createSpy('loadFromJSON'),
      renderAll: createSpy('renderAll'),
    };
    canvas.loadFromJSON.mockReturnValue(Promise.resolve(canvas));

    drawSpy =vi.spyOn(component as any, 'draw').mockReturnValue(undefined);
  });

  it('should have an initial value of false', () => {
    expect(component.isAspect).toBe(false);
  });

  it('should have no side effects when the same value is set', () => {
    component.isAspect = false;

    expect(component.isAspect).toBe(false);
    expect(canvas.toJSON).not.toHaveBeenCalled();
    expect(canvas.loadFromJSON).not.toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should change value, save the canvas, and redraw when data is available', () => {
    const returnHoroscopeData = {} as ReturnHoroscope;
    const canvasJson = { version: 'current', objects: [] };
    component['returnHoroscopeData'] = returnHoroscopeData;
    canvas.toJSON.mockReturnValue(canvasJson);

    component.isAspect = true;

    expect(component.isAspect).toBe(true);
    expect(canvas.toJSON).toHaveBeenCalledTimes(1);
    expect(component['canvasCache']).toEqual(canvasJson as any);
    expect(drawSpy).toHaveBeenCalledTimes(1);
    expect(drawSpy).toHaveBeenCalledWith(returnHoroscopeData);
    expect(canvas.loadFromJSON).not.toHaveBeenCalled();
  });

  it('should have no side effects when drawing is in progress', () => {
    const canvasCache = { version: 'cached', objects: [] };
    component['canvasCache'] = canvasCache;
    component.isDrawing = true;

    component.isAspect = true;

    expect(component.isAspect).toBe(false);
    expect(component['canvasCache']).toBe(canvasCache);
    expect(canvas.toJSON).not.toHaveBeenCalled();
    expect(canvas.loadFromJSON).not.toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should have no side effects when loading is in progress', () => {
    const canvasCache = { version: 'cached', objects: [] };
    component['canvasCache'] = canvasCache;
    component.loading = true;

    component.isAspect = true;

    expect(component.isAspect).toBe(false);
    expect(component['canvasCache']).toBe(canvasCache);
    expect(canvas.toJSON).not.toHaveBeenCalled();
    expect(canvas.loadFromJSON).not.toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should swap canvas state with the cache when one is available', fakeAsync(async () => {
    const cachedCanvasJson = { version: 'cached', objects: [] };
    const currentCanvasJson = { version: 'current', objects: [] };
    component['canvasCache'] = cachedCanvasJson;
    canvas.toJSON.mockReturnValue(currentCanvasJson);

    component.isAspect = true;
    await tick();

    expect(component.isAspect).toBe(true);
    expect(canvas.toJSON).toHaveBeenCalledTimes(1);
    expect(component['canvasCache']).toEqual(currentCanvasJson as any);
    expect(canvas.loadFromJSON).toHaveBeenCalledTimes(1);
    expect(canvas.loadFromJSON).toHaveBeenCalledWith(cachedCanvasJson);
    expect(canvas.renderAll).toHaveBeenCalledTimes(1);
    expect(drawSpy).not.toHaveBeenCalled();
  }));

  it('should show an alert when neither cache nor return data is available', () => {
    component['canvasCache'] = undefined;
    component['returnHoroscopeData'] = null;

    component.isAspect = true;

    expect(component.isAspect).toBe(true);
    expect(component.isAlertOpen).toBe(true);
    expect(component.message).toBe('应用异常，返照盘数据丢失!');
    expect(canvas.toJSON).toHaveBeenCalledTimes(1);
    expect(canvas.loadFromJSON).not.toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });
});
