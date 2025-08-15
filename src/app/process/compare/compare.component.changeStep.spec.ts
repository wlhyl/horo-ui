import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { CompareComponent } from './compare.component';
import { RouterModule } from '@angular/router';
import { ProcessName } from '../enum/process';
import { ActivatedRoute } from '@angular/router';
import { mockProcessData } from './compare.component.const.spec';

describe('changeStep', () => {
  let component: CompareComponent;
  let fixture: ComponentFixture<CompareComponent>;
  let drawHoroscopeSpy: jasmine.Spy;

  beforeEach(async () => {
    const mockApiService = jasmine.createSpyObj('ApiService', ['compare']);
    const mockActivatedRoute = {
      snapshot: {
        data: {
          process_name: ProcessName.Transit,
        },
      },
    };

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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;

    drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();

    const canvas = ((component as any).canvas = {
      dispose: jasmine.createSpy('dispose'),
      toJSON: jasmine.createSpy('toJSON'),
      loadFromJSON: jasmine.createSpy('loadFromJSON'),
      renderAll: jasmine.createSpy('renderAll'),
    });
    canvas.loadFromJSON.and.returnValue(Promise.resolve(canvas));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeStep with debounce', () => {
    it('should only call applyStepChange once after rapid calls due to debounce', fakeAsync(() => {
      //   spyOn(component as any, 'drawHoroscope').and.stub();
      const applyStepChangeSpy = spyOn(
        component as any,
        'applyStepChange'
      ).and.stub();

      // 触发 ngOnInit 以设置订阅, 同时会触发 ngAfterViewInit
      fixture.detectChanges(); // ngOnInit

      applyStepChangeSpy.calls.reset();

      const step = { year: 0, month: 0, day: 1, hour: 0, minute: 0, second: 0 };

      component.changeStep(step);
      component.changeStep(step);
      component.changeStep(step);

      tick(299);
      expect(applyStepChangeSpy).not.toHaveBeenCalled();

      tick(1);
      expect(applyStepChangeSpy).toHaveBeenCalledTimes(1);

      flush();
    }));
  });

  describe('applyStepChange', () => {

    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
    });

    it('should update currentProcessData date correctly and redraw', () => {
      const step = { year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1 };
      (component as any).applyStepChange(step);

      const expectedDate = new Date(2024, 6, 16, 15, 31, 1); // 2023-06-15 + 1-1-1-1-1-1

      expect(component.currentProcessData.date.year).toBe(
        expectedDate.getFullYear()
      );
      expect(component.currentProcessData.date.month).toBe(
        expectedDate.getMonth() + 1
      );
      expect(component.currentProcessData.date.day).toBe(
        expectedDate.getDate()
      );
      expect(component.currentProcessData.date.hour).toBe(
        expectedDate.getHours()
      );
      expect(component.currentProcessData.date.minute).toBe(
        expectedDate.getMinutes()
      );
      expect(component.currentProcessData.date.second).toBe(
        expectedDate.getSeconds()
      );
      expect(drawHoroscopeSpy).toHaveBeenCalledWith(component.process_name);
    });

    it('should handle negative step values correctly', () => {
      const step = {
        year: -1,
        month: -1,
        day: -1,
        hour: -1,
        minute: -1,
        second: -1,
      };
      (component as any).applyStepChange(step);

      // After fix, the correct expected date should be:
      // 2023-06-15 14:30:00 - 1 year, 1 month, 1 day, 1 hour, 1 minute, 1 second
      // = 2022-05-14 13:28:59
      const expectedDate = new Date(2022, 4, 14, 13, 28, 59); // Month is 0-indexed in Date constructor

      expect(component.currentProcessData.date.year).toBe(
        expectedDate.getFullYear()
      );
      expect(component.currentProcessData.date.month).toBe(
        expectedDate.getMonth() + 1
      );
      expect(component.currentProcessData.date.day).toBe(
        expectedDate.getDate()
      );
      expect(component.currentProcessData.date.hour).toBe(
        expectedDate.getHours()
      );
      expect(component.currentProcessData.date.minute).toBe(
        expectedDate.getMinutes()
      );
      expect(component.currentProcessData.date.second).toBe(
        expectedDate.getSeconds()
      );
      expect(drawHoroscopeSpy).toHaveBeenCalledWith(component.process_name);
    });
  });
});
