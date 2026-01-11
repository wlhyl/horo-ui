import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import { ProcessName } from '../enum/process';
import {
  HoroscopeComparison,
  ReturnHoroscope,
} from 'src/app/type/interface/response-data';
import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { createMockHoroRequest, createMockProcessRequest, createMockReturnHoroscope, createMockHoroscopeComparison } from 'src/app/test-utils/test-data-factory.spec';

export const mockHoroData: DeepReadonly<HoroRequest> = createMockHoroRequest({
  id: 1,
  name: 'Test User',
  sex: true,
  house: 'Placidus',
  date: {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
    st: false,
  },
  geo_name: 'Beijing',
  geo: {
    long: 116.4,
    lat: 39.9,
  },
}) as DeepReadonly<HoroRequest>;

export const mockProcessData: DeepReadonly<ProcessRequest> = createMockProcessRequest({
  process_name: ProcessName.Transit,
  date: {
    year: 2023,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
    second: 0,
    tz: 8,
    st: false,
  },
  geo_name: 'Shanghai',
  geo: {
    long: 121.5,
    lat: 31.2,
  },
  isSolarReturn: false,
}) as DeepReadonly<ProcessRequest>;

export const mockSolarReturnHoroscopeData: ReturnHoroscope = createMockReturnHoroscope({
  native_date: { ...mockHoroData.date },
  process_date: { ...mockProcessData.date },
  return_date: { ...mockHoroData.date, year: 2022 },
  geo: { ...mockProcessData.geo },
  house_name: mockHoroData.house,
  houses_cups: [],
  asc: {
    name: PlanetName.ASC,
    long: 0,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  },
  mc: {
    name: PlanetName.MC,
    long: 0,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  },
  dsc: {
    name: PlanetName.DSC,
    long: 0,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  },
  ic: {
    name: PlanetName.IC,
    long: 0,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  },
  part_of_fortune: {
    name: PlanetName.PartOfFortune,
    long: 0,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  },
  planets: [],
  aspects: [],
  antiscoins: [],
  contraantiscias: [],
});

export const mockLunarReturnHoroscopeData: ReturnHoroscope = {
  ...mockSolarReturnHoroscopeData,
  return_date: { ...mockHoroData.date, month: 5 },
};

export const mockSolarComparisonNativeData: HoroscopeComparison = createMockHoroscopeComparison({
  original_date: { ...mockHoroData.date },
  comparison_date: { ...mockSolarReturnHoroscopeData.return_date },
  original_geo: { ...mockHoroData.geo },
  comparison_geo: { ...mockSolarReturnHoroscopeData.geo },
  house_name: mockSolarReturnHoroscopeData.house_name,
  houses_cups: [],
  original_asc: mockSolarReturnHoroscopeData.asc,
  comparison_asc: mockSolarReturnHoroscopeData.asc,
  original_mc: mockSolarReturnHoroscopeData.mc,
  comparison_mc: mockSolarReturnHoroscopeData.mc,
  original_dsc: mockSolarReturnHoroscopeData.dsc,
  comparison_dsc: mockSolarReturnHoroscopeData.dsc,
  original_ic: mockSolarReturnHoroscopeData.ic,
  comparison_ic: mockSolarReturnHoroscopeData.ic,
  original_part_of_fortune: mockSolarReturnHoroscopeData.part_of_fortune,
  comparison_part_of_fortune: mockSolarReturnHoroscopeData.part_of_fortune,
  original_planets: [],
  comparison_planets: [],
  aspects: [],
  antiscoins: [],
  contraantiscias: [],
});

export const mockNativeComparisonSolarData: HoroscopeComparison = {
  ...mockSolarComparisonNativeData,
  original_date: { ...mockSolarReturnHoroscopeData.return_date },
  comparison_date: { ...mockHoroData.date },
  original_geo: { ...mockSolarReturnHoroscopeData.geo },
  comparison_geo: { ...mockHoroData.geo },
};

export const mockLunarComparisonNativeData: HoroscopeComparison = {
  ...mockSolarComparisonNativeData,
  original_date: { ...mockHoroData.date },
  comparison_date: { ...mockLunarReturnHoroscopeData.return_date },
  original_geo: { ...mockHoroData.geo },
  comparison_geo: { ...mockLunarReturnHoroscopeData.geo },
  house_name: mockLunarReturnHoroscopeData.house_name,
};

export const mockNativeComparisonLunarData: HoroscopeComparison = {
  ...mockLunarComparisonNativeData,

  original_date: { ...mockLunarReturnHoroscopeData.return_date },
  comparison_date: { ...mockHoroData.date },
  comparison_geo: { ...mockHoroData.geo },
  original_geo: { ...mockLunarReturnHoroscopeData.geo },
};
