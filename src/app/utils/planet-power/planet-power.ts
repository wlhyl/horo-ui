import { PlanetName, PlanetSpeedState } from '../../type/enum/planet';
import { Horoscope, Planet, ReturnHoroscope } from '../../type/interface/response-data';
import { DeepReadonly } from '../../type/interface/deep-readonly';
import { Result } from '../../type/interface/result';
import { Zodiac } from '../../type/enum/zodiac';
import { angularDistance, degNorm, zodiacLong } from '../horo-math/horo-math';
import {
  detriment,
  fall,
  getDignityLordsAt,
  TRADITIONAL_PLANETS,
} from '../image/zodiac';
import { calculateMutualReceptions } from '../reception/reception';
import { DignityKind } from '../reception/reception';
import { getPlanetHouse } from './house-placement';

export const DIGNITY_SCORES = {
  rulership: 5,
  exaltation: 4,
  triplicity: 3,
  term: 2,
  face: 1,
  fall: -4,
  detriment: -5,
  peregrine: -5,
  mutualReceptionRulership: 5,
  mutualReceptionExaltation: 4,
} as const;

export const ACCIDENTAL_SCORES = {
  /** 1宫或10宫 */
  house1or10: 5,
  /** 7宫、4宫或11宫 */
  house7or4or11: 4,
  /** 2宫或5宫 */
  house2or5: 3,
  /** 9宫 */
  house9: 2,
  /** 3宫 */
  house3: 1,
  /** 12宫 */
  house12: -5,
  /** 6宫或8宫 */
  house6or8: -2,
  /** 顺行 */
  direct: 4,
  /** 逆行 */
  retrograde: -5,
  /** 速度比平均快 */
  fast: 2,
  /** 速度比平均慢 */
  slow: -2,
  /** 上级行星在太阳东方（日东） */
  orientalSuperior: 2,
  /** 下级行星在太阳西方（日西） */
  occidentalInferior: 2,
  /** 上级行星在太阳西方（日西，不利） */
  occidentalSuperior: -2,
  /** 下级行星在太阳东方（日东，不利） */
  orientalInferior: -2,
  /** 月亮渐盈（上弦月） */
  moonWaxing: 2,
  /** 月亮渐亏（下弦月） */
  moonWaning: -2,
  /** 离日（不受日光影响） */
  freeFromSun: 5,
  /** 日核（与太阳角距 < 0°17'） */
  cazimi: 5,
  /** 燃烧（与太阳角距 0°17'~8°30'） */
  combust: -5,
  /** 太阳光束下（与太阳角距 8°30'~17°） */
  underSunbeams: -4,
  /** 与吉星（金/木）合相 */
  conjunctBenefic: 5,
  /** 与北交点合相 */
  conjunctNorthNode: 4,
  /** 与吉星（金/木）三合（120°） */
  trineBenefic: 4,
  /** 与吉星（金/木）六合（60°） */
  sextileBenefic: 3,
  /** 与凶星（火/土）合相 */
  conjunctMalefic: -5,
  /** 与南交点合相 */
  conjunctSouthNode: -4,
  /** 被火土包围（与火土均合相且在两者之间） */
  besieged: -5,
  /** 与凶星（火/土）对冲（180°） */
  oppositionMalefic: -4,
  /** 与凶星（火/土）刑（90°） */
  squareMalefic: -3,
} as const;

/** 日核阈值：与太阳角距 < 0°17' */
export const CAZIMI_THRESHOLD = 17 / 60;
/** 燃烧阈值：与太阳角距 < 8°30' */
export const COMBUST_THRESHOLD = 8.5;
/** 太阳光束下阈值：与太阳角距 < 17° */
export const SUNBEAMS_THRESHOLD = 17;

/**
 * 行星先天黄道力量：描述某行星在其所处位置的尊贵状态
 * - 庙/旺/三分/界/面：正向力量
 * - 陷/弱：负向力量
 * - 游离星(peregrine)：无任何先天尊贵/失势时扣分
 * - 互容(mutualReception)：入庙/入旺互容，在 calculateAllPlanetPowers 中标注
 * - score：各项力量分数之和（正负抵扣，不含互容分，互容在 calculateAllPlanetPowers 中叠加）
 */
export interface PlanetDignity {
  planet: Planet;
  zodiac: Zodiac;
  zodiacDegree: number;
  rulership: boolean;
  exaltation: boolean;
  triplicity: boolean;
  term: boolean;
  face: boolean;
  fall: boolean;
  detriment: boolean;
  peregrine: boolean;
  mutualReceptionRulership: boolean;
  mutualReceptionExaltation: boolean;
  score: number;
}

