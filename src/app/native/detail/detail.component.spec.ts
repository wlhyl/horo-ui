import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { PlanetName } from 'src/app/type/enum/planet';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  createMockHoroscope,
  createMockPlanet,
} from 'src/app/test-utils/test-data-factory.spec';
import { degNorm } from 'src/app/utils/horo-math/horo-math';

// Create a testing module
@NgModule({
  declarations: [DetailComponent],
  imports: [IonicModule],
  exports: [DetailComponent],
})
class TestDetailModule {}

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let horoConfigSpy: jasmine.SpyObj<Horoconfig>;

  const mockHoroscopeData = createMockHoroscope();

  beforeEach(async () => {
    horoConfigSpy = jasmine.createSpyObj('Horoconfig', [
      'planetFontFamily',
      'planetFontString',
      'zodiacFontFamily',
      'zodiacFontString',
    ]);
    horoConfigSpy.planetFontFamily.and.returnValue('Arial');
    horoConfigSpy.planetFontString.and.returnValue('☀️');
    horoConfigSpy.zodiacFontFamily.and.returnValue('Arial');
    horoConfigSpy.zodiacFontString.and.returnValue('♈');

    await TestBed.configureTestingModule({
      imports: [TestDetailModule, IonicModule.forRoot()],
      providers: [{ provide: Horoconfig, useValue: horoConfigSpy }],
    }).compileComponents();
  });

  it('should create the component', () => {
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have null horoscopeData by default', () => {
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.horoscopeData).toBeNull();
  });

  it('should accept horoscopeData via @Input', () => {
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    component.horoscopeData = mockHoroscopeData;
    fixture.detectChanges();

    expect(component.horoscopeData).toEqual(mockHoroscopeData);
  });

  describe('partOfSolarVision', () => {
    it('should return null when horoscopeData is null', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.partOfSolarVision).toBeNull();
    });

    it('should return null when Sun is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [createMockPlanet({ name: PlanetName.Mars, long: 90 })],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      expect(component.partOfSolarVision).toBeNull();
    });

    it('should return null when Mars is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [createMockPlanet({ name: PlanetName.Sun, long: 120 })],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      expect(component.partOfSolarVision).toBeNull();
    });

    it('should calculate solar vision point correctly', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 120 }),
          createMockPlanet({ name: PlanetName.Mars, long: 90 }),
        ],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const expected = degNorm(30 + 120 - 90);
      expect(component.partOfSolarVision).toEqual(expected);
    });

    it('should normalize result to 0-360 degrees', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 300 }),
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 200 }),
          createMockPlanet({ name: PlanetName.Mars, long: 50 }),
        ],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const expected = degNorm(300 + 200 - 50);
      expect(component.partOfSolarVision).toEqual(expected);
      expect(component.partOfSolarVision).toBeLessThan(360);
      expect(component.partOfSolarVision).toBeGreaterThanOrEqual(0);
    });
  });

  describe('partOfLunarVision', () => {
    it('should return null when horoscopeData is null', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.partOfLunarVision).toBeNull();
    });

    it('should return null when Moon is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [createMockPlanet({ name: PlanetName.Saturn, long: 180 })],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      expect(component.partOfLunarVision).toBeNull();
    });

    it('should return null when Saturn is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [createMockPlanet({ name: PlanetName.Moon, long: 150 })],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      expect(component.partOfLunarVision).toBeNull();
    });

    it('should calculate lunar vision point correctly', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 45 }),
        planets: [
          createMockPlanet({ name: PlanetName.Moon, long: 200 }),
          createMockPlanet({ name: PlanetName.Saturn, long: 120 }),
        ],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const expected = degNorm(45 + 200 - 120);
      expect(component.partOfLunarVision).toEqual(expected);
    });
  });

  describe('calculateLongitudeDifference', () => {
    it('should return 0 for same longitude', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(100, 100)).toEqual(0);
    });

    it('should return difference when less than 180', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(100, 150)).toEqual(50);
    });

    it('should return 360 minus difference when greater than 180', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(100, 20)).toEqual(80);
    });

    it('should handle edge case at 180 degrees', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(0, 180)).toEqual(180);
      expect(component.calculateLongitudeDifference(180, 0)).toEqual(180);
    });
  });

  describe('angularHousesAndPlanets', () => {
    it('should return empty array when horoscopeData is null', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.angularHousesAndPlanets).toEqual([]);
    });

    it('should return angular houses and planets', () => {
      const mockSun = createMockPlanet({ name: PlanetName.Sun, long: 100 });
      const mockMoon = createMockPlanet({ name: PlanetName.Moon, long: 200 });
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        mc: createMockPlanet({ name: PlanetName.MC, long: 120 }),
        dsc: createMockPlanet({ name: PlanetName.DSC, long: 210 }),
        ic: createMockPlanet({ name: PlanetName.IC, long: 300 }),
        planets: [mockSun, mockMoon],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const result = component.angularHousesAndPlanets;
      expect(result.length).toEqual(6);
      expect(result[0].name).toEqual(PlanetName.ASC);
      expect(result[1].name).toEqual(PlanetName.MC);
      expect(result[2].name).toEqual(PlanetName.DSC);
      expect(result[3].name).toEqual(PlanetName.IC);
      expect(result[4]).toEqual(mockSun);
      expect(result[5]).toEqual(mockMoon);
    });

    it('should return only angular houses when no planets', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        mc: createMockPlanet({ name: PlanetName.MC, long: 120 }),
        dsc: createMockPlanet({ name: PlanetName.DSC, long: 210 }),
        ic: createMockPlanet({ name: PlanetName.IC, long: 300 }),
        planets: [],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const result = component.angularHousesAndPlanets;
      expect(result.length).toEqual(4);
      expect(result[0].name).toEqual(PlanetName.ASC);
      expect(result[1].name).toEqual(PlanetName.MC);
      expect(result[2].name).toEqual(PlanetName.DSC);
      expect(result[3].name).toEqual(PlanetName.IC);
    });
  });

  describe('planetDignities', () => {
    it('should return empty array when horoscopeData is null', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.planetDignities).toEqual([]);
    });

    it('should return dignities for 7 traditional planets only', () => {
      const mockHoroscope = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 0 }),
          createMockPlanet({ name: PlanetName.Moon, long: 30 }),
          createMockPlanet({ name: PlanetName.Mercury, long: 60 }),
          createMockPlanet({ name: PlanetName.Venus, long: 90 }),
          createMockPlanet({ name: PlanetName.Mars, long: 120 }),
          createMockPlanet({ name: PlanetName.Jupiter, long: 150 }),
          createMockPlanet({ name: PlanetName.Saturn, long: 180 }),
          createMockPlanet({ name: PlanetName.NorthNode, long: 210 }),
          createMockPlanet({ name: PlanetName.SouthNode, long: 240 }),
        ],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const dignities = component.planetDignities;
      expect(dignities.length).toBe(7);
      expect(dignities.map((d) => d.planet.name)).toEqual([
        PlanetName.Sun,
        PlanetName.Moon,
        PlanetName.Mercury,
        PlanetName.Venus,
        PlanetName.Mars,
        PlanetName.Jupiter,
        PlanetName.Saturn,
      ]);
    });

    it('should compute dignity fields correctly (Sun in Aries 0°)', () => {
      const mockHoroscope = createMockHoroscope({
        planets: [createMockPlanet({ name: PlanetName.Sun, long: 0 })],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const sun = component.planetDignities[0];
      expect(sun.exaltation).toBeTrue();
      expect(sun.triplicity).toBeTrue();
      expect(sun.rulership).toBeFalse();
      expect(sun.cazimi).toBeFalse();
      expect(sun.score).toBe(7);
    });

    it('should compute solar conditions for non-Sun planets', () => {
      const mockHoroscope = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 0 }),
          createMockPlanet({ name: PlanetName.Mercury, long: 5 }),
        ],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const mercury = component.planetDignities.find(
        (d) => d.planet.name === PlanetName.Mercury,
      )!;
      expect(mercury.combust).toBeTrue();
    });

    it('should show alert when Sun is missing', () => {
      const mockHoroscope = createMockHoroscope({
        planets: [createMockPlanet({ name: PlanetName.Mercury, long: 0 })],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const dignities = component.planetDignities;
      expect(dignities).toEqual([]);
      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toContain('缺少太阳');
    });
  });

  describe('chartAlmuten', () => {
    it('should return null when horoscopeData is null', () => {
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.chartAlmuten).toBeNull();
    });

    it('should return the planet with the highest score', () => {
      const mockHoroscope = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 0 }),
          createMockPlanet({ name: PlanetName.Moon, long: 90 }),
          createMockPlanet({ name: PlanetName.Mercury, long: 150 }),
        ],
      });

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      component.horoscopeData = mockHoroscope;
      fixture.detectChanges();

      const almuten = component.chartAlmuten;
      expect(almuten).not.toBeNull();
      expect(almuten!.planet.name).toBe(PlanetName.Mercury);
    });
  });
});