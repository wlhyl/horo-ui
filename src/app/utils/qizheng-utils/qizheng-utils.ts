import { PlanetName } from 'src/app/type/enum/qizheng';
import { Horoscope, Planet } from 'src/app/type/interface/response-qizheng';

/**
 * 交换罗喉与计都的名称
 * @param horoscope 星盘数据
 */
export function swapNodeNames(horoscope: Horoscope): void {
  const swapPlanetName = (name: PlanetName): PlanetName => {
    if (name === PlanetName.罗) return PlanetName.计;
    if (name === PlanetName.计) return PlanetName.罗;
    return name;
  };

  horoscope.native_planets.forEach((p: Planet) => {
    p.name = swapPlanetName(p.name);
  });
  horoscope.process_planets.forEach((p: Planet) => {
    p.name = swapPlanetName(p.name);
  });
}