export function calculatePlanetDignity(
  planet: Planet,
): PlanetDignity {
  const { zodiac, long: zodiacDegree } = zodiacLong(planet.long);
  const lords = getDignityLordsAt(zodiac, zodiacDegree);

  const isRulership = lords.rulership === planet.name;
  const isExaltation = lords.exaltation === planet.name;
  const isTriplicity = lords.triplicity.includes(planet.name);
  const isTerm = lords.term === planet.name;
  const isFace = lords.face === planet.name;
  const isFall = fall(zodiac) === planet.name;
  const isDetriment = detriment(zodiac) === planet.name;
  const isPeregrine =
    TRADITIONAL_PLANETS.includes(planet.name) &&
    !isRulership &&
    !isExaltation &&
    !isTriplicity &&
    !isTerm &&
    !isFace &&
    !isFall &&
    !isDetriment;

  const score =
    (isRulership ? DIGNITY_SCORES.rulership : 0) +
    (isExaltation ? DIGNITY_SCORES.exaltation : 0) +
    (isTriplicity ? DIGNITY_SCORES.triplicity : 0) +
    (isTerm ? DIGNITY_SCORES.term : 0) +
    (isFace ? DIGNITY_SCORES.face : 0) +
    (isFall ? DIGNITY_SCORES.fall : 0) +
    (isDetriment ? DIGNITY_SCORES.detriment : 0) +
    (isPeregrine ? DIGNITY_SCORES.peregrine : 0);

  return {
    planet,
    zodiac,
    zodiacDegree,
    rulership: isRulership,
    exaltation: isExaltation,
    triplicity: isTriplicity,
    term: isTerm,
    face: isFace,
    fall: isFall,
    detriment: isDetriment,
    peregrine: isPeregrine,
    mutualReceptionRulership: false,
    mutualReceptionExaltation: false,
    score,
  };
}

export function calculateAllPlanetDignities(
  planets: DeepReadonly<Planet[]>,
): Result<PlanetDignity[], string> {
  const sun = planets.find((p) => p.name === PlanetName.Sun);
  if (!sun) {
    return { ok: false, error: '星盘中缺少太阳，无法计算行星力量' };
  }

  return {
    ok: true,
    value: planets
      .filter((p) => TRADITIONAL_PLANETS.includes(p.name))
      .map((p) => calculatePlanetDignity(p)),
  };
}

export function findChartAlmuten(
  dignities: PlanetDignity[],
): PlanetDignity | null {
  if (dignities.length === 0) return null;
  return dignities.reduce((max, current) =>
    current.score > max.score ? current : max,
  );
}

/**
 * 行星后天力量：描述行星在星盘中的位置与运动状态带来的力量增减
 */
export interface PlanetAccidentalPower {
  /** 所在宫位（1-12） */
  house: number;
  /** 顺行 */
  direct: boolean;
  /** 逆行 */
  retrograde: boolean;
  /** 速度比平均快 */
  fast: boolean;
  /** 速度比平均慢 */
  slow: boolean;
  /** 在太阳东方（日东） */
  oriental: boolean;
  /** 在太阳西方（日西） */
  occidental: boolean;
  /** 月亮渐盈（上弦月） */
  waxing: boolean;
  /** 月亮渐亏（下弦月） */
  waning: boolean;
  /** 离日（不受日光影响） */
  freeFromSun: boolean;
  /** 日核（与太阳角距 < 0°17'） */
  cazimi: boolean;
  /** 燃烧（与太阳角距 0°17'~8°30'） */
  combust: boolean;
  /** 太阳光束下（与太阳角距 8°30'~17°） */
  underSunbeams: boolean;
  /** 与吉星（金/木）合相 */
  conjunctBenefic: boolean;
  /** 与北交点合相 */
  conjunctNorthNode: boolean;
  /** 与吉星（金/木）三合（120°） */
  trineBenefic: boolean;
  /** 与吉星（金/木）六合（60°） */
  sextileBenefic: boolean;
  /** 与凶星（火/土）合相 */
  conjunctMalefic: boolean;
  /** 与南交点合相 */
  conjunctSouthNode: boolean;
  /** 被火土包围（与火土均合相且在两者之间） */
  besieged: boolean;
  /** 与凶星（火/土）对冲（180°） */
  oppositionMalefic: boolean;
  /** 与凶星（火/土）刑（90°） */
  squareMalefic: boolean;
  /** 后天力量总分 */
  score: number;
}

