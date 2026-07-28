import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ProcessName } from '../enum/process';
import { ReturnComponent } from './return.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

describe('ReturnComponent Lifecycle Hooks', () => {
  let component: ReturnComponent;
  let mockTitleService: jasmine.SpyObj<Title>;
  let drawHoroscopeSpy: jasmine.Spy;

  beforeEach(() => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
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
        IonicModule.forRoot(),
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

    drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();

    spyOn(component as any, 'createCanvas').and.returnValue({
      dispose: jasmine.createSpy('dispose'),
      toJSON: jasmine.createSpy('toJSON'),
      loadFromJSON: jasmine.createSpy('loadFromJSON'),
      renderAll: jasmine.createSpy('renderAll'),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title on ngOnInit', () => {
    component.ngOnInit();
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('日返');
  });

  it('should initialize canvas on ngAfterViewInit', fakeAsync(() => {
    component.ngAfterViewInit();
    // ngAfterViewInit 通过 setTimeout 调用 drawHoroscope，需 flush 定时器
    tick();
    expect((component as any).createCanvas).toHaveBeenCalled();
    expect(drawHoroscopeSpy).toHaveBeenCalledWith(ProcessName.SolarReturn);
  }));

  it('should dispose canvas on ngOnDestroy', fakeAsync(() => {
    component.ngAfterViewInit();
    tick();
    const canvas = (component as any).canvas;
    const disposeSpy = canvas.dispose;
    const destroyCompleteSpy = spyOn(
      (component as any).destroy$,
      'complete'
    ).and.callThrough();

    component.ngOnDestroy();

    expect(disposeSpy).toHaveBeenCalled();
    expect((component as any).canvas).toBeUndefined();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  }));
});
