import {
  calculateMutualReceptions,
  calculateReceptions,
  DignityKind,
  getDignitiesOf,
  Reception,
} from './reception';
import { TRADITIONAL_PLANETS } from '../image/zodiac';
import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import {
  createMockAspect,
  createMockHoroscope,
  createMockPlanet,
} from '../../test-utils/test-data-factory.spec';
import { Horoscope } from '../../type/interface/response-data';

describe('reception', () => {
  describe('getDignitiesOf', () => {
    it('should detect exaltation and triplicity for Sun at Aries 0°', () => {
      // 白羊 0°：旺=日，三分(Lily)=[日,木]
      const result = getDignitiesOf(PlanetName.Sun, Zodiac.Aries, 0);
      expect(result).toContain(DignityKind.Exaltation);
      expect(result).toContain(DignityKind.Triplicity);
      expect(result).not.toContain(DignityKind.Rulership);
      expect(result).not.toContain(DignityKind.Term);
      expect(result).not.toContain(DignityKind.Face);
    });

    it('should detect rulership for Moon at Cancer 0°', () => {
      // 巨蟹 0°：庙=月
      const result = getDignitiesOf(PlanetName.Moon, Zodiac.Cancer, 0);
      expect(result).toEqual([DignityKind.Rulership]);
    });

    it('should detect rulership and triplicity for Sun at Leo 0°', () => {
      // 狮子 0°：庙=日，三分(Lily)=[日,木]
      const result = getDignitiesOf(PlanetName.Sun, Zodiac.Leo, 0);
      expect(result).toContain(DignityKind.Rulership);
      expect(result).toContain(DignityKind.Triplicity);
    });

    it('should return empty when planet has no dignity at position', () => {
      // 月亮对白羊 0° 无任何尊贵
      const result = getDignitiesOf(PlanetName.Moon, Zodiac.Aries, 0);
      expect(result).toEqual([]);
    });
  });

  describe('calculateReceptions', () => {
    it('should return empty when there are no aspects', () => {
      const horo = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 0 }),
          createMockPlanet({ name: PlanetName.Moon, long: 120 }),
        ],
        aspects: [],
      });

      expect(calculateReceptions(horo)).toEqual([]);
    });

    it('should find one-directional reception: Sun receives Moon (Sun in Aries, Moon in Leo)', () => {
      // 日在白羊 0°(long=0)，月在狮子 0°(long=120)
      // 日对狮子 0°：庙+三分；月对白羊 0°：无 → 仅日接纳月
      const horo = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 0 }),
          createMockPlanet({ name: PlanetName.Moon, long: 120 }),
        ],
        aspects: [
          createMockAspect({
            aspect_value: 0,
            p0: PlanetName.Sun,
            p1: PlanetName.Moon,
          }),
        ],
      });

      const receptions = calculateReceptions(horo);
      expect(receptions.length).toBe(1);
      const r = receptions[0];
      expect(r.receiver).toBe(PlanetName.Sun);
      expect(r.received).toBe(PlanetName.Moon);
      expect(r.dignities).toContain(DignityKind.Rulership);
      expect(r.dignities).toContain(DignityKind.Triplicity);
    });

    it('should produce two receptions when both planets receive each other', () => {
      // 日在巨蟹 0°(long=90)，月在狮子 0°(long=120)
      // 日对狮子：庙+三分；月对巨蟹：庙 → 双向接纳
      const horo = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 90 }),
          createMockPlanet({ name: PlanetName.Moon, long: 120 }),
        ],
        aspects: [
          createMockAspect({
            aspect_value: 0,
            p0: PlanetName.Sun,
            p1: PlanetName.Moon,
          }),
        ],
      });

      const receptions = calculateReceptions(horo);
      expect(receptions.length).toBe(2);
      const pairs = receptions.map((r) => `${r.receiver}>${r.received}`).sort();
      expect(pairs).toEqual(['Moon>Sun', 'Sun>Moon']);
    });

    it('should treat ASC as a receivable body', () => {
      // 日在白羊 0°(long=0)，ASC 在狮子 0°(long=120)
      // 日对狮子 0°：庙+三分 → 日接纳 ASC
      const horo = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 120 }),
        planets: [createMockPlanet({ name: PlanetName.Sun, long: 0 })],
        aspects: [
          createMockAspect({
            aspect_value: 0,
            p0: PlanetName.Sun,
            p1: PlanetName.ASC,
          }),
        ],
      });

      const receptions = calculateReceptions(horo);
      expect(receptions.length).toBe(1);
      expect(receptions[0].receiver).toBe(PlanetName.Sun);
      expect(receptions[0].received).toBe(PlanetName.ASC);
    });

    it('should never let a non-traditional body be the receiver', () => {
      // ASC 在狮子 0°(long=120)，日 在白羊 0°(long=0)，相位 {ASC, Sun}
      // 双向都会尝试：ASC 接纳 Sun（ASC 非传统 → 跳过）；Sun 接纳 ASC（日对狮子有庙+三分）
      // 结果应只有 1 条：Sun 接纳 ASC，绝不会出现 ASC 接纳 Sun
      const horo = createMockHoroscope({
        asc: createMockPlanet({ name: PlanetName.ASC, long: 120 }),
        planets: [createMockPlanet({ name: PlanetName.Sun, long: 0 })],
        aspects: [
          createMockAspect({
            aspect_value: 0,
            p0: PlanetName.ASC,
            p1: PlanetName.Sun,
          }),
        ],
      });

      const receptions = calculateReceptions(horo);
      expect(receptions.length).toBe(1);
      expect(receptions[0].receiver).toBe(PlanetName.Sun);
      expect(receptions[0].received).toBe(PlanetName.ASC);
      expect(
        receptions.every((r) => r.receiver !== PlanetName.ASC),
      ).toBeTrue();
    });
  });

  describe('calculateMutualReceptions', () => {
    it('should find Sun-Moon mutual reception (Sun in Cancer, Moon in Leo)', () => {
      // 日在巨蟹 0°(long=90)，月在狮子 0°(long=120)
      // 日对狮子：庙+三分；月对巨蟹：庙 → 互融
      const horo = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 90 }),
          createMockPlanet({ name: PlanetName.Moon, long: 120 }),
        ],
        aspects: [],
      });

      const mutual = calculateMutualReceptions(horo);
      expect(mutual.length).toBe(1);
      const m = mutual[0];
      expect(m.a).toBe(PlanetName.Sun);
      expect(m.b).toBe(PlanetName.Moon);
      expect(m.aDignities).toContain(DignityKind.Rulership);
      expect(m.aDignities).toContain(DignityKind.Triplicity);
      expect(m.bDignities).toEqual([DignityKind.Rulership]);
    });

    it('should not report mutual reception when only one direction has dignity', () => {
      // 日在白羊 0°(long=0)，月在狮子 0°(long=120)
      // 日对狮子：庙+三分；月对白羊：无 → 非互融
      const horo = createMockHoroscope({
        planets: [
          createMockPlanet({ name: PlanetName.Sun, long: 0 }),
          createMockPlanet({ name: PlanetName.Moon, long: 120 }),
        ],
      });

      const mutual = calculateMutualReceptions(horo);
      const hasSunMoon = mutual.some(
        (m) =>
          (m.a === PlanetName.Sun && m.b === PlanetName.Moon) ||
          (m.a === PlanetName.Moon && m.b === PlanetName.Sun),
      );
      expect(hasSunMoon).toBeFalse();
    });

    it('should skip missing planets', () => {
      // 只有太阳，无月亮
      const horo = createMockHoroscope({
        planets: [createMockPlanet({ name: PlanetName.Sun, long: 90 })],
      });

      const mutual = calculateMutualReceptions(horo);
      // 单颗行星无配对
      expect(mutual.length).toBe(0);
    });
  });

  describe('coverage of traditional planets', () => {
    it('TRADITIONAL_PLANETS should contain the seven classical planets', () => {
      expect(TRADITIONAL_PLANETS).toEqual([
        PlanetName.Sun,
        PlanetName.Moon,
        PlanetName.Mercury,
        PlanetName.Venus,
        PlanetName.Mars,
        PlanetName.Jupiter,
        PlanetName.Saturn,
      ]);
    });
  });

  // 静态类型校验：Reception.aspect 可直接读取
  it('Reception type allows reading aspect fields', () => {
    const horo: Horoscope = createMockHoroscope({
      planets: [
        createMockPlanet({ name: PlanetName.Sun, long: 0 }),
        createMockPlanet({ name: PlanetName.Moon, long: 120 }),
      ],
      aspects: [
        createMockAspect({
          aspect_value: 0,
          p0: PlanetName.Sun,
          p1: PlanetName.Moon,
        }),
      ],
    });

    const receptions: Reception[] = calculateReceptions(horo);
    if (receptions.length > 0) {
      const _value: number = receptions[0].aspect.aspect_value;
      expect(typeof _value).toBe('number');
    }
  });
});
