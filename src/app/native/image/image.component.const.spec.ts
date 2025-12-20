import {
  DateRequest,
  GeoRequest,
  HoroRequest,
} from 'src/app/type/interface/request-data';
import { Horoscope, Planet } from 'src/app/type/interface/response-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { createMockDateRequest, createMockGeoRequest, createMockHoroRequest } from 'src/app/test-utils/test-data-factory.spec';

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

const mockPlanet: Planet = {
  name: PlanetName.Sun,
  long: 0,
  lat: 0,
  speed: 0,
  ra: 0,
  dec: 0,
  orb: 0,
  speed_state: PlanetSpeedState.均,
};

export const mockHoroscopeData: Horoscope = {
  date: { ...mockDate },
  geo: { ...mockGeo },
  house_name: 'Alcabitus',
  houses_cups: [121.123],
  asc: {
    ...mockPlanet,
    name: PlanetName.ASC,
  },
  mc: {
    ...mockPlanet,
    name: PlanetName.MC,
  },
  dsc: {
    ...mockPlanet,
    name: PlanetName.DSC,
  },
  ic: {
    ...mockPlanet,
    name: PlanetName.IC,
  },
  part_of_fortune: {
    ...mockPlanet,
    name: PlanetName.PartOfFortune,
  },
  planets: [
    {
      name: PlanetName.Sun,
      long: 100.14,
      lat: 0,
      speed: 1,
      ra: 0,
      dec: 0,
      orb: 0,
      speed_state: PlanetSpeedState.快,
    },
  ],
  is_diurnal: true,
  planetary_day: PlanetName.Sun,
  planetary_hours: PlanetName.Sun,
  aspects: [],
  antiscoins: [],
  contraantiscias: [],
};
