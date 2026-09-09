/**
 * 自定义月返日小限行星推运度数算法
 */
export enum CustomLunarDayProfectionMethod {
  /// 太阳基准：日小限推进速率均匀平滑
  Sun = 'Sun',
  /// 月亮基准：推进速率随月亮真实速度波动
  Moon = 'Moon',
}

export namespace CustomLunarDayProfectionMethod {
  const nameMap: { [key in CustomLunarDayProfectionMethod]: string } = {
    [CustomLunarDayProfectionMethod.Sun]: '太阳基准',
    [CustomLunarDayProfectionMethod.Moon]: '月亮基准',
  };

  export function name(method: CustomLunarDayProfectionMethod): string {
    return nameMap[method];
  }
}
