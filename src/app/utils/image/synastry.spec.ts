import { Horoconfig } from '../../services/config/horo-config.service';
import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import { HoroscopeComparison } from '../../type/interface/response-data';
import { calculateHouseElements, drawHorosco } from './synastry';
import { Drawable, TextObject } from './horo';
import {
  createMockHoroscopeComparison,
  createMockPlanet,
} from '../../test-utils/test-data-factory.spec';

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
    headers: { 'Content-Type': 'application/json' } as any,
  },
};

const mockSynastryData: HoroscopeComparison = createMockHoroscopeComparison({
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
  aspects: [],
});

describe('Synastry Image Calculation Functions', () => {
  describe('calculateOrginalHouseElements', () => {
    it('should generate correct number of elements for original house chart', () => {
      const elements = calculateHouseElements(
        mockSynastryData.houses_cups,
        mockSynastryData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 0 },
        true
      );

      const circles = elements.filter((e: Drawable) => e.type === 'circle');
      const paths = elements.filter((e: Drawable) => e.type === 'path');
      const texts = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );

      expect(circles.length).toBe(2);
      expect(paths.length).toBe(12);
      expect(texts.length).toBe(48);
    });

    it('should generate correct number of elements for comparison house chart', () => {
      const elements = calculateHouseElements(
        mockSynastryData.comparison_cups,
        mockSynastryData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 75 },
        false
      );

      const circles = elements.filter((e: Drawable) => e.type === 'circle');
      const paths = elements.filter((e: Drawable) => e.type === 'path');
      const texts = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );

      expect(circles.length).toBe(3);
      expect(paths.length).toBe(12);
      expect(texts.length).toBe(48);
    });

    it('should generate zodiac signs on cusps for original chart', () => {
      const elements = calculateHouseElements(
        mockSynastryData.houses_cups,
        mockSynastryData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 0 },
        true
      );

      const texts = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );

      const zodiacTexts = texts.filter((e) => {
        const zodiacChars = [
          'a',
          's',
          'd',
          'f',
          'g',
          'h',
          'j',
          'k',
          'l',
          'z',
          'x',
          'c',
        ];
        return zodiacChars.includes(e.text);
      });

      expect(zodiacTexts.length).toBe(12);
    });

    it('should generate house numbers for original chart', () => {
      const elements = calculateHouseElements(
        mockSynastryData.houses_cups,
        mockSynastryData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 0 },
        true
      );

      const texts = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );

      const houseNumbers = texts.filter((e) => {
        return [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
        ].includes(e.text);
      });

      expect(houseNumbers.length).toBe(12);
    });

    it('should generate zodiac signs on cusps for comparison chart', () => {
      const elements = calculateHouseElements(
        mockSynastryData.comparison_cups,
        mockSynastryData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 75 },
        false
      );

      const texts = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );

      const zodiacTexts = texts.filter((e) => {
        const zodiacChars = [
          'a',
          's',
          'd',
          'f',
          'g',
          'h',
          'j',
          'k',
          'l',
          'z',
          'x',
          'c',
        ];
        return zodiacChars.includes(e.text);
      });

      expect(zodiacTexts.length).toBe(12);
    });

    it('should generate house numbers for comparison chart', () => {
      const elements = calculateHouseElements(
        mockSynastryData.comparison_cups,
        mockSynastryData.houses_cups[0],
        mockHoroConfig,
        { cx: 150, cy: 150, r0: 150, r1: 75 },
        false
      );

      const texts = elements.filter(
        (e: Drawable): e is TextObject => e.type === 'text'
      );

      const houseNumbers = texts.filter((e) => {
        return [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
        ].includes(e.text);
      });

      expect(houseNumbers.length).toBe(12);
    });
  });
});
