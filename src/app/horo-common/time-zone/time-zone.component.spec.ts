import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SimpleChanges } from '@angular/core';

import { TimeZoneComponent } from './time-zone.component';

describe('TimeZoneComponent', () => {
  let component: TimeZoneComponent;
  let fixture: ComponentFixture<TimeZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeZoneComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default input values', () => {
    expect(component.zone).toBe(8);
    expect(component.currentValue).toBe(0);
    expect(component.isOpen).toBe(false);
  });

  it('should initialize zones array correctly', () => {
    expect(component.zones.length).toBe(25);
    expect(component.zones[0]).toBe(-12);
    expect(component.zones[12]).toBe(0);
    expect(component.zones[24]).toBe(12);
  });

  describe('zoneString method', () => {
    it('should return "0时区" for value 0', () => {
      expect(component.zoneString(0)).toBe('0时区');
    });

    it('should return "西X区" for negative values', () => {
      expect(component.zoneString(-5)).toBe('西5区');
      expect(component.zoneString(-8)).toBe('西8区');
    });

    it('should return "东X区" for positive values', () => {
      expect(component.zoneString(5)).toBe('东5区');
      expect(component.zoneString(8)).toBe('东8区');
    });
  });

  describe('ngOnChanges lifecycle hook', () => {
    it('should update currentValue when zone input changes', () => {
      const changes: SimpleChanges = {
        zone: {
          currentValue: 5,
          previousValue: 8,
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue).toBe(5);
    });

    it('should not update currentValue for unchanged properties', () => {
      component.currentValue = 3;
      const changes: SimpleChanges = {
        otherProperty: {
          currentValue: 'test',
          previousValue: 'old',
          firstChange: false,
          isFirstChange: () => false,
        },
      };
      component.ngOnChanges(changes);
      expect(component.currentValue).toBe(3); // Should remain unchanged
    });
  });

  describe('onIonChange method', () => {
    it('should update currentValue when onIonChange is called', () => {
      const event = { detail: { value: -5 } } as CustomEvent;
      component.onIonChange(event);
      expect(component.currentValue).toBe(-5);
    });
  });

  describe('onDidDismiss method', () => {
    it('should reset currentValue to original zone when data is null', () => {
      component.zone = 8;
      component.currentValue = -5;

      const event = { detail: { data: null } } as CustomEvent;
      component.onDidDismiss(event);

      expect(component.currentValue).toBe(8);
    });

    it('should update zone and emit event when data is provided', () => {
      spyOn(component.zoneChange, 'emit');
      
      const event = {
        detail: {
          data: 5,
        },
      } as CustomEvent;

      component.onDidDismiss(event);

      expect(component.zone).toBe(5);
      expect(component.zoneChange.emit).toHaveBeenCalledWith(5);
    });

    it('should set isOpen to false after dismissal when data is provided', () => {
      component.isOpen = true;
      
      const event = {
        detail: {
          data: 5,
        },
      } as CustomEvent;
      component.onDidDismiss(event);

      expect(component.isOpen).toBe(false);
    });

    it('should set isOpen to false after dismissal', () => {
      component.isOpen = true;
      
      const event = { detail: { data: null } } as CustomEvent;
      component.onDidDismiss(event);

      expect(component.isOpen).toBe(false);
    });
  });
});
