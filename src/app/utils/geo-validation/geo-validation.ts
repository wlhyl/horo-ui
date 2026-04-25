export interface GeoValidationResult {
  valid: boolean;
  message: string;
}

export interface GeoDMS {
  longD: number;
  longM: number;
  longS: number;
  latD: number;
  latM: number;
  latS: number;
}

export function validateGeo(geo: GeoDMS): GeoValidationResult {
  if (geo.longD < 0 || geo.longD > 180) {
    return { valid: false, message: '经度度数必须在0-180之间' };
  }
  if (geo.longD === 180 && (geo.longM !== 0 || geo.longS !== 0)) {
    return { valid: false, message: '经度度数为180时，分和秒必须为0' };
  }
  if (geo.longM < 0 || geo.longM > 59) {
    return { valid: false, message: '经度分数必须在0-59之间' };
  }
  if (geo.longS < 0 || geo.longS > 59) {
    return { valid: false, message: '经度秒数必须在0-59之间' };
  }

  if (geo.latD < 0 || geo.latD > 90) {
    return { valid: false, message: '纬度度数必须在0-90之间' };
  }
  if (geo.latD === 90 && (geo.latM !== 0 || geo.latS !== 0)) {
    return { valid: false, message: '纬度度数为90时，分和秒必须为0' };
  }
  if (geo.latM < 0 || geo.latM > 59) {
    return { valid: false, message: '纬度分数必须在0-59之间' };
  }
  if (geo.latS < 0 || geo.latS > 59) {
    return { valid: false, message: '纬度秒数必须在0-59之间' };
  }

  return { valid: true, message: '' };
}
