import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DateTimeComponent } from './date-time.component';
import { SimpleChanges } from '@angular/core';

describe('DateTimeComponent', () => {
  let component: DateTimeComponent;
  let fixture: ComponentFixture<DateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTimeComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default input values', () => {
    expect(component.year).toBe(0);
    expect(component.month).toBe(1);
    expect(component.day).toBe(1);
    expect(component.hour).toBe(0);
    expect(component.minute).toBe(0);
    expect(component.second).toBe(0);
  });

  it('should initialize arrays correctly', () => {
    expect(component.years.length).toBe(200);
    expect(component.years[0]).toBe(1900);
    expect(component.years[199]).toBe(2099);

    expect(component.months.length).toBe(12);
    expect(component.months[0]).toBe(1);
    expect(component.months[11]).toBe(12);

    expect(component.hours.length).toBe(24);
    expect(component.hours[0]).toBe(0);
    expect(component.hours[23]).toBe(23);

    expect(component.minutes.length).toBe(60);
    expect(component.minutes[0]).toBe(0);
    expect(component.minutes[59]).toBe(59);

    expect(component.seconds.length).toBe(60);
    expect(component.seconds[0]).toBe(0);
    expect(component.seconds[59]).toBe(59);
  });

  // 测试日数，代码在最末

  describe('output event emitters', () => {
    it('should emit yearChange event with correct value', () => {
      spyOn(component.yearChange, 'emit');
      component.year = 2023;
      component['emit']();
      expect(component.yearChange.emit).toHaveBeenCalledWith(2023);
    });

    it('should emit monthChange event with correct value', () => {
      spyOn(component.monthChange, 'emit');
      component.month = 5;
      component['emit']();
      expect(component.monthChange.emit).toHaveBeenCalledWith(5);
    });

    it('should emit dayChange event with correct value', () => {
      spyOn(component.dayChange, 'emit');
      component.day = 15;
      component['emit']();
      expect(component.dayChange.emit).toHaveBeenCalledWith(15);
    });

    it('should emit hourChange event with correct value', () => {
      spyOn(component.hourChange, 'emit');
      component.hour = 10;
      component['emit']();
      expect(component.hourChange.emit).toHaveBeenCalledWith(10);
    });

    it('should emit minuteChange event with correct value', () => {
      spyOn(component.minuteChange, 'emit');
      component.minute = 30;
      component['emit']();
      expect(component.minuteChange.emit).toHaveBeenCalledWith(30);
    });

    it('should emit secondChange event with correct value', () => {
      spyOn(component.secondChange, 'emit');
      component.second = 45;
      component['emit']();
      expect(component.secondChange.emit).toHaveBeenCalledWith(45);
    });
  });

  describe('ngOnChanges lifecycle hook', () => {
    it('should update currentValue when year input changes', () => {
      const changes: SimpleChanges = {
        year: {
          currentValue: 2023,
          previousValue: 0,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.year).toBe(2023);
    });

    it('should update currentValue when month input changes', () => {
      const changes: SimpleChanges = {
        month: {
          currentValue: 5,
          previousValue: 1,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.month).toBe(5);
    });

    it('should update currentValue when day input changes', () => {
      const changes: SimpleChanges = {
        day: {
          currentValue: 15,
          previousValue: 1,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.day).toBe(15);
    });

    it('should update currentValue when hour input changes', () => {
      const changes: SimpleChanges = {
        hour: {
          currentValue: 10,
          previousValue: 0,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.hour).toBe(10);
    });

    it('should update currentValue when minute input changes', () => {
      const changes: SimpleChanges = {
        minute: {
          currentValue: 30,
          previousValue: 0,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.minute).toBe(30);
    });

    it('should update currentValue when second input changes', () => {
      const changes: SimpleChanges = {
        second: {
          currentValue: 45,
          previousValue: 0,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.second).toBe(45);
    });

    it('should not update currentValue for unchanged properties', () => {
      component.currentValue = {
        year: 2020,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      };
      const changes: SimpleChanges = {
        year: {
          currentValue: 2023,
          previousValue: 0,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue.month).toBe(1); // Should remain unchanged
      expect(component.currentValue.day).toBe(1); // Should remain unchanged
      expect(component.currentValue.hour).toBe(0);
      expect(component.currentValue.minute).toBe(0);
      expect(component.currentValue.second).toBe(0);
    });
  });

  describe('onIonChange methods', () => {
    it('should update currentValue.year when onIonChangeYear is called', () => {
      const event = { detail: { value: 2023 } } as CustomEvent;
      component.onIonChangeYear(event);
      expect(component.currentValue.year).toBe(2023);
    });

    it('should update currentValue.month when onIonChangeMonth is called', () => {
      const event = { detail: { value: 5 } } as CustomEvent;
      component.onIonChangeMonth(event);
      expect(component.currentValue.month).toBe(5);
    });

    it('should update currentValue.day when onIonChangeDay is called', () => {
      const event = { detail: { value: 15 } } as CustomEvent;
      component.onIonChangeDay(event);
      expect(component.currentValue.day).toBe(15);
    });

    it('should update currentValue.hour when onIonChangeHour is called', () => {
      const event = { detail: { value: 10 } } as CustomEvent;
      component.onIonChangeHour(event);
      expect(component.currentValue.hour).toBe(10);
    });

    it('should update currentValue.minute when onIonChangeMinute is called', () => {
      const event = { detail: { value: 30 } } as CustomEvent;
      component.onIonChangeMinute(event);
      expect(component.currentValue.minute).toBe(30);
    });

    it('should update currentValue.second when onIonChangeSecond is called', () => {
      const event = { detail: { value: 45 } } as CustomEvent;
      component.onIonChangeSecond(event);
      expect(component.currentValue.second).toBe(45);
    });
  });

  describe('onDidDismiss method', () => {
    it('should reset currentValue to original values when data is null', () => {
      component.year = 2023;
      component.month = 5;
      component.day = 15;
      component.hour = 10;
      component.minute = 30;
      component.second = 45;

      component.currentValue.year = 2024;
      component.currentValue.month = 6;
      component.currentValue.day = 20;
      component.currentValue.hour = 12;
      component.currentValue.minute = 40;
      component.currentValue.second = 50;

      const event = { detail: { data: null } } as CustomEvent;
      component.onDidDismiss(event);

      expect(component.currentValue.year).toBe(2023);
      expect(component.currentValue.month).toBe(5);
      expect(component.currentValue.day).toBe(15);
      expect(component.currentValue.hour).toBe(10);
      expect(component.currentValue.minute).toBe(30);
      expect(component.currentValue.second).toBe(45);
    });

    it('should update component values and emit events when data is provided', () => {
      spyOn(component.yearChange, 'emit');
      spyOn(component.monthChange, 'emit');
      spyOn(component.dayChange, 'emit');
      spyOn(component.hourChange, 'emit');
      spyOn(component.minuteChange, 'emit');
      spyOn(component.secondChange, 'emit');

      const event = {
        detail: {
          data: {
            year: 2023,
            month: 5,
            day: 15,
            hour: 10,
            minute: 30,
            second: 45,
          },
        },
      } as CustomEvent;

      component.onDidDismiss(event);

      expect(component.year).toBe(2023);
      expect(component.month).toBe(5);
      expect(component.day).toBe(15);
      expect(component.hour).toBe(10);
      expect(component.minute).toBe(30);
      expect(component.second).toBe(45);

      expect(component.yearChange.emit).toHaveBeenCalledWith(2023);
      expect(component.monthChange.emit).toHaveBeenCalledWith(5);
      expect(component.dayChange.emit).toHaveBeenCalledWith(15);
      expect(component.hourChange.emit).toHaveBeenCalledWith(10);
      expect(component.minuteChange.emit).toHaveBeenCalledWith(30);
      expect(component.secondChange.emit).toHaveBeenCalledWith(45);
    });
  });

  describe('nowDate method', () => {
    it('should set current date and time and emit events', () => {
      const mockDate = new Date(2023, 4, 15, 10, 30, 45); // May 15, 2023 10:30:45
      jasmine.clock().install();
      jasmine.clock().mockDate(mockDate);

      spyOn(component.yearChange, 'emit');
      spyOn(component.monthChange, 'emit');
      spyOn(component.dayChange, 'emit');
      spyOn(component.hourChange, 'emit');
      spyOn(component.minuteChange, 'emit');
      spyOn(component.secondChange, 'emit');

      component.nowDate();

      expect(component.year).toBe(2023);
      expect(component.month).toBe(5); // getMonth() returns 0-11, so +1
      expect(component.day).toBe(15);
      expect(component.hour).toBe(10);
      expect(component.minute).toBe(30);
      expect(component.second).toBe(45);

      expect(component.yearChange.emit).toHaveBeenCalledWith(2023);
      expect(component.monthChange.emit).toHaveBeenCalledWith(5);
      expect(component.dayChange.emit).toHaveBeenCalledWith(15);
      expect(component.hourChange.emit).toHaveBeenCalledWith(10);
      expect(component.minuteChange.emit).toHaveBeenCalledWith(30);
      expect(component.secondChange.emit).toHaveBeenCalledWith(45);

      jasmine.clock().uninstall();
    });
  });

  describe('days getter method', () => {
    it('should return correct number of days for February in non-leap year', () => {
      component.currentValue.year = 2023;
      component.currentValue.month = 2; // February
      const days = component.days;
      expect(days.length).toBe(28);
      expect(days[0]).toBe(1);
      expect(days[27]).toBe(28);
    });

    it('should return correct number of days for February in leap year', () => {
      component.currentValue.year = 2024;
      component.currentValue.month = 2; // February
      const days = component.days;
      expect(days.length).toBe(29);
      expect(days[0]).toBe(1);
      expect(days[28]).toBe(29);
    });

    it('should return correct number of days for 31-day month', () => {
      component.currentValue.year = 2023;
      component.currentValue.month = 1; // January
      const days = component.days;
      expect(days.length).toBe(31);
      expect(days[0]).toBe(1);
      expect(days[30]).toBe(31);
    });

    it('should return correct number of days for 30-day month', () => {
      component.currentValue.year = 2023;
      component.currentValue.month = 4; // April
      const days = component.days;
      expect(days.length).toBe(30);
      expect(days[0]).toBe(1);
      expect(days[29]).toBe(30);
    });
  });
});
