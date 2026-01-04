import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DetailComponent } from './detail.component';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { PlanetName } from 'src/app/type/enum/planet';
import { NgModule } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
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
  let routerSpy: jasmine.SpyObj<Router>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let horoConfigSpy: jasmine.SpyObj<Horoconfig>;

  const mockHoroscopeData = createMockHoroscope();

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
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

    const navControllerSpy = jasmine.createSpyObj('NavController', ['']);

    await TestBed.configureTestingModule({
      imports: [TestDetailModule, IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: Horoconfig, useValue: horoConfigSpy },
        { provide: NavController, useValue: navControllerSpy },
      ],
    }).compileComponents();
  });

  it('should create the component and set the title', () => {
    routerSpy.currentNavigation.and.returnValue(null);
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('星盘详情');
  });

  it('should set horoscopeData from router state', () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          data: mockHoroscopeData,
        },
      },
    } as any);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.horoscopeData).toEqual(mockHoroscopeData);
  });

  it('should have null horoscopeData if router state is missing', () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {},
    } as any);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.horoscopeData).toBeNull();
  });

  it('should have null horoscopeData if navigation is null', () => {
    routerSpy.currentNavigation.and.returnValue(null);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.horoscopeData).toBeNull();
  });

  describe('partOfSolarVision', () => {
    it('should return null when horoscopeData is null', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.partOfSolarVision).toBeNull();
    });

    it('should return null when Sun is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [
          createMockPlanet({ name: PlanetName.Mars, long: 90 }),
        ],
      });
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.partOfSolarVision).toBeNull();
    });

    it('should return null when Mars is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 120 }),
        ],
      });
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
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
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
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
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const expected = degNorm(300 + 200 - 50);
      expect(component.partOfSolarVision).toEqual(expected);
      expect(component.partOfSolarVision).toBeLessThan(360);
      expect(component.partOfSolarVision).toBeGreaterThanOrEqual(0);
    });
  });

  describe('partOfLunarVision', () => {
    it('should return null when horoscopeData is null', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.partOfLunarVision).toBeNull();
    });

    it('should return null when Moon is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [
          createMockPlanet({ name: PlanetName.Saturn, long: 180 }),
        ],
      });
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.partOfLunarVision).toBeNull();
    });

    it('should return null when Saturn is not found', () => {
      const mockHoroscope = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 30 }),
        planets: [
          createMockPlanet({ name: PlanetName.Moon, long: 150 }),
        ],
      });
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
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
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const expected = degNorm(45 + 200 - 120);
      expect(component.partOfLunarVision).toEqual(expected);
    });
  });

  describe('calculateLongitudeDifference', () => {
    it('should return 0 for same longitude', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(100, 100)).toEqual(0);
    });

    it('should return difference when less than 180', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(100, 150)).toEqual(50);
    });

    it('should return 360 minus difference when greater than 180', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(100, 20)).toEqual(80);
    });

    it('should handle edge case at 180 degrees', () => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.calculateLongitudeDifference(0, 180)).toEqual(180);
      expect(component.calculateLongitudeDifference(180, 0)).toEqual(180);
    });
  });

  describe('angularHousesAndPlanets', () => {
    it('should return empty array when horoscopeData is null', () => {
      routerSpy.currentNavigation.and.returnValue(null);
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
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
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
      routerSpy.currentNavigation.and.returnValue({
        extras: {
          state: { data: mockHoroscope },
        },
      } as any);

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const result = component.angularHousesAndPlanets;
      expect(result.length).toEqual(4);
      expect(result[0].name).toEqual(PlanetName.ASC);
      expect(result[1].name).toEqual(PlanetName.MC);
      expect(result[2].name).toEqual(PlanetName.DSC);
      expect(result[3].name).toEqual(PlanetName.IC);
    });
  });
});
