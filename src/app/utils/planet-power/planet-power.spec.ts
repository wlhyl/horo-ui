import { PlanetName, PlanetSpeedState } from '../../type/enum/planet';
import { Aspect, Horoscope, Planet } from '../../type/interface/response-data';
import { Zodiac } from '../../type/enum/zodiac';
import {
  createMockAspect,
  createMockHoroscope,
  createMockPlanet,
} from '../../test-utils/test-data-factory.spec';
import {
  CAZIMI_THRESHOLD,
  COMBUST_THRESHOLD,
  DIGNITY_SCORES,
  SUNBEAMS_THRESHOLD,
  calculateAllPlanetDignities,
  calculateAllPlanetPowers,
  calculatePlanetDignity,
  findChartAlmuten,
  PlanetPower,
} from './planet-power';
import { getPlanetHouse } from './house-placement';

function makePlanet(
  name: PlanetName,
  long: number,
  opts?: { speed?: number; speed_state?: PlanetSpeedState },
): Planet {
  return {
    name,
    long,
    lat: 0,
    speed: opts?.speed ?? 1,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: opts?.speed_state ?? PlanetSpeedState.均,
  };
}

function makeHoro(opts: {
  sun?: number;
  moon?: number;
  asc?: number;
  cusps?: number[];
  planets?: Planet[];
  aspects?: Aspect[];
}): Horoscope {
  const sun = makePlanet(PlanetName.Sun, opts.sun ?? 0);
  const moon = makePlanet(PlanetName.Moon, opts.moon ?? 180);
  return createMockHoroscope({
    asc: createMockPlanet({ name: PlanetName.ASC, long: opts.asc ?? 0 }),
    cusps:
      opts.cusps ?? [
        opts.asc ?? 0,
        (opts.asc ?? 0) + 30,
        60,
        90,
        120,
        150,
        180,
        210,
        240,
        270,
        300,
        330,
      ],
    planets: [sun, moon, ...(opts.planets ?? [])],
    aspects: opts.aspects ?? [],
  });
}

function findPower(
  powers: PlanetPower[],
  name: PlanetName,
): PlanetPower | undefined {
  return powers.find((p) => p.planet.name === name);
}

