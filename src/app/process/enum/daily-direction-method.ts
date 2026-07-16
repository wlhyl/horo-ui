/**
 * 每日回归方向弧算法
 */
export enum DailyDirectionMethod {
  /// 太阳弧风格：弧 = 承诺星黄经 − 显著星黄经
  SolarArc = 'SolarArc',
  /// 黄道向运风格（主向推运 SemiArc 算法）
  SemiArcZodiacal = 'SemiArcZodiacal',
}

export namespace DailyDirectionMethod {
  const nameMap: { [key in DailyDirectionMethod]: string } = {
    [DailyDirectionMethod.SolarArc]: '太阳弧风格',
    [DailyDirectionMethod.SemiArcZodiacal]: '黄道向运风格',
  };

  export function name(method: DailyDirectionMethod): string {
    return nameMap[method];
  }
}
