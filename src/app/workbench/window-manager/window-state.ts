import { PlanetName } from 'src/app/type/enum/planet';

export enum WindowState {
  Normal = 'normal',
  Minimized = 'minimized',
  Maximized = 'maximized',
  Hidden = 'hidden',
}

export enum ChartType {
  Native = 'Native',
  Event = 'Event',
  Derived = 'Derived',
  Profection = 'Profection',
  MedievalProfection = 'MedievalProfection',
  CustomMonthProfection = 'CustomMonthProfection',
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
  DailyDirection = 'DailyDirection',
  SolarArc = 'SolarArc',
  QuadrantProcess = 'QuadrantProcess',
  Promittor = 'Promittor',
  SecondaryProgression = 'SecondaryProgression',
  SecondaryProgressionComparNative = 'SecondaryProgressionComparNative',
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
  // 衍生盘窗口的基准行星（打开时快照，窗口间相互独立）
  derivedPlanetName?: PlanetName;
}

const CHART_TITLES: Record<ChartType, string> = {
  [ChartType.Native]: '本命盘',
  [ChartType.Event]: '天象盘',
  [ChartType.Derived]: '衍生盘',
  [ChartType.Profection]: '小限',
  [ChartType.MedievalProfection]: '中世纪小限',
  [ChartType.CustomMonthProfection]: '自定义月小限',
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
  [ChartType.DailyDirection]: '每日回归方向弧',
  [ChartType.SolarArc]: '太阳弧',
  [ChartType.QuadrantProcess]: '象限推运',
  [ChartType.Promittor]: '承诺星盘',
  [ChartType.SecondaryProgression]: '次限推运',
  [ChartType.SecondaryProgressionComparNative]: '次限比本命',
};

export function chartTitle(type: ChartType): string {
  return CHART_TITLES[type] || '未知';
}

/** 衍生盘基准行星的中文名 */
const DERIVED_PLANET_TITLES: Partial<Record<PlanetName, string>> = {
  [PlanetName.Sun]: '太阳',
  [PlanetName.Moon]: '月亮',
  [PlanetName.Mercury]: '水星',
  [PlanetName.Venus]: '金星',
  [PlanetName.Mars]: '火星',
  [PlanetName.Jupiter]: '木星',
  [PlanetName.Saturn]: '土星',
};

export function derivedChartTitle(planet: PlanetName): string {
  return `衍生盘·${DERIVED_PLANET_TITLES[planet] ?? planet}`;
}

let idCounter = 0;
export function generateWindowId(): string {
  idCounter += 1;
  return `wb-win-${Date.now()}-${idCounter}`;
}