function houseScore(house: number): number {
  switch (house) {
    case 1:
    case 10:
      return ACCIDENTAL_SCORES.house1or10;
    case 7:
    case 4:
    case 11:
      return ACCIDENTAL_SCORES.house7or4or11;
    case 2:
    case 5:
      return ACCIDENTAL_SCORES.house2or5;
    case 9:
      return ACCIDENTAL_SCORES.house9;
    case 3:
      return ACCIDENTAL_SCORES.house3;
    case 12:
      return ACCIDENTAL_SCORES.house12;
    case 6:
    case 8:
      return ACCIDENTAL_SCORES.house6or8;
    default:
      return 0;
  }
}

/**
 * 判断行星黄经是否在 a、b 两点之间的较短弧上（不含端点）
 * 用于判断行星是否被火星和土星包围（besieged）
 */
function isBetweenArcs(planetLong: number, a: number, b: number): boolean {
  const aToB = degNorm(b - a);
  const aToPlanet = degNorm(planetLong - a);
  if (aToB <= 180) {
    return aToPlanet > 0 && aToPlanet < aToB;
  }
  return aToPlanet > aToB;
}

function calculatePlanetAccidentalPower(
  planet: DeepReadonly<Planet>,
  horoscope: DeepReadonly<Horoscope | ReturnHoroscope>,
): Result<PlanetAccidentalPower, string> {
  const isValidPlanet =
    TRADITIONAL_PLANETS.includes(planet.name) ||
    planet.name === PlanetName.PartOfFortune;
  if (!isValidPlanet) {
    return { ok: false, error: `${planet.name}不计算后天力量` };
  }

  const sun = horoscope.planets.find((p) => p.name === PlanetName.Sun);
  if (!sun) {
    return { ok: false, error: '缺少太阳' };
  }
  const sunLong = sun.long;

  const houseResult = getPlanetHouse(planet.long, horoscope.cusps);
  if (!houseResult.ok) {
    return { ok: false, error: houseResult.error };
  }
  const house = houseResult.value;
  const hScore = houseScore(house);

  const isNonMoving =
    planet.name === PlanetName.Sun ||
    planet.name === PlanetName.Moon ||
    planet.name === PlanetName.PartOfFortune;
  const isDirect = !isNonMoving && planet.speed >= 0;
  const isRetrograde = !isNonMoving && planet.speed < 0;

  const isNoSpeed = planet.name === PlanetName.PartOfFortune;
  const isFast = !isNoSpeed && planet.speed_state === PlanetSpeedState.快;
  const isSlow = !isNoSpeed && planet.speed_state === PlanetSpeedState.慢;

  // 日心黄经差：行星相对于太阳的角距（0°=合相，180°=对冲）
  const elongation = degNorm(planet.long - sunLong);
  // 东方（日东）：行星在太阳之后升起，elongation > 180°
  // 西方（日西）：行星在太阳之前升起，0° < elongation < 180°
  // 合相（0°）时行星与太阳同度，对冲（180°）时行星离太阳最远，
  // 两者均为东西方过渡点，无法判定属于哪一方，故不计入
  const isOriental = !isNonMoving && elongation > 180;
  const isOccidental = !isNonMoving && elongation > 0 && elongation < 180;

  let orientalOccidentalScore = 0;
  if (PlanetName.isSuperior(planet.name)) {
    if (isOriental)
      orientalOccidentalScore = ACCIDENTAL_SCORES.orientalSuperior;
    else if (isOccidental)
      orientalOccidentalScore = ACCIDENTAL_SCORES.occidentalSuperior;
  } else if (PlanetName.isInferior(planet.name)) {
    if (isOccidental)
      orientalOccidentalScore = ACCIDENTAL_SCORES.occidentalInferior;
    else if (isOriental)
      orientalOccidentalScore = ACCIDENTAL_SCORES.orientalInferior;
  }

  // 月亮渐盈（增光）：从新月后到满月，0° < elongation ≤ 180°（满月为增光顶峰）
  const isWaxing =
    planet.name === PlanetName.Moon && elongation > 0 && elongation <= 180;
  // 月亮渐亏（减光）：满月之后，elongation > 180°
  // 新月（0°）为过渡点，既不算增光也不算减光（此时月亮处于日核，另有计分）
  const isWaning = planet.name === PlanetName.Moon && elongation > 180;

  let isCazimi = false;
  let isCombust = false;
  let isUnderSunbeams = false;
  let isFreeFromSun = false;
  let solarScore = 0;
  if (planet.name !== PlanetName.Sun) {
    const dist = angularDistance(planet.long, sunLong);
    if (dist < CAZIMI_THRESHOLD) {
      isCazimi = true;
      solarScore = ACCIDENTAL_SCORES.cazimi;
    } else if (dist < COMBUST_THRESHOLD) {
      isCombust = true;
      solarScore = ACCIDENTAL_SCORES.combust;
    } else if (dist < SUNBEAMS_THRESHOLD) {
      isUnderSunbeams = true;
      solarScore = ACCIDENTAL_SCORES.underSunbeams;
    } else {
      isFreeFromSun = true;
      solarScore = ACCIDENTAL_SCORES.freeFromSun;
    }
  }

  let isConjunctBenefic = false;
  let isConjunctNorthNode = false;
  let isTrineBenefic = false;
  let isSextileBenefic = false;
  let isConjunctMalefic = false;
  let isConjunctSouthNode = false;
  let isOppositionMalefic = false;
  let isSquareMalefic = false;

  for (const a of horoscope.aspects) {
    const other =
      a.p0 === planet.name ? a.p1 : a.p1 === planet.name ? a.p0 : null;
    if (other === null || other === planet.name) continue;

    if (a.aspect_value === 0) {
      if (PlanetName.isBenefic(other)) isConjunctBenefic = true;
      else if (PlanetName.isMalefic(other)) isConjunctMalefic = true;
      else if (other === PlanetName.NorthNode) isConjunctNorthNode = true;
      else if (other === PlanetName.SouthNode) isConjunctSouthNode = true;
    } else if (a.aspect_value === 120) {
      if (PlanetName.isBenefic(other)) isTrineBenefic = true;
    } else if (a.aspect_value === 60) {
      if (PlanetName.isBenefic(other)) isSextileBenefic = true;
    } else if (a.aspect_value === 180) {
      if (PlanetName.isMalefic(other)) isOppositionMalefic = true;
    } else if (a.aspect_value === 90) {
      if (PlanetName.isMalefic(other)) isSquareMalefic = true;
    }
  }

  const marsLong = horoscope.planets.find(
    (p) => p.name === PlanetName.Mars,
  )?.long;
  const saturnLong = horoscope.planets.find(
    (p) => p.name === PlanetName.Saturn,
  )?.long;
  if (marsLong === undefined || saturnLong === undefined) {
    return { ok: false, error: '缺少火星或土星' };
  }
  const isBesieged =
    planet.name !== PlanetName.Mars &&
    planet.name !== PlanetName.Saturn &&
    isBetweenArcs(planet.long, marsLong, saturnLong) &&
    horoscope.aspects.some(
      (a) =>
        a.aspect_value === 0 &&
        ((a.p0 === planet.name && a.p1 === PlanetName.Mars) ||
          (a.p1 === planet.name && a.p0 === PlanetName.Mars)),
    ) &&
    horoscope.aspects.some(
      (a) =>
        a.aspect_value === 0 &&
        ((a.p0 === planet.name && a.p1 === PlanetName.Saturn) ||
          (a.p1 === planet.name && a.p0 === PlanetName.Saturn)),
    );

  const score =
    hScore +
    (isDirect ? ACCIDENTAL_SCORES.direct : 0) +
    (isRetrograde ? ACCIDENTAL_SCORES.retrograde : 0) +
    (isFast ? ACCIDENTAL_SCORES.fast : 0) +
    (isSlow ? ACCIDENTAL_SCORES.slow : 0) +
    orientalOccidentalScore +
    (isWaxing ? ACCIDENTAL_SCORES.moonWaxing : 0) +
    (isWaning ? ACCIDENTAL_SCORES.moonWaning : 0) +
    solarScore +
    (isConjunctBenefic ? ACCIDENTAL_SCORES.conjunctBenefic : 0) +
    (isConjunctNorthNode ? ACCIDENTAL_SCORES.conjunctNorthNode : 0) +
    (isTrineBenefic ? ACCIDENTAL_SCORES.trineBenefic : 0) +
    (isSextileBenefic ? ACCIDENTAL_SCORES.sextileBenefic : 0) +
    (isConjunctMalefic ? ACCIDENTAL_SCORES.conjunctMalefic : 0) +
    (isConjunctSouthNode ? ACCIDENTAL_SCORES.conjunctSouthNode : 0) +
    (isBesieged ? ACCIDENTAL_SCORES.besieged : 0) +
    (isOppositionMalefic ? ACCIDENTAL_SCORES.oppositionMalefic : 0) +
    (isSquareMalefic ? ACCIDENTAL_SCORES.squareMalefic : 0);

  return {
    ok: true,
    value: {
      house,
      direct: isDirect,
      retrograde: isRetrograde,
      fast: isFast,
      slow: isSlow,
      oriental: isOriental,
      occidental: isOccidental,
      waxing: isWaxing,
      waning: isWaning,
      freeFromSun: isFreeFromSun,
      cazimi: isCazimi,
      combust: isCombust,
      underSunbeams: isUnderSunbeams,
      conjunctBenefic: isConjunctBenefic,
      conjunctNorthNode: isConjunctNorthNode,
      trineBenefic: isTrineBenefic,
      sextileBenefic: isSextileBenefic,
      conjunctMalefic: isConjunctMalefic,
      conjunctSouthNode: isConjunctSouthNode,
      besieged: isBesieged,
      oppositionMalefic: isOppositionMalefic,
      squareMalefic: isSquareMalefic,
      score,
    },
  };
}

