import { LocationRecordRequest } from '../../type/interface/horo-admin/location-record';

export function isLocationEqual(
  loc1: LocationRecordRequest,
  loc2: LocationRecordRequest
): boolean {
  return (
    loc1.name === loc2.name &&
    loc1.longitude_degree === loc2.longitude_degree &&
    loc1.latitude_degree === loc2.latitude_degree &&
    loc1.is_east === loc2.is_east &&
    loc1.longitude_minute === loc2.longitude_minute &&
    loc1.longitude_second === loc2.longitude_second &&
    loc1.is_north === loc2.is_north &&
    loc1.latitude_minute === loc2.latitude_minute &&
    loc1.latitude_second === loc2.latitude_second
  );
}
