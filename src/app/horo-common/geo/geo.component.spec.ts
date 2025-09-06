import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GeoComponent } from './geo.component';
import { EW, NS } from './enum';

describe('GeoComponent', () => {
  let component: GeoComponent;
  let fixture: ComponentFixture<GeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeoComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(GeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isModalOpen).toBe(false);
    expect(component.geoLocalName).toBe('');
    expect(component.geoLongD).toBe(0);
    expect(component.geoLongM).toBe(0);
    expect(component.geoLongS).toBe(0);
    expect(component.geoEW).toBe(EW.E);
    expect(component.geoLatD).toBe(0);
    expect(component.geoLatM).toBe(0);
    expect(component.geoLatS).toBe(0);
    expect(component.geoNS).toBe(NS.N);
  });

  describe('geoLong input/output', () => {
    it('should set positive longitude correctly', () => {
      component.geoLong = 120.5;
      expect(component.geoLongD).toBe(120);
      expect(component.geoLongM).toBe(30);
      expect(component.geoLongS).toBe(0);
      expect(component.geoEW).toBe(EW.E);
      expect(component.geoLong).toBeCloseTo(120.5, 6);
    });

    it('should set negative longitude correctly', () => {
      component.geoLong = -75.25;
      expect(component.geoLongD).toBe(75);
      expect(component.geoLongM).toBe(15);
      expect(component.geoLongS).toBe(0);
      expect(component.geoEW).toBe(EW.W);
      expect(component.geoLong).toBeCloseTo(-75.25, 6);
    });

    it('should handle longitude with seconds', () => {
      component.geoLong = 45.505555;
      expect(component.geoLongD).toBe(45);
      expect(component.geoLongM).toBe(30);
      expect(component.geoLongS - 20 < 1).toBeTrue();
      expect(component.geoEW).toBe(EW.E);
      expect((component.geoLong - 45.505555) * 3600 < 1).toBeTrue();
    });
  });

  describe('geoLat input/output', () => {
    it('should set positive latitude correctly', () => {
      component.geoLat = 40.75;
      expect(component.geoLatD).toBe(40);
      expect(component.geoLatM).toBe(45);
      expect(component.geoLatS).toBe(0);
      expect(component.geoNS).toBe(NS.N);
      expect(component.geoLat).toBeCloseTo(40.75, 6);
    });

    it('should set negative latitude correctly', () => {
      component.geoLat = -33.5;
      expect(component.geoLatD).toBe(33);
      expect(component.geoLatM).toBe(30);
      expect(component.geoLatS).toBeCloseTo(0, 0);
      expect(component.geoNS).toBe(NS.S);
      expect(component.geoLat).toBeCloseTo(-33.5, 6);
    });

    it('should handle latitude with seconds', () => {
      component.geoLat = -12.252525;
      expect(component.geoLatD).toBe(12);
      expect(component.geoLatM).toBe(15);
      expect(component.geoLatS).toBeCloseTo(9.09, 0);
      expect(component.geoNS).toBe(NS.S);
      expect((component.geoLat - -(-12.252525)) * 3600 < 1).toBeTrue();
    });
  });

  describe('modal functionality', () => {
    it('should open modal', () => {
      component.open();
      expect(component.isModalOpen).toBe(true);
    });

    it('should close modal on cancel', () => {
      component.isModalOpen = true;
      component.cancel();
      expect(component.isModalOpen).toBe(false);
    });

    it('should close modal on ok', () => {
      component.isModalOpen = true;
      component.ok();
      expect(component.isModalOpen).toBe(false);
    });
  });

  describe('event emissions', () => {
    it('should emit geoLocalNameChange event on ok', () => {
      spyOn(component.geoLocalNameChange, 'emit');
      component.geoLocalName = 'Beijing';
      component.ok();
      expect(component.geoLocalNameChange.emit).toHaveBeenCalledWith('Beijing');
    });

    it('should emit geoLongChange event on ok', () => {
      spyOn(component.geoLongChange, 'emit');
      component.geoLong = 116.4074;
      component.ok();
      expect(component.geoLongChange.emit).toHaveBeenCalledWith(
        116.40722222222223
      );
    });

    it('should emit geoLatChange event on ok', () => {
      spyOn(component.geoLatChange, 'emit');
      component.geoLat = 39.9042;
      component.ok();
      expect(component.geoLatChange.emit).toHaveBeenCalledWith(
        39.90416666666667
      );
    });

    it('should emit all events simultaneously on ok', () => {
      spyOn(component.geoLocalNameChange, 'emit');
      spyOn(component.geoLongChange, 'emit');
      spyOn(component.geoLatChange, 'emit');

      component.geoLocalName = 'Shanghai';
      component.geoLong = 121.4737;
      component.geoLat = 31.2304;

      component.ok();

      expect(component.geoLocalNameChange.emit).toHaveBeenCalledWith(
        'Shanghai'
      );
      expect(component.geoLongChange.emit).toHaveBeenCalledWith(
        121.47361111111111
      );
      expect(component.geoLatChange.emit).toHaveBeenCalledWith(
        31.230277777777776
      );
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      spyOn(component.geoLocalNameChange, 'emit');
      spyOn(component.geoLongChange, 'emit');
      spyOn(component.geoLatChange, 'emit');
    });
    it('should show alert when longitude exceeds 180', () => {
      component.geoLong = 181;
      component.ok();
      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toBe('经度超出范围');

      expect(component.geoLocalNameChange.emit).not.toHaveBeenCalled();
      expect(component.geoLongChange.emit).not.toHaveBeenCalled();
      expect(component.geoLatChange.emit).not.toHaveBeenCalled();
    });

    it('should show alert when longitude is less than -180', () => {
      component.geoLong = -181;
      component.ok();
      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toBe('经度超出范围');

      expect(component.geoLocalNameChange.emit).not.toHaveBeenCalled();
      expect(component.geoLongChange.emit).not.toHaveBeenCalled();
      expect(component.geoLatChange.emit).not.toHaveBeenCalled();
    });

    it('should show alert when latitude exceeds 90', () => {
      component.geoLat = 91;
      component.ok();
      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toBe('纬度超出范围');

      expect(component.geoLocalNameChange.emit).not.toHaveBeenCalled();
      expect(component.geoLongChange.emit).not.toHaveBeenCalled();
      expect(component.geoLatChange.emit).not.toHaveBeenCalled();
    });

    it('should show alert when latitude is less than -90', () => {
      component.geoLat = -91;
      component.ok();
      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toBe('纬度超出范围');

      expect(component.geoLocalNameChange.emit).not.toHaveBeenCalled();
      expect(component.geoLongChange.emit).not.toHaveBeenCalled();
      expect(component.geoLatChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('cancel functionality', () => {
    it('should close modal without emitting events on cancel', () => {
      spyOn(component.geoLocalNameChange, 'emit');
      spyOn(component.geoLongChange, 'emit');
      spyOn(component.geoLatChange, 'emit');

      component.isModalOpen = true;
      component.geoLocalName = 'Test';
      component.geoLong = 120;
      component.geoLat = 30;

      component.cancel();

      expect(component.isModalOpen).toBe(false);
      expect(component.geoLocalNameChange.emit).not.toHaveBeenCalled();
      expect(component.geoLongChange.emit).not.toHaveBeenCalled();
      expect(component.geoLatChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', () => {
      component.geoLong = 0;
      component.geoLat = 0;

      expect(component.geoLongD).toBe(0);
      expect(component.geoLongM).toBe(0);
      expect(component.geoLongS).toBe(0);
      expect(component.geoEW).toBe(EW.E);

      expect(component.geoLatD).toBe(0);
      expect(component.geoLatM).toBe(0);
      expect(component.geoLatS).toBe(0);
      expect(component.geoNS).toBe(NS.N);

      expect(component.geoLong).toBe(0);
      expect(component.geoLat).toBe(0);
    });

    it('should handle very small values', () => {
      component.geoLong = 0.000278; // 1 second
      expect(component.geoLongD).toBe(0);
      expect(component.geoLongM).toBe(0);
      expect(component.geoLongS).toBeCloseTo(1, 0);
      expect(component.geoLong).toBeCloseTo(0.000278, 6);
    });

    it('should handle very large values', () => {
      component.geoLong = 179.99999999999; // almost 180 degrees
      expect(component.geoLongD).toBe(179);
      expect(component.geoLongM).toBe(59);
      expect(component.geoLongS).toBeCloseTo(59, 0);
      expect(component.geoLong).toBeCloseTo(179.999722, 6);
    });

    describe('latitude specific edge cases', () => {
      it('should handle north pole (90°N)', () => {
        component.geoLat = 90;
        expect(component.geoLatD).toBe(90);
        expect(component.geoLatM).toBe(0);
        expect(component.geoLatS).toBe(0);
        expect(component.geoNS).toBe(NS.N);
        expect(component.geoLat).toBeCloseTo(90, 6);
      });

      it('should handle south pole (90°S)', () => {
        component.geoLat = -90;
        expect(component.geoLatD).toBe(90);
        expect(component.geoLatM).toBe(0);
        expect(component.geoLatS).toBe(0);
        expect(component.geoNS).toBe(NS.S);
        expect(component.geoLat).toBeCloseTo(-90, 6);
      });

      it('should handle very small latitude values', () => {
        component.geoLat = 0.000278; // 1 second north
        expect(component.geoLatD).toBe(0);
        expect(component.geoLatM).toBe(0);
        expect(component.geoLatS).toBe(1);
        expect(component.geoNS).toBe(NS.N);
        expect(component.geoLat).toBeCloseTo(0.000278, 6);
      });

      it('should handle very small negative latitude values', () => {
        component.geoLat = -0.000278; // 1 second south
        expect(component.geoLatD).toBe(0);
        expect(component.geoLatM).toBe(0);
        expect(component.geoLatS).toBe(1);
        expect(component.geoNS).toBe(NS.S);
        expect(component.geoLat).toBeCloseTo(-0.000278, 6);
      });

      it('should handle latitude exactly at equator (0°)', () => {
        component.geoLat = 0;
        expect(component.geoLatD).toBe(0);
        expect(component.geoLatM).toBe(0);
        expect(component.geoLatS).toBe(0);
        expect(component.geoNS).toBe(NS.N);
        expect(component.geoLat).toBe(0);
      });

      it('should handle latitude near boundary (89.999999°)', () => {
        component.geoLat = 89.999999;
        expect(component.geoLatD).toBe(89);
        expect(component.geoLatM).toBe(59);
        expect(component.geoLatS).toBe(59);
        expect(component.geoNS).toBe(NS.N);
        expect(component.geoLat).toBe(89.99972222222222);
      });

      it('should handle negative latitude near boundary (-89.999999°)', () => {
        component.geoLat = -89.999999;
        expect(component.geoLatD).toBe(89);
        expect(component.geoLatM).toBe(59);
        expect(component.geoLatS).toBe(59);
        expect(component.geoNS).toBe(NS.S);
        expect(component.geoLat).toBe(-89.99972222222222);
      });
    });
  });
});
