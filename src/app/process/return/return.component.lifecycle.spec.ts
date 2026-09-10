import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj, fakeAsync, tick } from 'src/test-utils/spy';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ProcessName } from '../enum/process';
import { ReturnComponent } from './return.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

describe('ReturnComponent Lifecycle Hooks', () => {
  let component: ReturnComponent;
  let mockTitleService: SpyObj<Title>;
  let drawHoroscopeSpy: Spy;

  beforeEach(() => {
    mockTitleService = createSpyObj('Title', ['setTitle']);
    const mockActivatedRoute = {
      snapshot: {
        data: {
          process_name: ProcessName.SolarReturn,
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        ReturnComponent,
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: {} },
        { provide: Title, useValue: mockTitleService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;

    drawHoroscopeSpy =vi.spyOn(component as any, 'drawHoroscope').mockReturnValue(undefined);

   vi.spyOn(component as any, 'createCanvas').mockReturnValue({
      dispose: createSpy('dispose'),
      toJSON: createSpy('toJSON'),
      loadFromJSON: createSpy('loadFromJSON'),
      renderAll: createSpy('renderAll'),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title on ngOnInit', () => {
    component.ngOnInit();
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('日返');
  });

  it('should initialize canvas on ngAfterViewInit', fakeAsync(async () => {
    component.ngAfterViewInit();
    // ngAfterViewInit 通过 setTimeout 调用 drawHoroscope，需 flush 定时器
    await tick();
    expect((component as any).createCanvas).toHaveBeenCalled();
    expect(drawHoroscopeSpy).toHaveBeenCalledWith(ProcessName.SolarReturn);
  }));

  it('should dispose canvas on ngOnDestroy', fakeAsync(async () => {
    component.ngAfterViewInit();
    await tick();
    const canvas = (component as any).canvas;
    const disposeSpy = canvas.dispose;
    const destroyCompleteSpy =vi.spyOn(
      (component as any).destroy$,
      'complete'
    );

    component.ngOnDestroy();

    expect(disposeSpy).toHaveBeenCalled();
    expect((component as any).canvas).toBeUndefined();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  }));
});
