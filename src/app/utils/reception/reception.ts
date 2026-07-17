import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import { Aspect, Horoscope, ReturnHoroscope } from '../../type/interface/response-data';
import { DeepReadonly } from '../../type/interface/deep-readonly';
import { zodiacLong } from '../horo-math/horo-math';
import { getDignityLordsAt, TRADITIONAL_PLANETS } from '../image/zodiac';

/**
 * 可被接纳的星体：七传统行星 + 福点 + 四轴（ASC/DSC/MC/IC）
 * 接纳关系中，被接纳方仅限于此列表
 */
export const RECEIVABLE_BODIES: PlanetName[] = [
  ...TRADITIONAL_PLANETS,
  PlanetName.PartOfFortune,
  PlanetName.ASC,
  PlanetName.DSC,
  PlanetName.MC,
  PlanetName.IC,
];

export enum DignityKind {
  Rulership = 'rulership',
  Exaltation = 'exaltation',
  Triplicity = 'triplicity',
  Term = 'term',
  Face = 'face',
}

export namespace DignityKind {
  const labels: Record<DignityKind, string> = {
    [DignityKind.Rulership]: '庙',
    [DignityKind.Exaltation]: '旺',
    [DignityKind.Triplicity]: '三分',
    [DignityKind.Term]: '界',
    [DignityKind.Face]: '面',
  };

  export function label(k: DignityKind): string {
    return labels[k];
  }
}

export interface Reception {
  receiver: PlanetName;
  received: PlanetName;
  dignities: DignityKind[];
  aspect: Aspect;
}

export interface MutualReception {
  a: PlanetName;
  b: PlanetName;
  aDignities: DignityKind[];
  bDignities: DignityKind[];
}

/**
 * 查询指定星体在给定黄道位置上拥有的所有尊贵（dignity）种类。
 *
 * 通过查询该位置的五种尊贵主星（庙/旺/三分/界/面），判断给定星体是否
 * 恰好是该位置某项尊贵的主星，若是则将其纳入返回列表。
 *
 * 该函数是接纳（reception）与互容（mutual reception）判断的基础：
 * - **接纳**：星体 A 与 B 成相位，且 A 在 B 所落位置拥有尊贵 → A 接纳 B
 * - **互容**：A 在 B 的位置有尊贵，且 B 在 A 的位置也有尊贵 → A、B 互容
 *
 * @param planet  待判定的星体名称
 * @param zodiac  目标位置所在的黄道星座
 * @param degree  目标位置在星座内的度数（0–30）
 * @returns 该星体在给定位置拥有的所有尊贵种类，无尊贵时返回空数组
 */
export function getDignitiesOf(
  planet: PlanetName,
  zodiac: Zodiac,
  degree: number,
): DignityKind[] {
  const lords = getDignityLordsAt(zodiac, degree);
  const result: DignityKind[] = [];
  if (lords.rulership === planet) result.push(DignityKind.Rulership);
  if (lords.exaltation === planet) result.push(DignityKind.Exaltation);
  if (lords.triplicity.includes(planet)) result.push(DignityKind.Triplicity);
  if (lords.term === planet) result.push(DignityKind.Term);
  if (lords.face === planet) result.push(DignityKind.Face);
  return result;
}

function buildBodyLongMap(
  horoscope: DeepReadonly<Horoscope | ReturnHoroscope>,
): Map<PlanetName, number> {
  const map = new Map<PlanetName, number>(horoscope.planets.map(p => [p.name, p.long] as const));
  map.set(horoscope.asc.name, horoscope.asc.long);
  map.set(horoscope.mc.name, horoscope.mc.long);
  map.set(horoscope.dsc.name, horoscope.dsc.long);
  map.set(horoscope.ic.name, horoscope.ic.long);
  map.set(horoscope.part_of_fortune.name, horoscope.part_of_fortune.long);
  return map;
}

function considerReception(
  aspect: DeepReadonly<Aspect>,
  longMap: Map<PlanetName, number>,
  reverse = false,
): Reception | null {
  const receiver: PlanetName = reverse ? aspect.p1 : aspect.p0;
  const received: PlanetName = reverse ? aspect.p0 : aspect.p1;

  if (receiver === received) return null;
  if (!TRADITIONAL_PLANETS.includes(receiver)) return null;
  if (!RECEIVABLE_BODIES.includes(received)) return null;

  const long = longMap.get(received);
  if (long === undefined) return null;

  const { zodiac, long: degree } = zodiacLong(long);
  const dignities = getDignitiesOf(receiver, zodiac, degree);
  if (dignities.length === 0) return null;

  return { receiver, received, dignities, aspect };
}

export function calculateReceptions(
  horoscope: DeepReadonly<Horoscope | ReturnHoroscope>,
): Reception[] {
  const longMap = buildBodyLongMap(horoscope);

  return horoscope.aspects.flatMap(aspect =>
    [considerReception(aspect, longMap),
     considerReception(aspect, longMap, true),
    ].filter((r): r is Reception => r !== null));
}

export function calculateMutualReceptions(
  horoscope: DeepReadonly<Horoscope | ReturnHoroscope>,
): MutualReception[] {
  const longMap = buildBodyLongMap(horoscope);
  const result: MutualReception[] = [];

  for (let i = 0; i < TRADITIONAL_PLANETS.length; i++) {
    const a = TRADITIONAL_PLANETS[i];
    const aLong = longMap.get(a);
    if (aLong === undefined) continue;

    for (let j = i + 1; j < TRADITIONAL_PLANETS.length; j++) {
      const b = TRADITIONAL_PLANETS[j];
      const bLong = longMap.get(b);
      if (bLong === undefined) continue;

      const aPos = zodiacLong(aLong);
      const bPos = zodiacLong(bLong);
      const aDignities = getDignitiesOf(a, bPos.zodiac, bPos.long);
      const bDignities = getDignitiesOf(b, aPos.zodiac, aPos.long);
      if (aDignities.length > 0 && bDignities.length > 0) {
        result.push({ a, b, aDignities, bDignities });
      }
    }
  }

  return result;
}
