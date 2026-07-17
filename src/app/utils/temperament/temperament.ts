import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import { Horoscope, Planet, ReturnHoroscope } from '../../type/interface/response-data';
import { DeepReadonly } from '../../type/interface/deep-readonly';
import { Result } from '../../type/interface/result';
import { degNorm, zodiacLong } from '../horo-math/horo-math';
import { rulership } from '../image/zodiac';
import {
  calculateAllPlanetDignities,
  findChartAlmuten,
} from '../planet-power/planet-power';
import { getPlanetHouse } from '../planet-power/house-placement';

export enum Quality {
  Hot = 'hot',
  Cold = 'cold',
  Dry = 'dry',
  Wet = 'wet',
}

export enum ContributorKind {
  Planet = 'planet',
  Sign = 'sign',
}

export interface TemperamentContributor {
  id: string;
  kind: ContributorKind;
  name: PlanetName | Zodiac;
  sources: string[];
  hot: boolean;
  cold: boolean;
  dry: boolean;
  wet: boolean;
}

export interface TemperamentSummary {
  hot: number;
  cold: number;
  dry: number;
  wet: number;
  sanguine: number; // 多血质（热+湿）
  phlegmatic: number; // 粘液质（冷+湿）
  choleric: number; // 胆汁质（热+干）
  melancholic: number; // 抑郁质（冷+干）
  total: number;
  percentages: {
    sanguine: number; // 多血质（热+湿）
    phlegmatic: number; // 粘液质（冷+湿）
    choleric: number; // 胆汁质（热+干）
    melancholic: number; // 抑郁质（冷+干）
  };
}

export const GATHERABLE_PLANETS: readonly PlanetName[] = [
  PlanetName.Sun,
  PlanetName.Moon,
  PlanetName.Mercury,
  PlanetName.Venus,
  PlanetName.Mars,
  PlanetName.Jupiter,
  PlanetName.Saturn,
  PlanetName.NorthNode,
  PlanetName.SouthNode,
];

const PLANET_FIXED_QUALITIES: Partial<Record<PlanetName, Quality[]>> = {
  [PlanetName.Saturn]: [Quality.Cold, Quality.Dry],
  [PlanetName.Jupiter]: [Quality.Hot, Quality.Wet],
  [PlanetName.Mars]: [Quality.Hot, Quality.Dry],
  [PlanetName.Venus]: [Quality.Hot, Quality.Wet],
  [PlanetName.Mercury]: [Quality.Hot, Quality.Wet],
  [PlanetName.NorthNode]: [Quality.Hot, Quality.Wet],
  [PlanetName.SouthNode]: [Quality.Hot, Quality.Dry, Quality.Cold],
};

function sunQualities(sunSign: Zodiac): Quality[] {
  const group = Math.floor(sunSign / 3);
  switch (group) {
    case 0:
      return [Quality.Hot, Quality.Wet];
    case 1:
      return [Quality.Hot, Quality.Dry];
    case 2:
      return [Quality.Cold, Quality.Dry];
    default:
      return [Quality.Cold, Quality.Wet];
  }
}

function moonQualities(elongation: number): Quality[] {
  const phase = Math.floor(elongation / 90);
  switch (phase) {
    case 0:
      return [Quality.Hot, Quality.Wet];
    case 1:
      return [Quality.Hot, Quality.Dry];
    case 2:
      return [Quality.Cold, Quality.Dry];
    default:
      return [Quality.Cold, Quality.Wet];
  }
}

function signQualities(sign: Zodiac): Quality[] {
  const element = sign % 4;
  switch (element) {
    case 0:
      return [Quality.Hot, Quality.Dry];
    case 1:
      return [Quality.Cold, Quality.Dry];
    case 2:
      return [Quality.Hot, Quality.Wet];
    default:
      return [Quality.Cold, Quality.Wet];
  }
}

function planetQualities(
  name: PlanetName,
  sunSign?: Zodiac,
  elongation?: number,
): Result<Quality[], string> {
  if (name === PlanetName.Sun) {
    if (sunSign === undefined) return { ok: false, error: '计算太阳性质需要提供太阳所在星座' };
    return { ok: true, value: sunQualities(sunSign) };
  }
  if (name === PlanetName.Moon) {
    if (elongation === undefined) return { ok: false, error: '计算月亮性质需要提供月日距角' };
    return { ok: true, value: moonQualities(elongation) };
  }
  return { ok: true, value: PLANET_FIXED_QUALITIES[name] ?? [] };
}

function toContributor(
  kind: ContributorKind,
  name: PlanetName | Zodiac,
  sources: string[],
  qualities: Quality[],
): TemperamentContributor {
  return {
    id: `${kind}:${name}`,
    kind,
    name,
    sources,
    hot: qualities.includes(Quality.Hot),
    cold: qualities.includes(Quality.Cold),
    dry: qualities.includes(Quality.Dry),
    wet: qualities.includes(Quality.Wet),
  };
}

/**
 * 计算气质贡献者列表（按传统体液学说收集影响气质的行星与星座）
 * @param horo 星盘数据
 * @returns 成功时返回贡献者列表，失败时返回错误信息（如缺少太阳或月亮）
 */
