import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DateTimeChangeComponent } from './date-time-change.component';

describe('DateTimeChangeComponent', () => {
  let component: DateTimeChangeComponent;
  let fixture: ComponentFixture<DateTimeChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTimeChangeComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimeChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default step unit', () => {
    expect(component['stepUnit']).toBe('年');
  });

  it('should initialize with zero step values', () => {
    expect(component['step']).toEqual({
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    });
  });

  describe('changeStepUnit()', () => {
    it('should cycle through time units correctly', () => {
      // 初始状态
      expect(component['stepUnit']).toBe('年');

      // 年 -> 月
      component.changeStepUnit();
      expect(component['stepUnit']).toBe('月');

      // 月 -> 日
      component.changeStepUnit();
      expect(component['stepUnit']).toBe('日');

      // 日 -> 时
      component.changeStepUnit();
      expect(component['stepUnit']).toBe('时');

      // 时 -> 分
      component.changeStepUnit();
      expect(component['stepUnit']).toBe('分');

      // 分 -> 秒
      component.changeStepUnit();
      expect(component['stepUnit']).toBe('秒');

      // 秒 -> 年 (循环)
      component.changeStepUnit();
      expect(component['stepUnit']).toBe('年');
    });
  });

  describe('changeStep()', () => {
    beforeEach(() => {
      // 重置 spy
      spyOn(component['changedStep'], 'emit');
    });

    it('should set year step and emit event', () => {
      component['stepUnit'] = '年';
      component.changeStep(2);

      expect(component['step']).toEqual({
        year: 2,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 2,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should set month step and emit event', () => {
      component['stepUnit'] = '月';
      component.changeStep(3);

      expect(component['step']).toEqual({
        year: 0,
        month: 3,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 3,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should set day step and emit event', () => {
      component['stepUnit'] = '日';
      component.changeStep(5);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 5,
        hour: 0,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 5,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should set hour step and emit event', () => {
      component['stepUnit'] = '时';
      component.changeStep(8);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 8,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 8,
        minute: 0,
        second: 0,
      });
    });

    it('should set minute step and emit event', () => {
      component['stepUnit'] = '分';
      component.changeStep(15);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 15,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 15,
        second: 0,
      });
    });

    it('should set second step and emit event', () => {
      component['stepUnit'] = '秒';
      component.changeStep(30);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 30,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 30,
      });
    });

    it('should handle default case and set second step', () => {
      component['stepUnit'] = 'unknown';
      component.changeStep(45);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 45,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 45,
      });
    });

    it('should handle negative year step values', () => {
      component['stepUnit'] = '年';
      component.changeStep(-1);

      expect(component['step']).toEqual({
        year: -1,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: -1,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should handle negative month step values', () => {
      component['stepUnit'] = '月';
      component.changeStep(-3);

      expect(component['step']).toEqual({
        year: 0,
        month: -3,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: -3,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should handle negative day step values', () => {
      component['stepUnit'] = '日';
      component.changeStep(-5);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: -5,
        hour: 0,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: -5,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should handle negative hour step values', () => {
      component['stepUnit'] = '时';
      component.changeStep(-8);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: -8,
        minute: 0,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: -8,
        minute: 0,
        second: 0,
      });
    });

    it('should handle negative minute step values', () => {
      component['stepUnit'] = '分';
      component.changeStep(-15);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: -15,
        second: 0,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: -15,
        second: 0,
      });
    });

    it('should handle negative second step values', () => {
      component['stepUnit'] = '秒';
      component.changeStep(-30);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: -30,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: -30,
      });
    });

    it('should handle negative step values for default case', () => {
      component['stepUnit'] = 'unknown';
      component.changeStep(-45);

      expect(component['step']).toEqual({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: -45,
      });
      expect(component['changedStep'].emit).toHaveBeenCalledWith({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: -45,
      });
    });
  });
});
