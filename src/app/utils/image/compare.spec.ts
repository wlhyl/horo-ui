import { HttpHeaders } from '@angular/common/http';
import { Horoconfig } from '../../services/config/horo-config.service';
import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import {
  HoroscopeComparison,
  Planet,
} from '../../type/interface/response-data';
import {
  calculateAspectGrid,
  calculateAspectText,
  calculateHouseElements,
  calculatePlanets,
} from './compare';
import { Drawable, TextObject } from './horo';
import {
  createMockHoroscopeComparison,
  createMockPlanet,
} from '../../test-utils/test-data-factory.spec';

// Mock Horoconfig from horo.spec.ts
const mockHoroConfig: Horoconfig = {
  horoPlanets: [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Jupiter,
  ],
  planetFontString: (planet: PlanetName) => {
    const map = new Map([
      [PlanetName.Sun, 'Q'],
      [PlanetName.Moon, 'W'],
      [PlanetName.Mars, 'T'],
      [PlanetName.Jupiter, 'Y'],
      [PlanetName.ASC, 'ASC'],
      [PlanetName.MC, 'MC'],
      [PlanetName.DSC, 'DSC'],
      [PlanetName.IC, 'IC'],
    ]);
    return map.get(planet) || planet.toString();
  },
  planetFontFamily: (planet: PlanetName) =>
    [PlanetName.ASC, PlanetName.MC, PlanetName.DSC, PlanetName.IC].includes(
      planet
    )
      ? 'Verdana'
      : 'HamburgSymbols',
  aspectFontFamily: () => 'HamburgSymbols',
  zodiacFontString: (zodiac: Zodiac) => {
    const map = new Map([
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
    return map.get(zodiac) || zodiac.toString();
  },
  zodiacFontFamily: () => 'HamburgSymbols',
  textFont: 'Verdana',
  astrologyFont: 'HamburgSymbols',
  aspectFontString: (aspectValue: number) => {
    const map: { [key: number]: string } = {
      0: 'q',
      60: 't',
      90: 'r',
      120: 'e',
      180: 'w',
    };
    return map[aspectValue] || '';
  },
  aspectImage: { width: 700, height: 700 },
  horoscoImage: { width: 700, height: 700 },
  synastryAspectImage: { width: 700 * 1.3, height: 700 * 1.3 },
  synastryHoroscoImage: { width: 700 * 1.3, height: 700 * 1.3 },
  houses: [],
  httpOptions: {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  },
};

const mockComparisonData: HoroscopeComparison = createMockHoroscopeComparison({
  original_date: {
    year: 2024,
    month: 7,
    day: 11,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
  },
  comparison_date: {
    year: 2024,
    month: 7,
    day: 11,
    hour: 13,
    minute: 0,
    second: 0,
    tz: 8,
  },
  original_asc: createMockPlanet({ name: PlanetName.ASC, long: 0 }),
  comparison_asc: createMockPlanet({ name: PlanetName.ASC, long: 15 }),
  original_mc: createMockPlanet({ name: PlanetName.MC, long: 270 }),
  comparison_mc: createMockPlanet({ name: PlanetName.MC, long: 285 }),
  original_dsc: createMockPlanet({ name: PlanetName.DSC, long: 180 }),
  comparison_dsc: createMockPlanet({ name: PlanetName.DSC, long: 195 }),
  original_ic: createMockPlanet({ name: PlanetName.IC, long: 90 }),
  comparison_ic: createMockPlanet({ name: PlanetName.IC, long: 105 }),
  original_planets: [createMockPlanet({ name: PlanetName.Sun, long: 15 })],
  comparison_planets: [createMockPlanet({ name: PlanetName.Mars, long: 45 })],
  original_part_of_fortune: createMockPlanet({
    name: PlanetName.PartOfFortune,
    long: 25,
  }),
  comparison_part_of_fortune: createMockPlanet({
    name: PlanetName.PartOfFortune,
    long: 35,
  }),
  aspects: [
    {
      p0: PlanetName.Sun,
      p1: PlanetName.Mars,
      aspect_value: 60,
      d: 1.0,
      apply: true,
    },
  ],
});

describe('Compare Image Calculation Functions', () => {
  describe('calculateAspectGrid', () => {
    it('should generate correct number of grid lines for comparison chart', () => {
      const planets = mockHoroConfig.horoPlanets;
      const elements = calculateAspectGrid(planets, 280, 280);
      // 4 planets -> 5x5 grid -> 5 horizontal + 5 vertical lines
      expect(elements.length).toBe(10);
    });
    it('should return default grid when planets is empty', () => {
      const elements = calculateAspectGrid([], 280, 280);
      // 实现返回2条线（默认），断言为2
      expect(elements.length).toBe(2);
    });
  });

  describe('calculateAspectText', () => {
    it('should generate text for planets and aspects', () => {
      const elements = calculateAspectText(
        mockComparisonData.aspects,
        mockHoroConfig.horoPlanets,
        mockHoroConfig,
        280,
        280
      );
      // 4 planets twice (8) + 1 aspect symbol (1) + 1 aspect value (1) = 10
      expect(elements.length).toBe(10);
      expect(elements.filter((e: TextObject) => e.text === 'Q').length).toBe(2); // Sun
      expect(elements.filter((e: TextObject) => e.text === 'T').length).toBe(2); // Mars
      expect(elements.filter((e: TextObject) => e.text === 't').length).toBe(1); // 60 deg aspect
      expect(
        elements.filter((e: TextObject) => e.text === '1 A 0').length
      ).toBe(1); // Aspect value
    });

    it('should return empty array when aspects and planets are empty', () => {
      const elements = calculateAspectText([], [], mockHoroConfig, 280, 280);
      expect(elements.length).toBe(0);
    });
  });

  describe('calculateHouseElements', () => {
    it('should generate basic house structure elements', () => {
      const elements = calculateHouseElements(
        mockComparisonData.houses_cups,
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 100 }
      );
      expect(elements.filter((e: Drawable) => e.type === 'circle').length).toBe(
        2
      );
      expect(elements.filter((e: Drawable) => e.type === 'path').length).toBe(
        12
      );
      const textElements = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );
      // 12 house numbers + 12 zodiac signs + 12 degree numbers + 12 minute numbers
      expect(textElements.length).toBe(48);
    });
    it('should return default circles when houses_cups is empty', () => {
      const elements = calculateHouseElements([], mockHoroConfig, {
        cx: 150,
        cy: 150,
        r0: 150,
        r1: 100,
      });
      // 实现返回2个circle（默认），断言为2
      expect(elements.length).toBe(2);
    });
  });

  describe('calculatePlanets', () => {
    it('should generate elements for both native and transit planets', () => {
      const elements = calculatePlanets(
        mockComparisonData.original_planets,
        mockComparisonData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r: 100 },
        true // isNative
      );
      // 1 native planet: 1 symbol, 1 degree, 1 sign, 1 minute, 1 line
      expect(elements.filter((e: Drawable) => e.type === 'text').length).toBe(
        4
      );
      expect(elements.filter((e: Drawable) => e.type === 'path').length).toBe(
        1
      );

      const transitElements = calculatePlanets(
        mockComparisonData.comparison_planets,
        mockComparisonData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r: 120 },
        false // isNative = false
      );
      // 1 transit planet
      expect(
        transitElements.filter((e: Drawable) => e.type === 'text').length
      ).toBe(4);
      expect(
        transitElements.filter((e: Drawable) => e.type === 'path').length
      ).toBe(1);
    });
    it('should return empty array when planets is empty', () => {
      const elements = calculatePlanets(
        [],
        0,
        mockHoroConfig,
        { cx: 150, cy: 150, r: 100 },
        true
      );
      expect(elements.length).toBe(0);
    });

    describe('retrograde planets', () => {
      const createTestElements = (planets: Planet[]) => {
        return calculatePlanets(
          planets,
          mockComparisonData.houses_cups[0],
          mockHoroConfig,
          { cx: 150, cy: 150, r: 100 },
          true
        );
      };

      it('should add retrograde symbols when speed < 0', () => {
        const elements = createTestElements([
          createMockPlanet({ name: PlanetName.Sun, speed: -1 }),
          createMockPlanet({ name: PlanetName.Mars, speed: -0.5 }),
        ]);

        const retroSymbols = elements
          .filter((e): e is TextObject => e.type === 'text')
          .filter((e) => e.text === '>');

        expect(retroSymbols.length).toBe(2);
      });

      it('should not add symbols when speed >= 0', () => {
        const elements = createTestElements([
          createMockPlanet({ name: PlanetName.Sun, speed: 1 }),
          createMockPlanet({ name: PlanetName.Mars, speed: 0 }),
        ]);

        const hasRetroSymbol = elements
          .filter((e): e is TextObject => e.type === 'text')
          .some((e) => e.text === '>');

        expect(hasRetroSymbol).toBe(false);
      });
    });
  });
});
