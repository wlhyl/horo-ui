import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';

@Injectable({
  providedIn: 'root',
})
export class Horoconfig {
  /**
   * 西占行星列表
   */
  // 必需依此顺序排序，因为绘制相位图时，会依此顺序
  public readonly horoPlanets = [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mercury,
    PlanetName.Venus,
    PlanetName.Mars,
    PlanetName.Jupiter,
    PlanetName.Saturn,
    PlanetName.NorthNode,
    PlanetName.SouthNode,
    PlanetName.ASC,
    PlanetName.MC,
    PlanetName.DSC,
    PlanetName.IC,
    PlanetName.PartOfFortune,
  ];

  /**
   * 占星字体
   */
  public readonly astrologyFont = 'HamburgSymbols';
  /**
   * 普通文本字体
   */
  public readonly textFont = 'Verdana';

  /**
   * 行星的可输出字符串
   * @param planet 行星的名称
   * @returns 返回行星的可输出字符串
   */
  public planetFontString(planet: PlanetName): string {
    let planetString = new Map([
      [PlanetName.Sun, 'Q'],
      [PlanetName.Moon, 'W'],
      [PlanetName.Mercury, 'E'],
      [PlanetName.Venus, 'R'],
      [PlanetName.Mars, 'T'],
      [PlanetName.Jupiter, 'Y'],
      [PlanetName.Saturn, 'U'],
      [PlanetName.NorthNode, '{'],
      [PlanetName.SouthNode, '}'],
      [PlanetName.ASC, 'ASC'],
      [PlanetName.MC, 'MC'],
      [PlanetName.DSC, 'DSC'],
      [PlanetName.IC, 'IC'],
      [PlanetName.PartOfFortune, '<'],
    ]);
    if (planetString.has(planet)) {
      return planetString.get(planet) as string;
    } else {
      return planet.toString();
    }
  }

  /**
   * 相位的可输出字符串
   * @param aspect 相位值
   * @returns 相位的可输出字符串
   */
  public aspectFontString(aspect: number): string {
    switch (aspect) {
      case 0:
        return 'q';
      case 60:
        return 't';
      case 90:
        return 'r';
      case 120:
        return 'e';
      case 180:
        return 'w';
      default:
        return '';
    }
  }

  /**
   * 行星的可输出字体
   * @param planet 行星的id
   * @returns  返回输星的输出字体
   */
  public planetFontFamily(planet: PlanetName): string {
    if (
      [PlanetName.ASC, PlanetName.MC, PlanetName.DSC, PlanetName.IC].includes(
        planet
      )
    ) {
      return this.textFont;
    } else {
      return this.astrologyFont;
    }
  }

  /**
   * 相位字体
   * @returns 相位字体
   */
  public aspectFontFamily(): string {
    return this.astrologyFont;
  }

  /**
   * 星座的可输出字符串
   * @param zodiac 12星座名
   * @returns 星座的可打印字符
   */
  public zodiacFontString(zodiac: Zodiac): string {
    let zodiacString = new Map([
      [Zodiac.Aries, 'a'],
      [Zodiac.Taurus, 's'],
      [Zodiac.Gemini, 'd'],
      [Zodiac.Cancer, 'f'],
      [Zodiac.Leo, 'g'],
      [Zodiac.Virgo, 'h'],
      [Zodiac.Libra, 'j'],
      [Zodiac.Scorpio, 'k'],
      [Zodiac.Sagittarius, 'l'],
      [Zodiac.Capricorn, 'z'],
      [Zodiac.Aquarius, 'x'],
      [Zodiac.Pisces, 'c'],
    ]);
    if (zodiacString.has(zodiac)) return zodiacString.get(zodiac) as string;
    return zodiac.toString();
  }

  /**
   * 星座的可打印字体
   * @returns 星座的可打印字体
   */
  public zodiacFontFamily(): string {
    return this.astrologyFont;
  }

  // 初始宽、高，绘制完成后会根据屏幕大小缩放
  readonly aspectImage = { width: 700, height: 700 };
  readonly HoroscoImage = { width: 700, height: 700 };

  // 支持的宫位系统，应用启动时会通过http获取
  public houses: Array<string> = [];

  public readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor() {}
}
