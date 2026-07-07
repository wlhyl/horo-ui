import { PlanetName } from '../../type/enum/planet';
import { Planet } from '../../type/interface/response-data';
import { DeepReadonly } from '../../type/interface/deep-readonly';
import { Result } from '../../type/interface/result';
import { Zodiac } from '../../type/enum/zodiac';
import { angularDistance, degNorm, zodiacLong } from '../horo-math/horo-math';
import {
  detriment,
  exaltation,
  face,
  fall,
  ptolemyTerm,
  rulership,
  tripilicityOfLily,
} from '../image/zodiac';

export const DIGNITY_SCORES = {
  rulership: 5,
  exaltation: 4,
  triplicity: 3,
  term: 2,
  face: 1,
  fall: -4,
  detriment: -5,
} as const;

export const CAZIMI_THRESHOLD = 17 / 60;
export const COMBUST_THRESHOLD = 8.5;
export const SUNBEAMS_THRESHOLD = 17;

const TRADITIONAL_PLANETS: PlanetName[] = [
  PlanetName.Sun,
  PlanetName.Moon,
  PlanetName.Mercury,
  PlanetName.Venus,
  PlanetName.Mars,
  PlanetName.Jupiter,
  PlanetName.Saturn,
];

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
  cazimi: boolean;
  combust: boolean;
  underSunbeams: boolean;
  score: number;
}

export function calculatePlanetDignity(
  planet: Planet,
  sunLong: number,
): PlanetDignity {
  const { zodiac, long: zodiacDegree } = zodiacLong(planet.long);

  const isRulership = rulership(zodiac) === planet.name;
  const isExaltation = exaltation(zodiac) === planet.name;
  const isTriplicity = tripilicityOfLily(zodiac).includes(planet.name);

  const terms = ptolemyTerm(zodiac);
  let isTerm = false;
  for (let i = 0; i < terms.length; i++) {
    const start = i === 0 ? 0 : terms[i - 1].d;
    const end = terms[i].d;
    if (zodiacDegree >= start && zodiacDegree < end) {
      isTerm = terms[i].p === planet.name;
      break;
    }
  }

  const faceIndex = Math.floor(zodiacDegree / 10);
  const faces = face(zodiac);
  const isFace = faces[faceIndex] === planet.name;

  const isFall = fall(zodiac) === planet.name;
  const isDetriment = detriment(zodiac) === planet.name;

  let isCazimi = false;
  let isCombust = false;
  let isUnderSunbeams = false;
  if (planet.name !== PlanetName.Sun) {
    const dist = angularDistance(planet.long, sunLong);
    if (dist < CAZIMI_THRESHOLD) {
      isCazimi = true;
    } else if (dist < COMBUST_THRESHOLD) {
      isCombust = true;
    } else if (dist < SUNBEAMS_THRESHOLD) {
      isUnderSunbeams = true;
    }
  }

  const score =
    (isRulership ? DIGNITY_SCORES.rulership : 0) +
    (isExaltation ? DIGNITY_SCORES.exaltation : 0) +
    (isTriplicity ? DIGNITY_SCORES.triplicity : 0) +
    (isTerm ? DIGNITY_SCORES.term : 0) +
    (isFace ? DIGNITY_SCORES.face : 0) +
    (isFall ? DIGNITY_SCORES.fall : 0) +
    (isDetriment ? DIGNITY_SCORES.detriment : 0);

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
    cazimi: isCazimi,
    combust: isCombust,
    underSunbeams: isUnderSunbeams,
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
      .map((p) => calculatePlanetDignity(p, sun.long)),
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
