import { PlanetName, PlanetSpeedState } from 'src/app/type/enum/planet';
import { Aspect, Planet } from 'src/app/type/interface/response-data';
import { degNorm, angularDistance, zodiacLong } from 'src/app/utils/horo-math/horo-math';
import { rulership } from 'src/app/utils/image/zodiac';

/**
 * Lot（阿拉伯点/Lot 点）计算所需的星盘数据（Horoscope / ReturnHoroscope 均满足此结构）
 */
export interface LotHoro {
  cusps: Array<number>;
  asc: Planet;
  mc: Planet;
  dsc: Planet;
  ic: Planet;
  planets: Array<Planet>;
}

/**
 * Lot（阿拉伯点）
 */
export interface Lot {
  // 唯一标识
  key: string;
  // 显示名
  label: string;
  // 黄道经度 [0, 360)
  long: number;
  // 计算公式说明
  formula: string;
  // 与星体的相位（p0=星体, p1=Lot）
  aspects: Array<Aspect>;
  // 与星体的映点（p0=Lot, p1=星体）
  antiscoins: Array<Aspect>;
  // 与星体的反映点（p0=Lot, p1=星体）
  contraantiscias: Array<Aspect>;
}

/**
 * Lot 相位表格行（相位、映点、反映点合并平铺）
 */
export interface LotAspectRow {
  // 稳定唯一标识，用于 @for 的 track
  key: string;
  // 所属 Lot 显示名
  partLabel: string;
  // 类型：相位 / 映点 / 反映点
  typeLabel: string;
  // 对方星体
  body: PlanetName;
  // 相位数据
  item: Aspect;
}

// 定点（虚点）：参与配对时容许度取 max(对方.orb / 2, 5)
// 与后台 planet/mod.rs 的 aspect_orb_half 一致
const FIXED_POINTS: PlanetName[] = [
  PlanetName.ASC,
  PlanetName.MC,
  PlanetName.DSC,
  PlanetName.IC,
  PlanetName.NorthNode,
  PlanetName.SouthNode,
  PlanetName.PartOfFortune,
];

const NODES: PlanetName[] = [PlanetName.NorthNode, PlanetName.SouthNode];

const ASCMC: PlanetName[] = [
  PlanetName.ASC,
  PlanetName.MC,
  PlanetName.DSC,
  PlanetName.IC,
];

/**
 * 计算两星相位容许度的半宽
 * 定点参与配对时：Max(对方.orb / 2, 5)
 * 其余（行星+行星）：(p0.orb + p1.orb) / 2
 */
function aspectOrbHalf(p0: Planet, p1: Planet): number {
  const p0Fixed = FIXED_POINTS.includes(p0.name);
  const p1Fixed = FIXED_POINTS.includes(p1.name);
  if (p0Fixed || p1Fixed) {
    const otherOrb = p0Fixed ? p1.orb : p0.orb;
    return Math.max(otherOrb / 2, 5);
  }
  return (p0.orb + p1.orb) / 2;
}

/**
 * 非比较盘0度相位，只计算行星间度数，未计算行星所落星座有相位
 * 移植自后台 planet/mod.rs 的 no_compare_has_aspect_0
 */
function noCompareHasAspect0(p0: Planet, p1: Planet): Aspect | null {
  // 本命不考虑同名星体的相位
  if (p0.name === p1.name) {
    return null;
  }

  // 北交与南交不能看相位
  if (NODES.includes(p0.name) && NODES.includes(p1.name)) {
    return null;
  }

  // 四轴（ASC/DSC/MC/IC）之间不形成相位
  if (ASCMC.includes(p0.name) && ASCMC.includes(p1.name)) {
    return null;
  }

  const aspectDiff = angularDistance(p0.long, p1.long);
  const orbHalf = aspectOrbHalf(p0, p1);

  // 没有在容许度内，无相位
  if (aspectDiff > orbHalf) {
    return null;
  }

  // p_0为四轴或快速行星，p_1为慢速星体
  let p_0 = p0;
  let p_1 = p1;
  if (ASCMC.includes(p1.name)) {
    p_0 = p1;
    p_1 = p0;
  } else if (ASCMC.includes(p0.name)) {
    // 守卫分支：p0 为四轴时保持 p_0 = p0，
    // 防止落入下方速度比较分支而把快速行星交换为 p_0（与后台逻辑一致）
    // 此处初始值即为 p0/p1，无需重新赋值
    // p_0 = p0;
    // p_1 = p1;
  } else if (Math.abs(p1.speed) > Math.abs(p0.speed)) {
    p_0 = p1;
    p_1 = p0;
  }

  // 二星度数相等，为出相位
  if (aspectDiff === 0) {
    return { aspect_value: 0, apply: false, d: 0, p0: p0.name, p1: p1.name };
  }

  // 假定慢星体不动，给快速星体一个增量，需要考虑顺逆
  // aspectDiff1 > 0 为出相位，否则为入相位
  const delta = p_0.speed < 0 ? -aspectDiff : aspectDiff;
  const aspectDiff1 = angularDistance(p_0.long + delta, p_1.long);

  return {
    aspect_value: 0,
    apply: !(aspectDiff1 > 0),
    d: aspectDiff,
    p0: p0.name,
    p1: p1.name,
  };
}