describe('planet-power', () => {
  describe('常量', () => {
    it('分值常量应符合既定规则', () => {
      expect(DIGNITY_SCORES.rulership).toBe(5);
      expect(DIGNITY_SCORES.exaltation).toBe(4);
      expect(DIGNITY_SCORES.triplicity).toBe(3);
      expect(DIGNITY_SCORES.term).toBe(2);
      expect(DIGNITY_SCORES.face).toBe(1);
      expect(DIGNITY_SCORES.fall).toBe(-4);
      expect(DIGNITY_SCORES.detriment).toBe(-5);
    });

    it('日光条件阈值应使用经典数值', () => {
      expect(CAZIMI_THRESHOLD).toBeCloseTo(17 / 60, 5);
      expect(COMBUST_THRESHOLD).toBe(8.5);
      expect(SUNBEAMS_THRESHOLD).toBe(17);
    });
  });

  describe('calculatePlanetDignity', () => {
    describe('基本尊贵力量', () => {
      it('太阳在白羊座0°：旺+三分(Lily)，分数=7', () => {
        const sun = makePlanet(PlanetName.Sun, 0);
        const d = calculatePlanetDignity(sun);
        expect(d.zodiac).toBe(Zodiac.Aries);
        expect(d.zodiacDegree).toBeCloseTo(0, 5);
        expect(d.rulership).toBe(false);
        expect(d.exaltation).toBe(true);
        expect(d.triplicity).toBe(true);
        expect(d.term).toBe(false);
        expect(d.face).toBe(false);
        expect(d.fall).toBe(false);
        expect(d.detriment).toBe(false);
        expect(d.score).toBe(7);
      });

      it('月亮在巨蟹座0°：庙，分数=5', () => {
        const moon = makePlanet(PlanetName.Moon, 90);
        const d = calculatePlanetDignity(moon);
        expect(d.zodiac).toBe(Zodiac.Cancer);
        expect(d.rulership).toBe(true);
        expect(d.exaltation).toBe(false);
        expect(d.triplicity).toBe(false);
        expect(d.score).toBe(5);
      });

      it('水星在处女座0°：庙+旺+界，分数=11', () => {
        const mercury = makePlanet(PlanetName.Mercury, 150);
        const d = calculatePlanetDignity(mercury);
        expect(d.zodiac).toBe(Zodiac.Virgo);
        expect(d.rulership).toBe(true);
        expect(d.exaltation).toBe(true);
        expect(d.term).toBe(true);
        expect(d.face).toBe(false);
        expect(d.fall).toBe(false);
        expect(d.detriment).toBe(false);
        expect(d.score).toBe(5 + 4 + 2);
      });

      it('土星在白羊座0°：陷(Fall)，分数=-4', () => {
        const saturn = makePlanet(PlanetName.Saturn, 0);
        const d = calculatePlanetDignity(saturn);
        expect(d.fall).toBe(true);
        expect(d.detriment).toBe(false);
        expect(d.score).toBe(-4);
      });

      it('金星在白羊座0°：弱(Detriment)，分数=-5', () => {
        const venus = makePlanet(PlanetName.Venus, 0);
        const d = calculatePlanetDignity(venus);
        expect(d.fall).toBe(false);
        expect(d.detriment).toBe(true);
        expect(d.score).toBe(-5);
      });
    });

    describe('界判定', () => {
      it('白羊座0°-6°属于木星界', () => {
        const jupiter = makePlanet(PlanetName.Jupiter, 0);
        const d = calculatePlanetDignity(jupiter);
        expect(d.term).toBe(true);
      });

      it('白羊座6°-14°属于金星界', () => {
        const venus = makePlanet(PlanetName.Venus, 10);
        const d = calculatePlanetDignity(venus);
        expect(d.term).toBe(true);
      });

      it('白羊座30°(金牛座0°)不属于白羊座任何界', () => {
        const jupiter = makePlanet(PlanetName.Jupiter, 30);
        const d = calculatePlanetDignity(jupiter);
        expect(d.zodiac).toBe(Zodiac.Taurus);
        expect(d.term).toBe(false);
      });
    });

    describe('面判定', () => {
      it('白羊座0°-10°属于火星面', () => {
        const mars = makePlanet(PlanetName.Mars, 5);
        const d = calculatePlanetDignity(mars);
        expect(d.face).toBe(true);
      });

      it('白羊座10°-20°属于太阳面', () => {
        const sun = makePlanet(PlanetName.Sun, 15);
        const d = calculatePlanetDignity(sun);
        expect(d.face).toBe(true);
      });

      it('白羊座20°-30°属于金星面', () => {
        const venus = makePlanet(PlanetName.Venus, 25);
        const d = calculatePlanetDignity(venus);
        expect(d.face).toBe(true);
      });
    });

  });

  describe('calculateAllPlanetDignities', () => {
    it('应过滤出7颗传统行星，剔除南北交点', () => {
      const planets = [
        makePlanet(PlanetName.Sun, 0),
        makePlanet(PlanetName.Moon, 30),
        makePlanet(PlanetName.Mercury, 60),
        makePlanet(PlanetName.Venus, 90),
        makePlanet(PlanetName.Mars, 120),
        makePlanet(PlanetName.Jupiter, 150),
        makePlanet(PlanetName.Saturn, 180),
        makePlanet(PlanetName.NorthNode, 210),
        makePlanet(PlanetName.SouthNode, 240),
      ];
      const result = calculateAllPlanetDignities(planets);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(7);
        expect(result.value.map((d) => d.planet.name)).toEqual([
          PlanetName.Sun,
          PlanetName.Moon,
          PlanetName.Mercury,
          PlanetName.Venus,
          PlanetName.Mars,
          PlanetName.Jupiter,
          PlanetName.Saturn,
        ]);
      }
    });

    it('应保持 planets 数组中7颗行星的相对顺序', () => {
      const planets = [
        makePlanet(PlanetName.Saturn, 0),
        makePlanet(PlanetName.Jupiter, 30),
        makePlanet(PlanetName.Mars, 60),
        makePlanet(PlanetName.Venus, 90),
        makePlanet(PlanetName.Mercury, 120),
        makePlanet(PlanetName.Moon, 150),
        makePlanet(PlanetName.Sun, 180),
      ];
      const result = calculateAllPlanetDignities(planets);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.map((d) => d.planet.name)).toEqual([
          PlanetName.Saturn,
          PlanetName.Jupiter,
          PlanetName.Mars,
          PlanetName.Venus,
          PlanetName.Mercury,
          PlanetName.Moon,
          PlanetName.Sun,
        ]);
      }
    });

    it('应使用太阳的经度计算其他行星的日光条件', () => {
      const horo = makeHoro({ sun: 0, planets: [makePlanet(PlanetName.Mercury, 5)] });
      const result = calculateAllPlanetPowers(horo);
      if (result.ok) {
        const mercury = findPower(result.value, PlanetName.Mercury)!;
        expect(mercury.accidental.combust).toBe(true);
      }
    });

    it('太阳不存在时应返回 Err', () => {
      const planets = [makePlanet(PlanetName.Mercury, 0.1)];
      const result = calculateAllPlanetDignities(planets);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/缺少太阳/);
      }
    });

    it('缺失的行星不会出现在结果中', () => {
      const planets = [
        makePlanet(PlanetName.Sun, 0),
        makePlanet(PlanetName.Moon, 30),
      ];
      const result = calculateAllPlanetDignities(planets);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(2);
      }
    });
  });

  describe('findChartAlmuten', () => {
    it('空数组返回 null', () => {
      expect(findChartAlmuten([])).toBeNull();
    });

    it('返回分数最高的行星', () => {
      const result = calculateAllPlanetDignities([
        makePlanet(PlanetName.Sun, 0),
        makePlanet(PlanetName.Moon, 90),
        makePlanet(PlanetName.Mercury, 150),
      ]);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const almuten = findChartAlmuten(result.value);
      expect(almuten).not.toBeNull();
      expect(almuten!.planet.name).toBe(PlanetName.Mercury);
    });

    it('同分时返回数组中靠前者', () => {
      // 月亮在金牛座0°：旺+三分(Lily) = 7
      // 太阳在白羊座0°：旺+三分(Lily) = 7
      const result = calculateAllPlanetDignities([
        makePlanet(PlanetName.Moon, 30),
        makePlanet(PlanetName.Sun, 0),
      ]);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const sunScore = result.value.find((d) => d.planet.name === PlanetName.Sun)!.score;
      const moonScore = result.value.find((d) => d.planet.name === PlanetName.Moon)!.score;
      expect(sunScore).toBe(moonScore);
      expect(sunScore).toBe(7);
      const almuten = findChartAlmuten(result.value);
      expect(almuten!.planet.name).toBe(PlanetName.Moon);
    });
  });

  describe('calculatePlanetDignity - 游离星', () => {
    it('无任何先天尊贵的行星为游离星，分数=-5', () => {
      // 水星在天蝎座0°(210°)：无庙/旺/三分/界/面/陷/弱
      const mercury = makePlanet(PlanetName.Mercury, 210);
      const d = calculatePlanetDignity(mercury);
      expect(d.rulership).toBe(false);
      expect(d.exaltation).toBe(false);
      expect(d.triplicity).toBe(false);
      expect(d.term).toBe(false);
      expect(d.face).toBe(false);
      expect(d.fall).toBe(false);
      expect(d.detriment).toBe(false);
      expect(d.peregrine).toBe(true);
      expect(d.score).toBe(-5);
    });

    it('行星在陷时不算游离星（避免双重扣分）', () => {
      // 土星在白羊座0°(0°)：陷(Fall)，不应同时为游离星
      const saturn = makePlanet(PlanetName.Saturn, 0);
      const d = calculatePlanetDignity(saturn);
      expect(d.fall).toBe(true);
      expect(d.peregrine).toBe(false);
      expect(d.score).toBe(-4);
    });

    it('行星在弱时不算游离星（避免双重扣分）', () => {
      // 金星在白羊座0°(0°)：弱(Detriment)，不应同时为游离星
      const venus = makePlanet(PlanetName.Venus, 0);
      const d = calculatePlanetDignity(venus);
      expect(d.detriment).toBe(true);
      expect(d.peregrine).toBe(false);
      expect(d.score).toBe(-5);
    });
  });

  describe('getPlanetHouse', () => {
    it('行星在宫头区间内返回对应宫位', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      expect(getPlanetHouse(15, cusps)).toEqual({ ok: true, value: 1 });
      expect(getPlanetHouse(45, cusps)).toEqual({ ok: true, value: 2 });
      expect(getPlanetHouse(345, cusps)).toEqual({ ok: true, value: 12 });
    });

    it('5度规则：行星在宫头前5度内算入该宫', () => {
      // 宫头非星座边界：cusps=[10, 40, ...]
      // 第1宫区间=[10-5, 40-5)=[5, 35)
      // 行星6°在[5,35)内 → 第1宫（若无5度规则则为第12宫）
      const cusps = [10, 40, 70, 100, 130, 160, 190, 220, 250, 280, 310, 340];
      expect(getPlanetHouse(6, cusps)).toEqual({ ok: true, value: 1 });
      expect(getPlanetHouse(4, cusps)).toEqual({ ok: true, value: 12 });
    });

    it('星座边界调整：cusp-5跨星座时取cusp所在星座0度', () => {
      // cusps在星座边界[0, 30, 60, ...]
      // 第1宫：a0=adjustCuspBoundary(0,5)=0(白羊0°), b0=adjustCuspBoundary(30,5)=30(金牛0°)
      // 区间=[0, 30)，行星358°不在其中 → 第12宫（非第1宫）
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      expect(getPlanetHouse(358, cusps)).toEqual({ ok: true, value: 12 });
      expect(getPlanetHouse(15, cusps)).toEqual({ ok: true, value: 1 });
    });
  });

  describe('calculateAllPlanetPowers - 互容', () => {
    it('入庙互容：两行星互相在对方入庙星座，各+5', () => {
      // 火星在天秤座0°(180°)→弱(-5)；金星在白羊座0°(0°)→弱(-5)
      // 火星在金星庙(Libra)，金星在火星庙(Aries)→互容+5
      const horo = makeHoro({
        sun: 90,
        moon: 270,
        planets: [
          makePlanet(PlanetName.Mars, 180),
          makePlanet(PlanetName.Venus, 0),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mars = findPower(result.value, PlanetName.Mars)!;
      const venus = findPower(result.value, PlanetName.Venus)!;
      expect(mars.essential.mutualReceptionRulership).toBe(true);
      expect(venus.essential.mutualReceptionRulership).toBe(true);
      // 弱(-5) + 互容(+5) = 0
      expect(mars.essential.score).toBe(0);
      expect(venus.essential.score).toBe(0);
    });

    it('入旺互容：两行星互相在对方入旺星座，各+4', () => {
      // 太阳在天秤座0°(180°)→陷(-4)；土星在白羊座0°(0°)→陷(-4)
      // 太阳在土星旺(Libra)，土星在太阳旺(Aries)→互容+4
      const horo = makeHoro({
        sun: 180,
        moon: 270,
        planets: [makePlanet(PlanetName.Saturn, 0)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const sun = findPower(result.value, PlanetName.Sun)!;
      const saturn = findPower(result.value, PlanetName.Saturn)!;
      expect(sun.essential.mutualReceptionExaltation).toBe(true);
      expect(saturn.essential.mutualReceptionExaltation).toBe(true);
      // 陷(-4) + 互容(+4) = 0
      expect(sun.essential.score).toBe(0);
      expect(saturn.essential.score).toBe(0);
    });

    it('混合互容不计分：一入庙一入旺', () => {
      // 火星在天秤座0°(180°)→弱(-5)；土星在白羊座0°(0°)→陷(-4)
      // 火星在土星旺(Libra)有[Exaltation]，土星在火星庙(Aries)有[Rulership]
      // 不同种类互容，不计分
      const horo = makeHoro({
        sun: 90,
        moon: 270,
        planets: [
          makePlanet(PlanetName.Mars, 180),
          makePlanet(PlanetName.Saturn, 0),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mars = findPower(result.value, PlanetName.Mars)!;
      const saturn = findPower(result.value, PlanetName.Saturn)!;
      expect(mars.essential.mutualReceptionRulership).toBe(false);
      expect(mars.essential.mutualReceptionExaltation).toBe(false);
      expect(saturn.essential.mutualReceptionRulership).toBe(false);
      expect(saturn.essential.mutualReceptionExaltation).toBe(false);
      // 仅弱/陷分，无互容分
      expect(mars.essential.score).toBe(-5);
      expect(saturn.essential.score).toBe(-4);
    });
  });

  describe('calculateAllPlanetPowers - 顺逆行', () => {
    it('行星顺行(speed>=0)：direct=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 210, { speed: 1 })],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.direct).toBe(true);
      expect(mercury.accidental.retrograde).toBe(false);
    });

    it('行星逆行(speed<0)：retrograde=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 210, { speed: -1 })],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.direct).toBe(false);
      expect(mercury.accidental.retrograde).toBe(true);
    });

    it('日月不计顺逆行分', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const sun = findPower(result.value, PlanetName.Sun)!;
      const moon = findPower(result.value, PlanetName.Moon)!;
      expect(sun.accidental.direct).toBe(false);
      expect(sun.accidental.retrograde).toBe(false);
      expect(moon.accidental.direct).toBe(false);
      expect(moon.accidental.retrograde).toBe(false);
    });
  });

  describe('calculateAllPlanetPowers - 速度状态', () => {
    it('快速(speed_state=快)：fast=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [
          makePlanet(PlanetName.Mercury, 210, {
            speed_state: PlanetSpeedState.快,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.fast).toBe(true);
      expect(mercury.accidental.slow).toBe(false);
    });

    it('慢速(speed_state=慢)：slow=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [
          makePlanet(PlanetName.Mercury, 210, {
            speed_state: PlanetSpeedState.慢,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.fast).toBe(false);
      expect(mercury.accidental.slow).toBe(true);
    });
  });

  describe('calculateAllPlanetPowers - 东西方', () => {
    it('土木火在太阳东方(elongation>180)：oriental=true', () => {
      // 火星200°，太阳0°，elongation=200°>180°→东方
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mars, 200)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mars = findPower(result.value, PlanetName.Mars)!;
      expect(mars.accidental.oriental).toBe(true);
      expect(mars.accidental.occidental).toBe(false);
    });

    it('土木火在太阳西方(elongation<180)：occidental=true', () => {
      // 火星100°，太阳0°，elongation=100°<180°→西方
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mars, 100)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mars = findPower(result.value, PlanetName.Mars)!;
      expect(mars.accidental.oriental).toBe(false);
      expect(mars.accidental.occidental).toBe(true);
    });

    it('金水在太阳西方(elongation<180)：occidental=true', () => {
      // 水星100°，太阳0°，elongation=100°<180°→西方
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 100)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.occidental).toBe(true);
      expect(mercury.accidental.oriental).toBe(false);
    });

    it('金水在太阳东方(elongation>180)：oriental=true', () => {
      // 水星200°，太阳0°，elongation=200°>180°→东方
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 200)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.occidental).toBe(false);
      expect(mercury.accidental.oriental).toBe(true);
    });

    it('日月不计东西方', () => {
      const horo = makeHoro({ sun: 0, moon: 180 });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const sun = findPower(result.value, PlanetName.Sun)!;
      const moon = findPower(result.value, PlanetName.Moon)!;
      expect(sun.accidental.oriental).toBe(false);
      expect(sun.accidental.occidental).toBe(false);
      expect(moon.accidental.oriental).toBe(false);
      expect(moon.accidental.occidental).toBe(false);
    });
  });

  describe('calculateAllPlanetPowers - 月相', () => {
    it('月亮渐圆(elongation 0-180)：waxing=true', () => {
      // 月亮90°，太阳0°，elongation=90°
      const horo = makeHoro({ sun: 0, moon: 90 });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const moon = findPower(result.value, PlanetName.Moon)!;
      expect(moon.accidental.waxing).toBe(true);
      expect(moon.accidental.waning).toBe(false);
    });

    it('月亮渐亏(elongation>180)：waning=true', () => {
      // 月亮270°，太阳0°，elongation=270°
      const horo = makeHoro({ sun: 0, moon: 270 });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const moon = findPower(result.value, PlanetName.Moon)!;
      expect(moon.accidental.waxing).toBe(false);
      expect(moon.accidental.waning).toBe(true);
    });

    it('非月亮不计月相分', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 210)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.waxing).toBe(false);
      expect(mercury.accidental.waning).toBe(false);
    });
  });

  describe('calculateAllPlanetPowers - 后天日光条件', () => {
    it('日核(cazimi)：角距<17分', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 0.1)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.cazimi).toBe(true);
      expect(mercury.accidental.combust).toBe(false);
      expect(mercury.accidental.underSunbeams).toBe(false);
      expect(mercury.accidental.freeFromSun).toBe(false);
    });

    it('燃烧(combust)：角距17分~8.5度', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 5)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.cazimi).toBe(false);
      expect(mercury.accidental.combust).toBe(true);
      expect(mercury.accidental.underSunbeams).toBe(false);
      expect(mercury.accidental.freeFromSun).toBe(false);
    });

    it('太阳光束下(underSunbeams)：角距8.5~17度', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 12)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.cazimi).toBe(false);
      expect(mercury.accidental.combust).toBe(false);
      expect(mercury.accidental.underSunbeams).toBe(true);
      expect(mercury.accidental.freeFromSun).toBe(false);
    });

    it('离日(freeFromSun)：角距>=17度', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 210)],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.cazimi).toBe(false);
      expect(mercury.accidental.combust).toBe(false);
      expect(mercury.accidental.underSunbeams).toBe(false);
      expect(mercury.accidental.freeFromSun).toBe(true);
    });

    it('太阳自身不计日光条件', () => {
      const horo = makeHoro({ sun: 0, moon: 180 });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const sun = findPower(result.value, PlanetName.Sun)!;
      expect(sun.accidental.cazimi).toBe(false);
      expect(sun.accidental.combust).toBe(false);
      expect(sun.accidental.underSunbeams).toBe(false);
      expect(sun.accidental.freeFromSun).toBe(false);
    });
  });

  describe('calculateAllPlanetPowers - 相位计分', () => {
    it('合相吉星(金木)：conjunctBenefic=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Venus,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.conjunctBenefic).toBe(true);
    });

    it('合相北交点：conjunctNorthNode=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.NorthNode,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.conjunctNorthNode).toBe(true);
    });

    it('三合吉星(120°)：trineBenefic=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Jupiter,
            aspect_value: 120,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.trineBenefic).toBe(true);
    });

    it('六合吉星(60°)：sextileBenefic=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Jupiter,
            aspect_value: 60,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.sextileBenefic).toBe(true);
    });

    it('合相凶星(火土)：conjunctMalefic=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Mars,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.conjunctMalefic).toBe(true);
    });

    it('合相南交点：conjunctSouthNode=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.SouthNode,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.conjunctSouthNode).toBe(true);
    });

    it('冲相凶星(180°)：oppositionMalefic=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Saturn,
            aspect_value: 180,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.oppositionMalefic).toBe(true);
    });

    it('刑相凶星(90°)：squareMalefic=true', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mercury, 90)],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Mars,
            aspect_value: 90,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.squareMalefic).toBe(true);
    });
  });

  describe('calculateAllPlanetPowers - 包围', () => {
    it('行星被火土包围：与火土均合相且位于火土之间', () => {
      // 火星100°，土星120°，水星110°（在火土短弧之间）
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [
          makePlanet(PlanetName.Mars, 100),
          makePlanet(PlanetName.Saturn, 120),
          makePlanet(PlanetName.Mercury, 110),
        ],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Mars,
            aspect_value: 0,
          }),
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Saturn,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.besieged).toBe(true);
    });

    it('行星与火土均合相但不在火土之间：不计包围', () => {
      // 火星100°，土星120°，水星200°（不在火土之间）
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [
          makePlanet(PlanetName.Mars, 100),
          makePlanet(PlanetName.Saturn, 120),
          makePlanet(PlanetName.Mercury, 200),
        ],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Mars,
            aspect_value: 0,
          }),
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Saturn,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.besieged).toBe(false);
    });

    it('行星仅与火土之一合相：不计包围', () => {
      // 火星100°，土星120°，水星110°（在火土之间，但仅与火星合相）
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [
          makePlanet(PlanetName.Mars, 100),
          makePlanet(PlanetName.Saturn, 120),
          makePlanet(PlanetName.Mercury, 110),
        ],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Mars,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mercury = findPower(result.value, PlanetName.Mercury)!;
      expect(mercury.accidental.besieged).toBe(false);
    });

    it('火星/土星自身不计包围分', () => {
      // 火星100°，土星120°，火星在火土之间但自身是火星
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        planets: [
          makePlanet(PlanetName.Mars, 100),
          makePlanet(PlanetName.Saturn, 120),
        ],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mars,
            p1: PlanetName.Saturn,
            aspect_value: 0,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const mars = findPower(result.value, PlanetName.Mars)!;
      const saturn = findPower(result.value, PlanetName.Saturn)!;
      expect(mars.accidental.besieged).toBe(false);
      expect(saturn.accidental.besieged).toBe(false);
    });
  });

  describe('calculateAllPlanetPowers - 总分', () => {
    it('totalScore === essential.score + accidental.score', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 90,
        planets: [
          makePlanet(PlanetName.Mercury, 150),
          makePlanet(PlanetName.Venus, 30),
          makePlanet(PlanetName.Mars, 200),
          makePlanet(PlanetName.Jupiter, 300),
          makePlanet(PlanetName.Saturn, 180),
        ],
        aspects: [
          createMockAspect({
            p0: PlanetName.Mercury,
            p1: PlanetName.Jupiter,
            aspect_value: 120,
          }),
        ],
      });
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      for (const p of result.value) {
        expect(p.totalScore).toBe(p.essential.score + p.accidental.score);
      }
    });

    it('缺少太阳时返回错误', () => {
      const horo = makeHoro({ sun: 0, moon: 180 });
      horo.planets = horo.planets.filter((p) => p.name !== PlanetName.Sun);
      const result = calculateAllPlanetPowers(horo);
      expect(result.ok).toBe(false);
    });
  });
});
