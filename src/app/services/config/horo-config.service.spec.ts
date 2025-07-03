import { TestBed } from '@angular/core/testing';

import { Horoconfig } from './horo-config.service';
import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';

describe('HoroconfigService', () => {
  let service: Horoconfig;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [Horoconfig] });
    service = TestBed.inject(Horoconfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('西占行星列表', () => {
    let horoPlanets = [
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
    ];
    expect(service.horoPlanets).toEqual(horoPlanets);
  });

  it('占星字体', () => {
    expect(service.astrologyFont).toBeDefined();
  });

  it('普通文本字体', () => {
    expect(service.textFont).toBeDefined();
  });

  it('行星字体符号', () => {
    let planetStrings = [
      { planet: PlanetName.Sun, string: 'Q' },
      { planet: PlanetName.Moon, string: 'W' },
      { planet: PlanetName.Mercury, string: 'E' },
      { planet: PlanetName.Venus, string: 'R' },
      { planet: PlanetName.Mars, string: 'T' },
      { planet: PlanetName.Jupiter, string: 'Y' },
      { planet: PlanetName.Saturn, string: 'U' },
      { planet: PlanetName.NorthNode, string: '{' },
      { planet: PlanetName.SouthNode, string: '}' },
      // {planet: PlanetName.SE_MEAN_NODE, string: '{' },
      // {planet: -Planet.SE_MEAN_NODE, string: '}' },
      { planet: PlanetName.ASC, string: 'ASC' },
      { planet: PlanetName.MC, string: 'MC' },
      { planet: PlanetName.DSC, string: 'DSC' },
      { planet: PlanetName.IC, string: 'IC' },
    ];
    for (let planetString of planetStrings) {
      expect(service.planetFontString(planetString.planet)).toEqual(
        planetString.string
      );
    }
  });

  it('相位字体字符', () => {
    let aspects = [
      { aspect: 0, string: 'q' },
      { aspect: 60, string: 't' },
      { aspect: 90, string: 'r' },
      { aspect: 120, string: 'e' },
      { aspect: 180, string: 'w' },
    ];
    for (let aspect of aspects) {
      expect(service.aspectFontString(aspect.aspect)).toEqual(aspect.string);
    }
  });

  it('行星字体', () => {
    let angularHouseCups = [
      PlanetName.ASC,
      PlanetName.MC,
      PlanetName.DSC,
      PlanetName.IC,
    ];
    for (let cups of angularHouseCups) {
      expect(service.planetFontFamily(cups)).toEqual(service.textFont);
    }

    let planets = [
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

    for (let planet of planets) {
      expect(service.planetFontFamily(planet)).toEqual(service.astrologyFont);
    }
  });

  it('相位字体', () => {
    expect(service.aspectFontFamily()).toEqual(service.astrologyFont);
  });

  it('星座字体字符', () => {
    let zodiacStrings = [
      { zodiac: Zodiac.Aries, string: 'a' },
      { zodiac: Zodiac.Taurus, string: 's' },
      { zodiac: Zodiac.Gemini, string: 'd' },
      { zodiac: Zodiac.Cancer, string: 'f' },
      { zodiac: Zodiac.Leo, string: 'g' },
      { zodiac: Zodiac.Virgo, string: 'h' },
      { zodiac: Zodiac.Libra, string: 'j' },
      { zodiac: Zodiac.Scorpio, string: 'k' },
      { zodiac: Zodiac.Sagittarius, string: 'l' },
      { zodiac: Zodiac.Capricorn, string: 'z' },
      { zodiac: Zodiac.Aquarius, string: 'x' },
      { zodiac: Zodiac.Pisces, string: 'c' },
    ];
    for (let zodiacString of zodiacStrings) {
      expect(service.zodiacFontString(zodiacString.zodiac)).toEqual(
        zodiacString.string
      );
    }
  });

  it('星座字体', () => {
    expect(service.zodiacFontFamily()).toEqual(service.astrologyFont);
  });

  it('aspectImage 配置', () => {
    expect(service.aspectImage.width).toBe(700);
    expect(service.aspectImage.height).toBe(700);
  });

  it('HoroscoImage 配置', () => {
    expect(service.HoroscoImage.width).toBe(700);
    expect(service.HoroscoImage.height).toBe(700);
  });

  it('houses应初始化为空数组', () => {
    expect(service.houses).toBeInstanceOf(Array);
    expect(service.houses).toEqual([]);
  });
});