/**
 * 只计算行星间度数，未计算行星所落星座有相位
 * 移植自后台 planet/mod.rs 的 p0_has_aspect_p1
 * 南北交点只能与星体形成合相
 */
function p0HasAspectP1(p0: Planet, p1: Planet): Aspect | null {
  const isNode = NODES.includes(p0.name) || NODES.includes(p1.name);
  const aspectValues: number[] = isNode ? [0] : [0, 60, 90, 120, 180];

  const longDiff = degNorm(p0.long - p1.long);

  for (const aspectValue of aspectValues) {
    const aspect =
      longDiff <= 180
        ? noCompareHasAspect0(p0, { ...p1, long: degNorm(p1.long + aspectValue) })
        : noCompareHasAspect0({ ...p0, long: degNorm(p0.long + aspectValue) }, p1);

    if (aspect) {
      return { ...aspect, aspect_value: aspect.aspect_value + aspectValue };
    }
  }

  return null;
}

/**
 * 本星体与另一星体有相位否
 * 移植自后台 planet/mod.rs 的 has_aspect（本命分支）
 * 相位需通过整星座确认：两星所落星座的距离等于相位值
 */
export function hasAspect(p0: Planet, p1: Planet): Aspect | null {
  const aspect = p0HasAspectP1(p0, p1);
  if (!aspect) {
    return null;
  }

  // 计算两星所落星座的距离 d（取星座起点黄经的最小角距，归约到 [0, 180]）
  const s0 = Math.floor(p0.long / 30) * 30;
  const s1 = Math.floor(p1.long / 30) * 30;
  const d = angularDistance(s0, s1);

  return d === aspect.aspect_value ? aspect : null;
}

/**
 * 映点：两度数之和为180，且映点所落星座与对方所落星座相同
 * 移植自后台 planet/mod.rs 的 has_antiscoin
 */
export function hasAntiscia(self: Planet, p: Planet): Aspect | null {
  const d = Math.abs(degNorm(self.long + p.long) - 180);

  const orbHalf = aspectOrbHalf(self, p);
  if (d > orbHalf) {
    return null;
  }

  // 映点所在星座和对方所落星座相同
  const antiscoinLong = degNorm(180 - self.long);
  const antiscoinSignNum = Math.floor(antiscoinLong / 30);
  const planetSignNum = Math.floor(p.long / 30);

  if (antiscoinSignNum !== planetSignNum) {
    return null;
  }

  return { aspect_value: 0, apply: false, d, p0: self.name, p1: p.name };
}

/**
 * 反映点：360 - 自身黄经的星座与对方所落星座相同
 * 移植自后台 planet/mod.rs 的 has_contraantiscia
 * 交点不参与反映点
 */
export function hasContraantiscia(self: Planet, p: Planet): Aspect | null {
  if (NODES.includes(self.name) || NODES.includes(p.name)) {
    return null;
  }

  const contraantisciaLong = 360 - self.long;

  const contraantisciaSignNum = Math.floor(contraantisciaLong / 30);
  const planetSignNum = Math.floor(p.long / 30);

  if (contraantisciaSignNum !== planetSignNum) {
    return null;
  }

  const d = Math.abs(p.long - contraantisciaLong);

  const orbHalf = aspectOrbHalf(self, p);
  if (d > orbHalf) {
    return null;
  }

  return { aspect_value: 0, apply: false, d, p0: self.name, p1: p.name };
}

/**
 * Lot 与星体（七行星、南北交、四轴）的相位、映点、反映点
 * 配对顺序仿后台：行星在前、四轴在后，Lot 位于末位（与福点一致）
 */
