export enum WindowState {
  Normal = 'normal',
  Minimized = 'minimized',
  Maximized = 'maximized',
  Hidden = 'hidden',
}

export enum ChartType {
  Native = 'Native',
  Event = 'Event',
  Profection = 'Profection',
  MedievalProfection = 'MedievalProfection',
  CustomDayProfection = 'CustomDayProfection',
  Transit = 'Transit',
  Firdaria = 'Firdaria',
  SolarReturn = 'SolarReturn',
  LunarReturn = 'LunarReturn',
  DailyReturn = 'DailyReturn',
  SolarcomparNative = 'SolarcomparNative',
  NativecomparSolar = 'NativecomparSolar',
  LunarcomparNative = 'LunarcomparNative',
  NativecomparLunar = 'NativecomparLunar',
  DailycomparNative = 'DailycomparNative',
  NativecomparDaily = 'NativecomparDaily',
  Direction = 'Direction',
  QuadrantProcess = 'QuadrantProcess',
  SolarArc = 'SolarArc',
  Promittor = 'Promittor',
}

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkbenchWindow {
  id: string;
  title: string;
  chartType: ChartType;
  state: WindowState;
  rect: WindowRect;
  zIndex: number;
  prevRect?: WindowRect;
}

const CHART_TITLES: Record<ChartType, string> = {
  [ChartType.Native]: '本命盘',
  [ChartType.Event]: '天象盘',
  [ChartType.Profection]: '小限',
  [ChartType.MedievalProfection]: '中世纪小限',
  [ChartType.CustomDayProfection]: '自定义日小限',
  [ChartType.Transit]: '行运',
  [ChartType.Firdaria]: '法达',
  [ChartType.SolarReturn]: '日返',
  [ChartType.LunarReturn]: '月返',
  [ChartType.DailyReturn]: '每日回归',
  [ChartType.SolarcomparNative]: '日返比本命',
  [ChartType.NativecomparSolar]: '本命比日返',
  [ChartType.LunarcomparNative]: '月返比本命',
  [ChartType.NativecomparLunar]: '本命比月返',
  [ChartType.DailycomparNative]: '每日回归比本命',
  [ChartType.NativecomparDaily]: '本命比每日回归',
  [ChartType.Direction]: '主向推运',
  [ChartType.QuadrantProcess]: '象限推运',
  [ChartType.SolarArc]: '太阳弧',
  [ChartType.Promittor]: '承诺星盘',
};

export function chartTitle(type: ChartType): string {
  return CHART_TITLES[type] || '未知';
}

let idCounter = 0;
export function generateWindowId(): string {
  idCounter += 1;
  return `wb-win-${Date.now()}-${idCounter}`;
}
