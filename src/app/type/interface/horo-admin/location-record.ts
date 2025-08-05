export interface LocationRecord {
  id: number;
  name: string;
  is_east: boolean;
  longitude_degree: number;
  longitude_minute: number;
  longitude_second: number;
  is_north: boolean;
  latitude_degree: number;
  latitude_minute: number;
  latitude_second: number;
}

export interface LocationRecordRequest {
  // 城市名
  name: string;
  // 东:+，西:-
  is_east: boolean;
  // 地理经度
  longitude_degree: number;
  longitude_minute: number;
  longitude_second: number;

  // 北:+, 南:-
  is_north: boolean;

  // 地理纬度
  latitude_degree: number;
  latitude_minute: number;
  latitude_second: number;
}