export function calculateTemperamentContributors(
  horo: DeepReadonly<Horoscope | ReturnHoroscope>,
): Result<TemperamentContributor[], string> {
  const sun = horo.planets.find((p) => p.name === PlanetName.Sun);
  const moon = horo.planets.find((p) => p.name === PlanetName.Moon);
  if (!sun || !moon) {
    return { ok: false, error: '星盘中缺少太阳或月亮，无法计算气质' };
  }

  const elongation = degNorm(moon.long - sun.long);
  const sunSign = zodiacLong(sun.long).zodiac;
  const ascSign = zodiacLong(horo.asc.long).zodiac;

  const planetByName = new Map(horo.planets.map((p) => [p.name, p] as [PlanetName, Planet]));

  const planetSources = new Map<PlanetName, Set<string>>();
  const addPlanet = (name: PlanetName, source: string) => {
    if (!planetSources.has(name)) planetSources.set(name, new Set());
    planetSources.get(name)!.add(source);
  };

  addPlanet(rulership(ascSign), '1宫主星');

  for (const p of horo.planets) {
    if (!GATHERABLE_PLANETS.includes(p.name)) continue;
    const houseResult = getPlanetHouse(p.long, horo.cusps);
    if (!houseResult.ok) {
      return { ok: false, error: houseResult.error };
    }
    if (houseResult.value === 1) {
      addPlanet(p.name, '1宫内行星');
    }
  }

  for (const a of horo.aspects) {
    let other: PlanetName | null = null;
    if (a.p0 === PlanetName.ASC) other = a.p1;
    else if (a.p1 === PlanetName.ASC) other = a.p0;
    if (other !== null && GATHERABLE_PLANETS.includes(other)) {
      addPlanet(other, '与ASC相位');
    }
  }

  addPlanet(PlanetName.Moon, '月亮');

  for (const a of horo.aspects) {
    let other: PlanetName | null = null;
    if (a.p0 === PlanetName.Moon) other = a.p1;
    else if (a.p1 === PlanetName.Moon) other = a.p0;
    if (other !== null && GATHERABLE_PLANETS.includes(other)) {
      addPlanet(other, '与月亮相位');
    }
  }

  addPlanet(PlanetName.Sun, '太阳');

  const dignityResult = calculateAllPlanetDignities(horo.planets);
  if (dignityResult.ok) {
    const almuten = findChartAlmuten(dignityResult.value);
    if (almuten) addPlanet(almuten.planet.name, '星盘主星');
  }

  const signSources = new Map<Zodiac, Set<string>>();
  const addSign = (sign: Zodiac, source: string) => {
    if (!signSources.has(sign)) signSources.set(sign, new Set());
    signSources.get(sign)!.add(source);
  };

  addSign(ascSign, '1宫头星座');

  const contributors: TemperamentContributor[] = [];
  for (const [name, sources] of planetSources) {
    const planet = planetByName.get(name);
    if (planet) {
      addSign(zodiacLong(planet.long).zodiac, '行星所落星座');
    }
    const qResult = planetQualities(name, sunSign, elongation);
    if (!qResult.ok) return { ok: false, error: qResult.error };
    contributors.push(
        toContributor(
          ContributorKind.Planet,
          name,
          [...sources],
          qResult.value,
        ),
      );
  }

  for (const [sign, sources] of signSources) {
    contributors.push(
      toContributor(ContributorKind.Sign, sign, [...sources], signQualities(sign)),
    );
  }

  return { ok: true, value: contributors };
}

export function getContributorQualities(
  kind: ContributorKind,
  name: PlanetName | Zodiac,
  horo: DeepReadonly<Horoscope | ReturnHoroscope>,
): Result<Quality[], string> {
  if (kind === ContributorKind.Sign) return { ok: true, value: signQualities(name as Zodiac) };
  const planetName = name as PlanetName;
  if (planetName !== PlanetName.Sun && planetName !== PlanetName.Moon) {
    return planetQualities(planetName);
  }
  if (planetName === PlanetName.Sun) {
    const sun = horo.planets.find((p) => p.name === PlanetName.Sun);
    if (!sun) return { ok: false, error: '星盘中缺少太阳，无法计算太阳性质' };
    return planetQualities(planetName, zodiacLong(sun.long).zodiac);
  }
  const sun = horo.planets.find((p) => p.name === PlanetName.Sun);
  const moon = horo.planets.find((p) => p.name === PlanetName.Moon);
  if (!sun) return { ok: false, error: '星盘中缺少太阳，无法计算月亮性质' };
  if (!moon) return { ok: false, error: '星盘中缺少月亮，无法计算月亮性质' };
  return planetQualities(planetName, zodiacLong(sun.long).zodiac, degNorm(moon.long - sun.long));
}

export function createContributor(
  kind: ContributorKind,
  name: PlanetName | Zodiac,
  sources: string[],
  qualities: Quality[],
): TemperamentContributor {
  return toContributor(kind, name, sources, qualities);
}

export function calculateTemperamentSummary(
  contributors: TemperamentContributor[],
): TemperamentSummary {
  let hot = 0;
  let cold = 0;
  let dry = 0;
  let wet = 0;
  for (const c of contributors) {
    if (c.hot) hot++;
    if (c.cold) cold++;
    if (c.dry) dry++;
    if (c.wet) wet++;
  }

  const sanguine = hot + wet;
  const phlegmatic = cold + wet;
  const choleric = hot + dry;
  const melancholic = cold + dry;
  const total = sanguine + phlegmatic + choleric + melancholic;
  const pct = (v: number) => (total === 0 ? 0 : (v / total) * 100);

  return {
    hot,
    cold,
    dry,
    wet,
    sanguine,
    phlegmatic,
    choleric,
    melancholic,
    total,
    percentages: {
      sanguine: pct(sanguine),
      phlegmatic: pct(phlegmatic),
      choleric: pct(choleric),
      melancholic: pct(melancholic),
    },
  };
}
