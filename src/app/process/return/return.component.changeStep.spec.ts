import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { ProcessName } from '../enum/process';
import { ReturnComponent } from './return.component';
import { RouterModule } from '@angular/router';
import { mockProcessData } from '../compare/compare.component.const.spec';

describe('ReturnComponent', () => {
  let component: ReturnComponent;

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
  });

  describe('changeStep', () => {
    let drawHoroscopeSpy: jasmine.Spy;
    let changeStepSubjectNextSpy: jasmine.Spy;

    beforeEach(() => {
      // 初始化 currentProcessData
      component.currentProcessData = structuredClone(mockProcessData);

      // Spy on drawHoroscope
      drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();

      // Spy on changeStepSubject.next
      changeStepSubjectNextSpy = spyOn(
        (component as any).changeStepSubject,
        'next'
      ).and.stub();
    });

    it('should update year correctly', () => {
      const step = {
        year: 1,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.year).toBe(2024); // 2023 + 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled(); // Should not call directly due to debounce
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should update month correctly', () => {
      const step = {
        year: 0,
        month: 1,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.month).toBe(7); // 6 + 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should update day correctly', () => {
      const step = {
        year: 0,
        month: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.day).toBe(16); // 15 + 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should update hour correctly', () => {
      const step = {
        year: 0,
        month: 0,
        day: 0,
        hour: 1,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.hour).toBe(15); // 14 + 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should update minute correctly', () => {
      const step = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 1,
        second: 0,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.minute).toBe(31); // 30 + 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should update second correctly', () => {
      const step = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 1,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.second).toBe(1); // 0 + 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should handle negative values correctly', () => {
      const step = {
        year: -1,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      expect(component.currentProcessData.date.year).toBe(2022); // 2023 - 1
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should handle cross-month correctly', () => {
      // 设置一个接近月底的日期
      component.currentProcessData.date.day = 30;
      component.currentProcessData.date.month = 6;

      const step = {
        year: 0,
        month: 0,
        day: 5,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      // 应该是7月5日
      expect(component.currentProcessData.date.month).toBe(7);
      expect(component.currentProcessData.date.day).toBe(5);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should handle cross-year correctly', () => {
      // 设置一个接近年底的日期
      component.currentProcessData.date.year = 2023;
      component.currentProcessData.date.month = 12;
      component.currentProcessData.date.day = 31;

      const step = {
        year: 0,
        month: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      // 应该是2024年1月1日
      expect(component.currentProcessData.date.year).toBe(2024);
      expect(component.currentProcessData.date.month).toBe(1);
      expect(component.currentProcessData.date.day).toBe(1);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should handle cross-month backwards correctly', () => {
      // 设置一个接近月初的日期
      component.currentProcessData.date.day = 5;
      component.currentProcessData.date.month = 7;

      const step = {
        year: 0,
        month: 0,
        day: -10,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      // 应该是6月25日
      expect(component.currentProcessData.date.month).toBe(6);
      expect(component.currentProcessData.date.day).toBe(25);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });

    it('should handle cross-year backwards correctly', () => {
      // 设置一个接近年初的日期
      component.currentProcessData.date.year = 2024;
      component.currentProcessData.date.month = 1;
      component.currentProcessData.date.day = 1;

      const step = {
        year: 0,
        month: 0,
        day: -1,
        hour: 0,
        minute: 0,
        second: 0,
      };

      component.changeStep(step);

      // 应该是2023年12月31日
      expect(component.currentProcessData.date.year).toBe(2023);
      expect(component.currentProcessData.date.month).toBe(12);
      expect(component.currentProcessData.date.day).toBe(31);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
      expect(changeStepSubjectNextSpy).toHaveBeenCalled();
    });
  });

  describe('changeStep with debounce', () => {
    let drawHoroscopeSpy: jasmine.Spy;

    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
      drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();
    });

    it('should only call drawHoroscope once after rapid calls due to debounce', fakeAsync(() => {
      const step = { year: 0, month: 0, day: 1, hour: 0, minute: 0, second: 0 };

      component.changeStep(step);
      component.changeStep(step);
      component.changeStep(step);

      tick(499);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();

      tick(1);
      expect(drawHoroscopeSpy).toHaveBeenCalledTimes(1);

      flush();
    }));
  });
});
