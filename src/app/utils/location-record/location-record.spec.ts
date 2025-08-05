import { isLocationEqual } from './location-record';
import { LocationRecordRequest } from '../../type/interface/horo-admin/location-record';

describe('isLocationEqual', () => {
  const baseLocation: LocationRecordRequest = {
    name: 'Test Location',
    longitude_degree: 120,
    longitude_minute: 30,
    longitude_second: 45,
    is_east: true,
    latitude_degree: 30,
    latitude_minute: 15,
    latitude_second: 20,
    is_north: true,
  };

  it('should return true for two identical location records', () => {
    const loc1 = { ...baseLocation };
    const loc2 = { ...baseLocation };
    expect(isLocationEqual(loc1, loc2)).toBeTrue();
  });

  it('should return false if names are different', () => {
    const loc1 = { ...baseLocation, name: 'Location A' };
    const loc2 = { ...baseLocation, name: 'Location B' };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if longitude_degree is different', () => {
    const loc1 = { ...baseLocation, longitude_degree: 100 };
    const loc2 = { ...baseLocation, longitude_degree: 120 };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if latitude_degree is different', () => {
    const loc1 = { ...baseLocation, latitude_degree: 20 };
    const loc2 = { ...baseLocation, latitude_degree: 30 };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if is_east is different', () => {
    const loc1 = { ...baseLocation, is_east: true };
    const loc2 = { ...baseLocation, is_east: false };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if is_north is different', () => {
    const loc1 = { ...baseLocation, is_north: true };
    const loc2 = { ...baseLocation, is_north: false };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if longitude_minute is different', () => {
    const loc1 = { ...baseLocation, longitude_minute: 10 };
    const loc2 = { ...baseLocation, longitude_minute: 30 };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if longitude_second is different', () => {
    const loc1 = { ...baseLocation, longitude_second: 10 };
    const loc2 = { ...baseLocation, longitude_second: 45 };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if latitude_minute is different', () => {
    const loc1 = { ...baseLocation, latitude_minute: 5 };
    const loc2 = { ...baseLocation, latitude_minute: 15 };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });

  it('should return false if latitude_second is different', () => {
    const loc1 = { ...baseLocation, latitude_second: 10 };
    const loc2 = { ...baseLocation, latitude_second: 20 };
    expect(isLocationEqual(loc1, loc2)).toBeFalse();
  });
});