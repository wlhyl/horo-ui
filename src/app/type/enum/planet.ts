/**
 * 行星名
 */
export enum PlanetName {
  ASC = 'ASC',
  MC = 'MC',
  DSC = 'DSC',
  IC = 'IC',
  Sun = 'Sun',
  Moon = 'Moon',
  Mercury = 'Mercury',
  Venus = 'Venus',
  Mars = 'Mars',
  Jupiter = 'Jupiter',
  Saturn = 'Saturn',
  NorthNode = 'NorthNode',
  SouthNode = 'SouthNode',
  PartOfFortune = 'PartOfFortune',
}

/** 上级行星（轨道在地球之外，含火星） */
const SUPERIOR_PLANETS: readonly PlanetName[] = [
  PlanetName.Mars,
  PlanetName.Jupiter,
  PlanetName.Saturn,
];

/** 下级行星（轨道在地球之内） */
const INFERIOR_PLANETS: readonly PlanetName[] = [
  PlanetName.Venus,
  PlanetName.Mercury,
];

/** 吉星 */
const BENEFIC_PLANETS: readonly PlanetName[] = [
  PlanetName.Venus,
  PlanetName.Jupiter,
];

/** 凶星 */
const MALEFIC_PLANETS: readonly PlanetName[] = [
  PlanetName.Mars,
  PlanetName.Saturn,
];

export namespace PlanetName {
  /** 是否为上级行星（火/木/土） */
  export function isSuperior(planet: PlanetName): boolean {
    return SUPERIOR_PLANETS.includes(planet);
  }
  /** 是否为下级行星（金/水） */
  export function isInferior(planet: PlanetName): boolean {
    return INFERIOR_PLANETS.includes(planet);
  }
  /** 是否为吉星（金/木） */
  export function isBenefic(planet: PlanetName): boolean {
    return BENEFIC_PLANETS.includes(planet);
  }
  /** 是否为凶星（火/土） */
  export function isMalefic(planet: PlanetName): boolean {
    return MALEFIC_PLANETS.includes(planet);
  }
}

export enum PlanetSpeedState {
  快 = '快',
  均 = '均',
  慢 = '慢',
}
