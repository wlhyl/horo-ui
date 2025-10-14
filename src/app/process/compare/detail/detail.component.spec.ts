import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DetailComponent } from './detail.component';
import {
  HoroscopeComparison,
  Planet,
} from 'src/app/type/interface/response-data';
import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { IonicModule, NavController } from '@ionic/angular';

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

const mockCompareData: HoroscopeComparison = {
  original_date: {
    year: 2024,
    month: 8,
    day: 6,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
  },
  comparison_date: {
    year: 2024,
    month: 8,
    day: 7,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
  },
  original_geo: { long: 120, lat: 30 },
  comparison_geo: { long: 120, lat: 30 },
  house_name: 'Placidus',
  houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  original_asc: mockPlanet,
  comparison_asc: mockPlanet,
  original_mc: mockPlanet,
  comparison_mc: mockPlanet,
  original_dsc: mockPlanet,
  comparison_dsc: mockPlanet,
  original_ic: mockPlanet,
  comparison_ic: mockPlanet,
  original_planets: [mockPlanet],
  comparison_planets: [mockPlanet],
  original_part_of_fortune: mockPlanet,
  comparison_part_of_fortune: mockPlanet,
  aspects: [],
  antiscoins: [],
  contraantiscias: [],
};

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let titleServiceSpy: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['']);

    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
      ],
    }).compileComponents();
  });

  it('should create the component and set the title', () => {
    routerSpy.currentNavigation.and.returnValue(null);
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('比较盘详情');
  });

  it('should set compareData from router state', () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          data: mockCompareData,
        },
      },
    } as any);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.compareData).toEqual(mockCompareData);
  });

  it('should have null compareData if router state is missing', () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {},
    } as any);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.compareData).toBeNull();
  });

  it('should have null compareData if navigation is null', () => {
    routerSpy.currentNavigation.and.returnValue(null);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.compareData).toBeNull();
  });
});
