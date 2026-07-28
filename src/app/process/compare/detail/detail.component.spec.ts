import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import {
  HoroscopeComparison,
  Planet,
} from 'src/app/type/interface/response-data';
import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { IonicModule } from '@ionic/angular';
import { createMockHoroscopeComparison } from 'src/app/test-utils/test-data-factory.spec';

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

const mockCompareData: HoroscopeComparison = createMockHoroscopeComparison({
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
});

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), DetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have null compareData by default', () => {
    fixture.detectChanges();

    expect(component.compareData).toBeNull();
  });

  it('should set compareData from input', () => {
    fixture.componentRef.setInput('compareData', mockCompareData);
    fixture.detectChanges();

    expect(component.compareData).toEqual(mockCompareData);
  });

  it('should accept null compareData input', () => {
    fixture.componentRef.setInput('compareData', mockCompareData);
    fixture.componentRef.setInput('compareData', null);
    fixture.detectChanges();

    expect(component.compareData).toBeNull();
  });
});