export function calcLotAspects(
  lotLong: number,
  horo: LotHoro,
): Pick<Lot, 'aspects' | 'antiscoins' | 'contraantiscias'> {
  // 合成星体：Lot 按定点规则参与配对，name 使用 PartOfFortune
  // 以复用后台福点的定点容许度规则（aspect_orb_half），name 不用于展示
  const lot: Planet = {
    name: PlanetName.PartOfFortune,
    long: lotLong,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  };

  // 行星在前、四轴在后
  const targets: Planet[] = [
    ...horo.planets.filter((p) => p.name !== PlanetName.PartOfFortune),
    horo.asc,
    horo.mc,
    horo.dsc,
    horo.ic,
  ];

  const aspects = targets
    .map((t) => hasAspect(t, lot))
    .filter((a): a is Aspect => a !== null);
  const antiscoins = targets
    .map((t) => hasAntiscia(lot, t))
    .filter((a): a is Aspect => a !== null);
  const contraantiscias = targets
    .map((t) => hasContraantiscia(lot, t))
    .filter((a): a is Aspect => a !== null);

  return { aspects, antiscoins, contraantiscias };
}

/**
 * 太阳视力点：ASC + 太阳黄道经度 - 火星黄道经度
 */
export function calcSolarVision(horo: LotHoro): number | null {
  const sun = horo.planets.find((p) => p.name === PlanetName.Sun);
  const mars = horo.planets.find((p) => p.name === PlanetName.Mars);
  if (!sun || !mars) return null;
  return degNorm(horo.asc.long + sun.long - mars.long);
}

/**
 * 月亮视力点：ASC + 月亮黄道经度 - 土星黄道经度
 */
export function calcLunarVision(horo: LotHoro): number | null {
  const moon = horo.planets.find((p) => p.name === PlanetName.Moon);
  const saturn = horo.planets.find((p) => p.name === PlanetName.Saturn);
  if (!moon || !saturn) return null;
  return degNorm(horo.asc.long + moon.long - saturn.long);
}

/**
 * Lot of Children 子女点（《明译天文书》，不区分昼夜）：
 * 黄道经度 = ASC + 5宫头的黄道度数 - 5宫主的黄道度数
 * 5宫主为5宫头所落星座的入庙守护星
 */
export function calcLotOfChildren(horo: LotHoro): number | null {
  const cusp5 = horo.cusps?.[4];
  if (cusp5 == null) return null;

  const rulerName = rulership(zodiacLong(cusp5).zodiac);
  const ruler = horo.planets.find((p) => p.name === rulerName);
  if (!ruler) return null;

  return degNorm(horo.asc.long + cusp5 - ruler.long);
}

/**
 * 财富点（《明译天文书》，不区分昼夜）：
 * 黄道经度 = ASC + 2宫头的黄道度数 - 2宫主的黄道度数
 * 2宫主为2宫头所落星座的入庙守护星
 */
export function calcPartofWealth(horo: LotHoro): number | null {
  const cusp2 = horo.cusps?.[1];
  if (cusp2 == null) return null;

  const rulerName = rulership(zodiacLong(cusp2).zodiac);
  const ruler = horo.planets.find((p) => p.name === rulerName);
  if (!ruler) return null;

  return degNorm(horo.asc.long + cusp2 - ruler.long);
}

/**
 * 计算所有 Lot（财富点、子女点、视力点），含与星体的相位、映点、反映点
 */
export function calcLots(horo: LotHoro): Lot[] {
  const lots: Lot[] = [];

  const wealth = calcPartofWealth(horo);
  if (wealth !== null) {
    lots.push({
      key: 'PartofWealth',
      label: '财富点',
      long: wealth,
      formula: 'ASC + 2宫头黄道度数 - 2宫主黄道度数（《明译天文书》，不区分昼夜）',
      ...calcLotAspects(wealth, horo),
    });
  }

  const children = calcLotOfChildren(horo);
  if (children !== null) {
    lots.push({
      key: 'PartofChildren',
      label: '子女点',
      long: children,
      formula: 'ASC + 5宫头黄道度数 - 5宫主黄道度数（《明译天文书》，不区分昼夜）',
      ...calcLotAspects(children, horo),
    });
  }

  const solar = calcSolarVision(horo);
  if (solar !== null) {
    lots.push({
      key: 'solarVision',
      label: '视力点(日)',
      long: solar,
      formula: 'ASC + 太阳黄道经度 - 火星黄道经度',
      ...calcLotAspects(solar, horo),
    });
  }

  const lunar = calcLunarVision(horo);
  if (lunar !== null) {
    lots.push({
      key: 'lunarVision',
      label: '视力点(月)',
      long: lunar,
      formula: 'ASC + 月亮黄道经度 - 土星黄道经度',
      ...calcLotAspects(lunar, horo),
    });
  }

  return lots;
}
