/**
 * 从地名查询地理位置信息
 */
export interface LongLatResponse {
  // 地名
  name: string;
  // 经度
  longitude: string;
  // 纬度
  latitude: string;
}
