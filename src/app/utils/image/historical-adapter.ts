import {
  HistoricalHoroResponse,
  HistoricalPlanet,
  Horoscope,
  Planet,
  HoroDateTime,
  GeoPosition,
} from '../../type/interface/response-data';
import { PlanetName, PlanetSpeedState } from '../../type/enum/planet';
import { degNorm } from '../horo-math/horo-math';

const ANGLE_NAMES = new Set<PlanetName>([
  PlanetName.ASC,
  PlanetName.MC,
  PlanetName.DSC,
  PlanetName.IC,
]);

function historicalPlanetToPlanet(hp: HistoricalPlanet): Planet {
  return {
    name: hp.name,
    long: hp.longitude,
    lat: hp.latitude,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  };
}

/**
 * 将古代星盘计算响应适配为 Horoscope 格式，复用 drawHorosco 绘制函数
 */
export function adaptHistoricalToHoroscope(
  response: HistoricalHoroResponse,
  houseSystem?: string,
): Horoscope {
  const cusps = response.cusps;

  // 从 cusps 推导四轴
  const ascLong = cusps[0];
  const mcLong = cusps[9];
  const dscLong = degNorm(ascLong + 180);
  const icLong = degNorm(mcLong + 180);

  const makeAnglePlanet = (name: PlanetName, long: number): Planet => ({
    name,
    long,
    lat: 0,
    speed: 0,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: PlanetSpeedState.均,
  });

  const asc = makeAnglePlanet(PlanetName.ASC, ascLong);
  const mc = makeAnglePlanet(PlanetName.MC, mcLong);
  const dsc = makeAnglePlanet(PlanetName.DSC, dscLong);
  const ic = makeAnglePlanet(PlanetName.IC, icLong);

  // 从行星列表中提取福点，过滤四轴，其余为普通行星
  const partOfFortune = historicalPlanetToPlanet(
    response.planets.find((p) => p.name === PlanetName.PartOfFortune) ?? {
      name: PlanetName.PartOfFortune,
      longitude: 0,
      latitude: 0,
    },
  );
  const regularPlanets = response.planets
    .filter(
      (p) => p.name !== PlanetName.PartOfFortune && !ANGLE_NAMES.has(p.name),
    )
    .map(historicalPlanetToPlanet);

  const defaultDate: HoroDateTime = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    tz: 0,
  };

  const defaultGeo: GeoPosition = { long: 0, lat: 0 };

  return {
    date: defaultDate,
    geo: defaultGeo,
    house_name: houseSystem ?? '未知',
    cusps,
    asc,
    mc,
    dsc,
    ic,
    planets: regularPlanets,
    part_of_fortune: partOfFortune,
    is_diurnal: false,
    planetary_day: PlanetName.Sun,
    planetary_hours: PlanetName.Sun,
    aspects: response.aspects,
    antiscoins: response.antiscoins,
    contraantiscias: response.contraantiscias,
    fixed_stars: [],
  };
}
