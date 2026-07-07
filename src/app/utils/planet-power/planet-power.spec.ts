import { PlanetName } from '../../type/enum/planet';
import { Planet } from '../../type/interface/response-data';
import { Zodiac } from '../../type/enum/zodiac';
import {
  CAZIMI_THRESHOLD,
  COMBUST_THRESHOLD,
  DIGNITY_SCORES,
  SUNBEAMS_THRESHOLD,
  calculateAllPlanetDignities,
  calculatePlanetDignity,
  findChartAlmuten,
} from './planet-power';

function makePlanet(name: PlanetName, long: number): Planet {
  return {
    name,
    long,
    lat: 0,
    speed: 1,
    ra: 0,
    dec: 0,
    orb: 0,
    speed_state: '均' as never,
  };
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
        const d = calculatePlanetDignity(sun, 0);
        expect(d.zodiac).toBe(Zodiac.Aries);
        expect(d.zodiacDegree).toBeCloseTo(0, 5);
        expect(d.rulership).toBeFalse();
        expect(d.exaltation).toBeTrue();
        expect(d.triplicity).toBeTrue();
        expect(d.term).toBeFalse();
        expect(d.face).toBeFalse();
        expect(d.fall).toBeFalse();
        expect(d.detriment).toBeFalse();
        expect(d.score).toBe(7);
      });

      it('月亮在巨蟹座0°：庙，分数=5', () => {
        const moon = makePlanet(PlanetName.Moon, 90);
        const d = calculatePlanetDignity(moon, 0);
        expect(d.zodiac).toBe(Zodiac.Cancer);
        expect(d.rulership).toBeTrue();
        expect(d.exaltation).toBeFalse();
        expect(d.triplicity).toBeFalse();
        expect(d.score).toBe(5);
      });

      it('水星在处女座0°：庙+旺+界，分数=11', () => {
        const mercury = makePlanet(PlanetName.Mercury, 150);
        const d = calculatePlanetDignity(mercury, 0);
        expect(d.zodiac).toBe(Zodiac.Virgo);
        expect(d.rulership).toBeTrue();
        expect(d.exaltation).toBeTrue();
        expect(d.term).toBeTrue();
        expect(d.face).toBeFalse();
        expect(d.fall).toBeFalse();
        expect(d.detriment).toBeFalse();
        expect(d.score).toBe(5 + 4 + 2);
      });

      it('土星在白羊座0°：陷(Fall)，分数=-4', () => {
        const saturn = makePlanet(PlanetName.Saturn, 0);
        const d = calculatePlanetDignity(saturn, 0);
        expect(d.fall).toBeTrue();
        expect(d.detriment).toBeFalse();
        expect(d.score).toBe(-4);
      });

      it('金星在白羊座0°：弱(Detriment)，分数=-5', () => {
        const venus = makePlanet(PlanetName.Venus, 0);
        const d = calculatePlanetDignity(venus, 0);
        expect(d.fall).toBeFalse();
        expect(d.detriment).toBeTrue();
        expect(d.score).toBe(-5);
      });
    });

    describe('界判定', () => {
      it('白羊座0°-6°属于木星界', () => {
        const jupiter = makePlanet(PlanetName.Jupiter, 0);
        const d = calculatePlanetDignity(jupiter, 0);
        expect(d.term).toBeTrue();
      });

      it('白羊座6°-14°属于金星界', () => {
        const venus = makePlanet(PlanetName.Venus, 10);
        const d = calculatePlanetDignity(venus, 0);
        expect(d.term).toBeTrue();
      });

      it('白羊座30°(金牛座0°)不属于白羊座任何界', () => {
        const jupiter = makePlanet(PlanetName.Jupiter, 30);
        const d = calculatePlanetDignity(jupiter, 0);
        expect(d.zodiac).toBe(Zodiac.Taurus);
        expect(d.term).toBeFalse();
      });
    });

    describe('面判定', () => {
      it('白羊座0°-10°属于火星面', () => {
        const mars = makePlanet(PlanetName.Mars, 5);
        const d = calculatePlanetDignity(mars, 0);
        expect(d.face).toBeTrue();
      });

      it('白羊座10°-20°属于太阳面', () => {
        const sun = makePlanet(PlanetName.Sun, 15);
        const d = calculatePlanetDignity(sun, 0);
        expect(d.face).toBeTrue();
      });

      it('白羊座20°-30°属于金星面', () => {
        const venus = makePlanet(PlanetName.Venus, 25);
        const d = calculatePlanetDignity(venus, 0);
        expect(d.face).toBeTrue();
      });
    });

    describe('日光条件', () => {
      it('太阳自身不计算日光条件', () => {
        const sun = makePlanet(PlanetName.Sun, 0);
        const d = calculatePlanetDignity(sun, 0);
        expect(d.cazimi).toBeFalse();
        expect(d.combust).toBeFalse();
        expect(d.underSunbeams).toBeFalse();
      });

      it('行星与太阳角距 < 0°17 时为日核', () => {
        const mercury = makePlanet(PlanetName.Mercury, 0.1);
        const d = calculatePlanetDignity(mercury, 0);
        expect(d.cazimi).toBeTrue();
        expect(d.combust).toBeFalse();
        expect(d.underSunbeams).toBeFalse();
      });

      it('行星与太阳角距在 0°17~8°30 之间为燃烧', () => {
        const mercury = makePlanet(PlanetName.Mercury, 5);
        const d = calculatePlanetDignity(mercury, 0);
        expect(d.cazimi).toBeFalse();
        expect(d.combust).toBeTrue();
        expect(d.underSunbeams).toBeFalse();
      });

      it('行星与太阳角距在 8°30~17° 之间为太阳光束下', () => {
        const mercury = makePlanet(PlanetName.Mercury, 12);
        const d = calculatePlanetDignity(mercury, 0);
        expect(d.cazimi).toBeFalse();
        expect(d.combust).toBeFalse();
        expect(d.underSunbeams).toBeTrue();
      });

      it('行星与太阳角距 ≥ 17° 时无日光条件', () => {
        const mercury = makePlanet(PlanetName.Mercury, 20);
        const d = calculatePlanetDignity(mercury, 0);
        expect(d.cazimi).toBeFalse();
        expect(d.combust).toBeFalse();
        expect(d.underSunbeams).toBeFalse();
      });

      it('角距按360°环绕计算(行星350°，太阳0°，角距=10°，燃烧)', () => {
        const mercury = makePlanet(PlanetName.Mercury, 350);
        const d = calculatePlanetDignity(mercury, 0);
        expect(d.combust).toBeTrue();
      });

      it('太阳不存在于星盘时 calculateAllPlanetDignities 返回 Err', () => {
        const planets = [makePlanet(PlanetName.Mercury, 0.1)];
        const result = calculateAllPlanetDignities(planets);
        expect(result.ok).toBeFalse();
        if (!result.ok) {
          expect(result.error).toMatch(/缺少太阳/);
        }
      });

      it('日光条件不计入分数', () => {
        const cazimiPlanet = makePlanet(PlanetName.Mercury, 0.1);
        const dCazimi = calculatePlanetDignity(cazimiPlanet, 0);
        const farPlanet = makePlanet(PlanetName.Mercury, 100);
        const dFar = calculatePlanetDignity(farPlanet, 0);
        expect(dCazimi.score).toBe(dFar.score);
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
      expect(result.ok).toBeTrue();
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
      expect(result.ok).toBeTrue();
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
      const planets = [
        makePlanet(PlanetName.Sun, 0),
        makePlanet(PlanetName.Mercury, 5),
      ];
      const result = calculateAllPlanetDignities(planets);
      expect(result.ok).toBeTrue();
      if (result.ok) {
        const mercury = result.value.find(
          (d) => d.planet.name === PlanetName.Mercury,
        )!;
        expect(mercury.combust).toBeTrue();
      }
    });

    it('太阳不存在时应返回 Err', () => {
      const planets = [makePlanet(PlanetName.Mercury, 0.1)];
      const result = calculateAllPlanetDignities(planets);
      expect(result.ok).toBeFalse();
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
      expect(result.ok).toBeTrue();
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
      expect(result.ok).toBeTrue();
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
      expect(result.ok).toBeTrue();
      if (!result.ok) return;
      const sunScore = result.value.find((d) => d.planet.name === PlanetName.Sun)!.score;
      const moonScore = result.value.find((d) => d.planet.name === PlanetName.Moon)!.score;
      expect(sunScore).toBe(moonScore);
      expect(sunScore).toBe(7);
      const almuten = findChartAlmuten(result.value);
      expect(almuten!.planet.name).toBe(PlanetName.Moon);
    });
  });
});