/**
 * 行星总力量：先天力量 + 后天力量
 */
export interface PlanetPower {
  planet: Planet;
  essential: PlanetDignity;
  accidental: PlanetAccidentalPower;
  totalScore: number;
}

export function calculateAllPlanetPowers(
  horoscope: DeepReadonly<Horoscope | ReturnHoroscope>,
): Result<PlanetPower[], string> {
  const dignityResult = calculateAllPlanetDignities(horoscope.planets);
  if (!dignityResult.ok) {
    return { ok: false, error: dignityResult.error };
  }

  const mutualReceptions = calculateMutualReceptions(horoscope);

  const mrMap = new Map<
    PlanetName,
    { rulership: boolean; exaltation: boolean }
  >();
  for (const mr of mutualReceptions) {
    const aHasRulership = mr.aDignities.includes(DignityKind.Rulership);
    const bHasRulership = mr.bDignities.includes(DignityKind.Rulership);
    const aHasExaltation = mr.aDignities.includes(DignityKind.Exaltation);
    const bHasExaltation = mr.bDignities.includes(DignityKind.Exaltation);

    if (aHasRulership && bHasRulership) {
      const entry = mrMap.get(mr.a) ?? { rulership: false, exaltation: false };
      entry.rulership = true;
      mrMap.set(mr.a, entry);
      const entryB = mrMap.get(mr.b) ?? { rulership: false, exaltation: false };
      entryB.rulership = true;
      mrMap.set(mr.b, entryB);
    }
    if (aHasExaltation && bHasExaltation) {
      const entry = mrMap.get(mr.a) ?? { rulership: false, exaltation: false };
      entry.exaltation = true;
      mrMap.set(mr.a, entry);
      const entryB = mrMap.get(mr.b) ?? { rulership: false, exaltation: false };
      entryB.exaltation = true;
      mrMap.set(mr.b, entryB);
    }
  }

  const powers: PlanetPower[] = [];
  for (const d of dignityResult.value) {
    const mr = mrMap.get(d.planet.name);
    const mrRulership = mr?.rulership ?? false;
    const mrExaltation = mr?.exaltation ?? false;

    const essentialScore =
      d.score +
      (mrRulership ? DIGNITY_SCORES.mutualReceptionRulership : 0) +
      (mrExaltation ? DIGNITY_SCORES.mutualReceptionExaltation : 0);

    const essential: PlanetDignity = {
      ...d,
      mutualReceptionRulership: mrRulership,
      mutualReceptionExaltation: mrExaltation,
      score: essentialScore,
    };

    const accidentalResult = calculatePlanetAccidentalPower(d.planet, horoscope);
    if (!accidentalResult.ok) return { ok: false, error: accidentalResult.error };

    powers.push({
      planet: d.planet,
      essential,
      accidental: accidentalResult.value,
      totalScore: essentialScore + accidentalResult.value.score,
    });
  }

  const poFDignity = calculatePlanetDignity(horoscope.part_of_fortune);
  const poFAccidentalResult = calculatePlanetAccidentalPower(
    horoscope.part_of_fortune,
    horoscope,
  );
  if (!poFAccidentalResult.ok) {
    return { ok: false, error: poFAccidentalResult.error };
  }
  powers.push({
    planet: horoscope.part_of_fortune,
    essential: poFDignity,
    accidental: poFAccidentalResult.value,
    totalScore: poFDignity.score + poFAccidentalResult.value.score,
  });

  return { ok: true, value: powers };
}
