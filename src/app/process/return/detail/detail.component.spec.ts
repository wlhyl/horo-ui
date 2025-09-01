import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DetailComponent } from './detail.component';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { ReturnHoroscope, Planet } from 'src/app/type/interface/response-data';
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

const mockReturnData: ReturnHoroscope = {
  native_date: {
    year: 2024,
    month: 8,
    day: 6,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
  },
  process_date: {
    year: 2024,
    month: 8,
    day: 7,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
  },
  return_date: {
    year: 2024,
    month: 8,
    day: 8,
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
  planets: [mockPlanet],
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
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('返照盘详情');
  });

  it('should set returnData from router state', () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          data: mockReturnData,
        },
      },
    } as any);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.returnData).toEqual(mockReturnData);
  });

  it('should have null returnData if router state is missing', () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {},
    } as any);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.returnData).toBeNull();
  });

  it('should have null returnData if navigation is null', () => {
    routerSpy.currentNavigation.and.returnValue(null);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.returnData).toBeNull();
  });

  describe('component properties', () => {
    beforeEach(() => {
      routerSpy.currentNavigation.and.returnValue(null);
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
    });

    it('should have degreeToDMSFn property assigned', () => {
      expect(component.degreeToDMSFn).toBeDefined();
      expect(typeof component.degreeToDMSFn).toBe('function');
    });

    it('should have correct initial property values', () => {
      expect(component.title).toBe('返照盘详情');
      expect(component.path).toBeDefined();
      expect(component.config).toBeDefined();
      expect(component.config instanceof Horoconfig).toBe(true);
    });
  });
});
