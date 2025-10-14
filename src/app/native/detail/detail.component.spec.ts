import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DetailComponent } from './detail.component';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { Horoscope, Planet } from 'src/app/type/interface/response-data';
import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { NgModule } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

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

  const mockPlanet: Planet = {
    name: PlanetName.Sun,
    long: 1,
    lat: 1,
    speed: 1,
    ra: 1,
    dec: 1,
    orb: 1,
    speed_state: PlanetSpeedState.均,
  };

  const mockHoroscopeData: Horoscope = {
    date: {
      year: 2024,
      month: 8,
      day: 6,
      hour: 12,
      minute: 0,
      second: 0,
      tz: 8,
    },
    geo: { long: 120, lat: 30 },
    house_name: 'Placidus',
    houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    asc: mockPlanet,
    mc: mockPlanet,
    dsc: mockPlanet,
    ic: mockPlanet,
    part_of_fortune: mockPlanet,
    planets: [mockPlanet],
    is_diurnal: true,
    planetary_day: PlanetName.Sun,
    planetary_hours: PlanetName.Sun,
    aspects: [],
    antiscoins: [],
    contraantiscias: [],
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    horoConfigSpy = jasmine.createSpyObj('Horoconfig', ['']);
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
});
