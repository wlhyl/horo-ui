import {
  DateRequest,
  GeoRequest,
  HoroRequest,
} from 'src/app/type/interface/request-data';
import { Horoscope } from 'src/app/type/interface/response-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { createMockDateRequest, createMockGeoRequest, createMockHoroRequest, createMockPlanet, createMockHoroscope } from 'src/app/test-utils/test-data-factory.spec';

// Mock Data
const mockDate: DateRequest = createMockDateRequest({
  year: 2000,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  second: 0,
  tz: 8,
  st: false,
});

export const mockGeo: GeoRequest = createMockGeoRequest({
  long: 121.47,
  lat: 31.23,
});

export const mockHoroData: DeepReadonly<HoroRequest> = createMockHoroRequest({
  id: 1,
  name: 'Test',
  sex: true,
  date: mockDate,
  geo: mockGeo,
  geo_name: 'Shanghai',
  house: 'Alcabitus',
}) as DeepReadonly<HoroRequest>;

export const mockCurrentHoroData: HoroRequest = createMockHoroRequest({
  id: 1,
  name: 'Test',
  sex: true,
  date: mockDate,
  geo: mockGeo,
  geo_name: 'Shanghai',
  house: 'Alcabitus',
});

export const mockHoroscopeData: Horoscope = createMockHoroscope({
  date: mockDate,
  geo: mockGeo,
  house_name: 'Alcabitus',
  houses_cups: [121.123],
  asc: createMockPlanet({
    name: PlanetName.ASC,
  }),
  mc: createMockPlanet({
    name: PlanetName.MC,
  }),
  dsc: createMockPlanet({
    name: PlanetName.DSC,
  }),
  ic: createMockPlanet({
    name: PlanetName.IC,
  }),
  part_of_fortune: createMockPlanet({
    name: PlanetName.PartOfFortune,
  }),
  planets: [
    createMockPlanet({
      name: PlanetName.Sun,
      long: 100.14,
      speed: 1,
      speed_state: PlanetSpeedState.快,
     }),
  ],
  is_diurnal: true,
  planetary_day: PlanetName.Sun,
  planetary_hours: PlanetName.Sun,
});
