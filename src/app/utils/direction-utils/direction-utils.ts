import { PlanetName } from 'src/app/type/enum/planet';
import { DateRequest } from 'src/app/type/interface/request-data';
import {
  HoroDateTime,
  Promittor,
  PromittorType,
} from 'src/app/type/interface/response-data';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import { getPromittorPlanet as getPromittorPlanetUtil } from 'src/app/utils/promittor/promittor';
import { Horoconfig } from 'src/app/services/config/horo-config.service';

export const ALL_SIGNIFICATORS: PlanetName[] = [
  PlanetName.ASC,
  PlanetName.MC,
  PlanetName.DSC,
  PlanetName.IC,
  PlanetName.Sun,
  PlanetName.Moon,
  PlanetName.Mercury,
  PlanetName.Venus,
  PlanetName.Mars,
  PlanetName.Jupiter,
  PlanetName.Saturn,
  PlanetName.NorthNode,
  PlanetName.SouthNode,
  PlanetName.PartOfFortune,
];

export function formatDate(date: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}): string {
  return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')} ${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}`;
}

export function formatArc(arc: number): string {
  const dms = degreeToDMS(arc);
  const sign = arc >= 0 ? '' : '-';
  return `${sign}${Math.abs(dms.d)}°${Math.abs(dms.m).toString().padStart(2, '0')}'${Math.abs(dms.s).toString().padStart(2, '0')}"`;
}

export function addYears(
  date: HoroDateTime | DateRequest,
  years: number,
): HoroDateTime {
  return {
    year: date.year + years,
    month: date.month,
    day: date.day,
    hour: date.hour,
    minute: date.minute,
    second: date.second,
    tz: date.tz,
  };
}

export function getCurrentDateMinusYears(
  years: number,
  tz: number,
): HoroDateTime {
  const now = new Date();
  return {
    year: now.getFullYear() - years,
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    tz,
  };
}

export function getSignificatorDisplayText(
  sig: PlanetName,
  config: Horoconfig,
): string {
  if (sig === PlanetName.MC) return 'MC';
  if (sig === PlanetName.ASC) return 'ASC';
  if (sig === PlanetName.DSC) return 'DSC';
  if (sig === PlanetName.IC) return 'IC';
  if (sig === PlanetName.Sun) return '☉';
  if (sig === PlanetName.Moon) return '☽';
  if (sig === PlanetName.Mercury) return '☿';
  if (sig === PlanetName.Venus) return '♀';
  if (sig === PlanetName.Mars) return '♂';
  if (sig === PlanetName.Jupiter) return '♃';
  if (sig === PlanetName.Saturn) return '♄';
  if (sig === PlanetName.NorthNode) return '☊';
  if (sig === PlanetName.SouthNode) return '☋';
  if (sig === PlanetName.PartOfFortune) return '⊗';
  return config.planetFontString(sig);
}

export function checkSignificator(
  significator: PlanetName,
  selected: PlanetName[],
): boolean {
  if (selected.length === 0) return true;
  return selected.includes(significator);
}

export function checkPromittorType(
  promittor: Promittor,
  filter: PromittorType[],
): boolean {
  if (filter.length === 0) return true;
  return filter.some((type) => type in promittor);
}

export function checkPromittorPlanet(
  promittor: Promittor,
  selected: PlanetName[],
): boolean {
  if (selected.length === 0) return true;
  const planet = getPromittorPlanetUtil(promittor);
  if (planet === null) return false;
  return selected.includes(planet);
}

export function checkDateRange(
  date: HoroDateTime,
  startDate: HoroDateTime,
  endDate: HoroDateTime,
): boolean {
  const dateTime = dateToNumber(date);
  if (dateTime < dateToNumber(startDate)) return false;
  if (dateTime > dateToNumber(endDate)) return false;
  return true;
}

export function dateToNumber(date: HoroDateTime): number {
  return new Date(
    date.year,
    date.month - 1,
    date.day,
    date.hour,
    date.minute,
    date.second,
  ).getTime();
}
