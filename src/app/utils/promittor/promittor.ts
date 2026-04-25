import { PlanetName } from 'src/app/type/enum/planet';
import { Promittor } from 'src/app/type/interface/response-data';
import { degreeToDMS, zodiacLong } from 'src/app/utils/horo-math/horo-math';
import { Horoconfig } from 'src/app/services/config/horo-config.service';

export function getTermInfo(
  promittor: Promittor,
  config: Horoconfig,
): { zodiac: string; dms: string } | null {
  if ('term' in promittor) {
    const termLong = promittor.term[1];
    const zodiacInfo = zodiacLong(termLong);
    const dms = degreeToDMS(zodiacInfo.long);
    let dmsStr: string;
    if (dms.m === 0 && dms.s === 0) {
      dmsStr = `${dms.d}°`;
    } else {
      dmsStr = `${dms.d}°${dms.m.toString().padStart(2, '0')}'${dms.s.toString().padStart(2, '0')}"`;
    }
    return {
      zodiac: config.zodiacFontString(zodiacInfo.zodiac),
      dms: dmsStr,
    };
  }
  return null;
}

export function getPromittorPlanet(promittor: Promittor): PlanetName | null {
  if ('conjunction' in promittor) return promittor.conjunction;
  if ('sinisterTrine' in promittor) return promittor.sinisterTrine;
  if ('dexterTrine' in promittor) return promittor.dexterTrine;
  if ('sinisterSextile' in promittor) return promittor.sinisterSextile;
  if ('dexterSextile' in promittor) return promittor.dexterSextile;
  if ('sinisterSquare' in promittor) return promittor.sinisterSquare;
  if ('dexterSquare' in promittor) return promittor.dexterSquare;
  if ('opposition' in promittor) return promittor.opposition;
  if ('term' in promittor) return promittor.term[0];
  if ('antiscoins' in promittor) return promittor.antiscoins;
  if ('contraantiscias' in promittor) return promittor.contraantiscias;
  return null;
}

export function getPromittorAspect(
  promittor: Promittor,
): { aspect: number; isLeft: boolean } | null {
  if ('conjunction' in promittor) return { aspect: 0, isLeft: true };
  if ('sinisterTrine' in promittor) return { aspect: 120, isLeft: true };
  if ('dexterTrine' in promittor) return { aspect: 120, isLeft: false };
  if ('sinisterSextile' in promittor) return { aspect: 60, isLeft: true };
  if ('dexterSextile' in promittor) return { aspect: 60, isLeft: false };
  if ('sinisterSquare' in promittor) return { aspect: 90, isLeft: true };
  if ('dexterSquare' in promittor) return { aspect: 90, isLeft: false };
  if ('opposition' in promittor) return { aspect: 180, isLeft: true };
  if ('antiscoins' in promittor) return { aspect: 0, isLeft: true };
  if ('contraantiscias' in promittor) return { aspect: 0, isLeft: true };
  return null;
}

export function getAntisciaInfo(promittor: Promittor): string | null {
  if ('antiscoins' in promittor) return 'Ant';
  if ('contraantiscias' in promittor) return 'C-Ant';
  return null;
}