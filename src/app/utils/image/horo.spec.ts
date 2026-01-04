import { HttpHeaders } from '@angular/common/http';
import { Horoconfig } from '../../services/config/horo-config.service';
import { PlanetName, PlanetSpeedState } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import { Aspect, Horoscope, Planet } from '../../type/interface/response-data';
import {
  calculateAspectGrid,
  calculateAspectText,
  calculateHouseElements,
  calculatePlanetElements,
  calculateNotesElements,
} from './horo';
import { Drawable, TextObject } from './horo';
import { createMockHoroscope, createMockPlanet, createMockAspect } from '../../test-utils/test-data-factory.spec';

// Mock Horoconfig
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
  HoroscoImage: { width: 700, height: 700 },
  houses: [],
  httpOptions: {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  },
};

describe('Horo Image Calculation Functions', () => {
  describe('calculateAspectGrid', () => {
    it('should generate correct number of grid lines', () => {
      const planets = mockHoroConfig.horoPlanets;
      const elements = calculateAspectGrid(planets, 280, 280);
      // For 4 planets, we expect a 5x5 grid, which means 5 horizontal + 5 vertical lines
      expect(elements.filter((e) => e.type === 'path').length).toBe(10);
    });

    it('should return an empty array when no planets are provided', () => {
      const elements = calculateAspectGrid([], 280, 280);
      expect(elements).toEqual([]);
    });
  });

  describe('calculateAspectText', () => {
    const aspects = [
      createMockAspect({
        p0: PlanetName.Sun,
        p1: PlanetName.Moon,
        aspect_value: 60,
        d: 1.2,
        apply: true,
      }),
      createMockAspect({
        p0: PlanetName.Mars,
        p1: PlanetName.Jupiter,
        aspect_value: 90,
        d: 0.5,
        apply: false,
      }),
    ];

    it('should generate planet names', () => {
      const elements = calculateAspectText(
        [],
        mockHoroConfig.horoPlanets,
        mockHoroConfig,
        280,
        280
      );
      // 4 planets drawn twice (row and column), and no aspects are passed in,
      // so the total number of elements should be 8.
      expect(elements.length).toBe(8);
      expect(elements.some((e: TextObject) => e.text === 'Q')).toBeTrue(); // Sun
    });

    it('should generate aspect symbols and values', () => {
      const elements = calculateAspectText(
        aspects,
        mockHoroConfig.horoPlanets,
        mockHoroConfig,
        280,
        280
      );
      expect(elements.some((e: TextObject) => e.text === 't')).toBeTrue(); // 60 deg
      expect(elements.some((e: TextObject) => e.text === 'r')).toBeTrue(); // 90 deg
      expect(elements.some((e: TextObject) => e.text === '1 A 12')).toBeTrue();
      expect(elements.some((e: TextObject) => e.text === '0 S 30')).toBeTrue();
    });
  });

  describe('Horoscope Chart Calculations', () => {
    const mockPlanet = createMockPlanet({
      name: PlanetName.Sun,
      long: 15,
      speed: 1,
      speed_state: PlanetSpeedState.快,
    });
    const mockHoroscope = createMockHoroscope({
      houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      planets: [mockPlanet],
      asc: createMockPlanet({ name: PlanetName.ASC, long: 0 }),
      mc: createMockPlanet({ name: PlanetName.MC, long: 270 }),
      dsc: createMockPlanet({ name: PlanetName.DSC, long: 180 }),
      ic: createMockPlanet({ name: PlanetName.IC, long: 90 }),
      part_of_fortune: createMockPlanet({ name: PlanetName.PartOfFortune, long: 25 }),
      date: {
        year: 2024,
        month: 7,
        day: 9,
        hour: 12,
        minute: 0,
        second: 0,
        tz: 8,
      },
      geo: { long: 120, lat: 30 },
      house_name: 'Placidus',
      is_diurnal: true,
      planetary_day: PlanetName.Sun,
      planetary_hours: PlanetName.Moon,
      aspects: [],
      antiscoins: [],
      contraantiscias: [],
      fixed_stars: [],
    });

    describe('calculateHouseElements', () => {
      it('should generate circles, cusp lines, house numbers, and zodiac signs', () => {
        const elements = calculateHouseElements(
          mockHoroscope.houses_cups,
          mockHoroConfig,
          { cx: 150, cy: 150, r0: 150, r1: 100 }
        );
        expect(
          elements.filter((e: Drawable) => e.type === 'circle').length
        ).toBe(2);
        expect(elements.filter((e: Drawable) => e.type === 'path').length).toBe(
          12
        );
        const textElements = elements.filter(
          (e): e is TextObject => e.type === 'text'
        );
        expect(
          textElements.filter(
            (e) =>
              !isNaN(parseInt(e.text)) &&
              e.fontFamily === mockHoroConfig.textFont
          ).length
        ).toBe(12); // House numbers
        expect(
          textElements.filter(
            (e) => e.text.length === 1 && e.fontFamily === 'HamburgSymbols'
          ).length
        ).toBeGreaterThanOrEqual(12); // Zodiac signs
      });
    });

    describe('calculatePlanetElements', () => {
      it('should generate planet symbols, positions, and indicator lines', () => {
        const planets = [
          ...mockHoroscope.planets,
          mockHoroscope.asc,
          mockHoroscope.mc,
          mockHoroscope.dsc,
          mockHoroscope.ic,
        ];
        const elements = calculatePlanetElements(
          planets,
          mockHoroscope.houses_cups[0],
          mockHoroConfig,
          { cx: 150, cy: 150, r: 100 }
        );
        const planetCount = planets.length;
        // Each planet has: 1 symbol, 1 degree, 1 sign, 1 minute, 1 indicator line (+1 for retrograde sometimes)
        expect(
          elements.filter((e: Drawable) => e.type === 'text').length
        ).toBeGreaterThanOrEqual(planetCount * 4);
        expect(elements.filter((e: Drawable) => e.type === 'path').length).toBe(
          planetCount
        );
      });

      it('should add a retrograde symbol for planets with negative speed', () => {
        const retrogradePlanet: Planet = {
          ...mockPlanet,
          name: PlanetName.Mars,
          speed: -1,
        };
        const planets = [
          retrogradePlanet,
          mockHoroscope.asc,
          mockHoroscope.mc,
          mockHoroscope.dsc,
          mockHoroscope.ic,
        ];
        const elements = calculatePlanetElements(
          planets,
          mockHoroscope.houses_cups[0],
          mockHoroConfig,
          { cx: 150, cy: 150, r: 100 }
        );
        const retrogradeSymbol = elements.find(
          (e): e is TextObject => e.type === 'text' && e.text === '>'
        );
        expect(retrogradeSymbol).toBeDefined();
      });
    });

    describe('calculateNotesElements', () => {
      it('should generate notes with correct text and alignment', () => {
        const elements = calculateNotesElements(mockHoroscope, mockHoroConfig);
        expect(elements.length).toBe(6); // house_name, diurnal, day lord label, day lord symbol, hour lord label, hour lord symbol
        expect(elements[0].text).toBe('Placidus');
        expect(elements[1].text).toBe('白天盘');
        expect(elements[2].text).toBe('日主星:');
        expect(elements[3].text).toBe('Q');
        expect(elements[4].text).toBe('时主星:');
        expect(elements[5].text).toBe('W');
        elements.forEach((e) => expect(e.textAlign).toBe('left'));
      });

      it('should generate correct notes for a nocturnal chart', () => {
        const nocturnalHoroscope = { ...mockHoroscope, is_diurnal: false };
        const elements = calculateNotesElements(
          nocturnalHoroscope,
          mockHoroConfig
        );
        expect(elements.some((e) => e.text === '夜间盘')).toBeTrue();
      });
    });
  });
});
