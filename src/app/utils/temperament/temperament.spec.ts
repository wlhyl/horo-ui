import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import {
  createMockAspect,
  createMockHoroscope,
  createMockPlanet,
} from '../../test-utils/test-data-factory.spec';
import { Horoscope, Planet } from '../../type/interface/response-data';
import { Result } from '../../type/interface/result';
import {
  calculateTemperamentContributors,
  calculateTemperamentSummary,
  ContributorKind,
  TemperamentContributor,
} from './temperament';

function expectOk<T>(r: Result<T, string>): T {
  if (!r.ok) throw new Error('期望计算成功，但返回错误');
  return r.value;
}

function makePlanet(name: PlanetName, long: number): Planet {
  return createMockPlanet({ name, long });
}

function makeHoro(opts: {
  sun?: number;
  moon?: number;
  asc?: number;
  cusps?: number[];
  planets?: Planet[];
  aspects?: ReturnType<typeof createMockAspect>[];
}): Horoscope {
  const sun = makePlanet(PlanetName.Sun, opts.sun ?? 0);
  const moon = makePlanet(PlanetName.Moon, opts.moon ?? 180);
  return createMockHoroscope({
    asc: createMockPlanet({ name: PlanetName.ASC, long: opts.asc ?? 0 }),
    cusps:
      opts.cusps ?? [opts.asc ?? 0, (opts.asc ?? 0) + 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    planets: [sun, moon, ...(opts.planets ?? [])],
    aspects: opts.aspects ?? [],
  });
}

function findPlanet(
  contributors: TemperamentContributor[],
  name: PlanetName,
): TemperamentContributor | undefined {
  return contributors.find((c) => c.kind === ContributorKind.Planet && c.name === name);
}

function findSign(
  contributors: TemperamentContributor[],
  sign: Zodiac,
): TemperamentContributor | undefined {
  return contributors.find((c) => c.kind === ContributorKind.Sign && c.name === sign);
}

describe('temperament', () => {
  describe('calculateTemperamentContributors - 错误处理', () => {
    it('缺少太阳时返回错误', () => {
      const horo = makeHoro({ sun: 0, moon: 180 });
      horo.planets = horo.planets.filter((p) => p.name !== PlanetName.Sun);
      const result = calculateTemperamentContributors(horo);
      expect(result.ok).toBeFalse();
    });

    it('缺少月亮时返回错误', () => {
      const horo = makeHoro({ sun: 0, moon: 180 });
      horo.planets = horo.planets.filter((p) => p.name !== PlanetName.Moon);
      const result = calculateTemperamentContributors(horo);
      expect(result.ok).toBeFalse();
    });
  });

  describe('太阳性质 - 四季分组', () => {
    it('白羊(0°)/金牛/双子 = 热+湿', () => {
      const horo = makeHoro({ sun: 0, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const sun = findPlanet(value, PlanetName.Sun)!;
      expect(sun.hot).toBeTrue();
      expect(sun.wet).toBeTrue();
      expect(sun.cold).toBeFalse();
      expect(sun.dry).toBeFalse();
    });

    it('巨蟹(90°)/狮子/室女 = 热+干', () => {
      const horo = makeHoro({ sun: 90, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const sun = findPlanet(value, PlanetName.Sun)!;
      expect(sun.hot).toBeTrue();
      expect(sun.dry).toBeTrue();
    });

    it('天秤(180°)/天蝎/射手 = 冷+干', () => {
      const horo = makeHoro({ sun: 180, moon: 0 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const sun = findPlanet(value, PlanetName.Sun)!;
      expect(sun.cold).toBeTrue();
      expect(sun.dry).toBeTrue();
    });

    it('摩羯(270°)/水瓶/双鱼 = 冷+湿', () => {
      const horo = makeHoro({ sun: 270, moon: 0 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const sun = findPlanet(value, PlanetName.Sun)!;
      expect(sun.cold).toBeTrue();
      expect(sun.wet).toBeTrue();
    });
  });

  describe('月亮性质 - 月相', () => {
    it('新月(elongation 45°) = 热+湿', () => {
      const horo = makeHoro({ sun: 0, moon: 45 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const moon = findPlanet(value, PlanetName.Moon)!;
      expect(moon.hot).toBeTrue();
      expect(moon.wet).toBeTrue();
    });

    it('上弦(elongation 135°) = 热+干', () => {
      const horo = makeHoro({ sun: 0, moon: 135 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const moon = findPlanet(value, PlanetName.Moon)!;
      expect(moon.hot).toBeTrue();
      expect(moon.dry).toBeTrue();
    });

    it('满月(elongation 225°) = 冷+干', () => {
      const horo = makeHoro({ sun: 0, moon: 225 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const moon = findPlanet(value, PlanetName.Moon)!;
      expect(moon.cold).toBeTrue();
      expect(moon.dry).toBeTrue();
    });

    it('下弦(elongation 315°) = 冷+湿', () => {
      const horo = makeHoro({ sun: 0, moon: 315 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const moon = findPlanet(value, PlanetName.Moon)!;
      expect(moon.cold).toBeTrue();
      expect(moon.wet).toBeTrue();
    });
  });

  describe('行星固定性质', () => {
    it('土星 = 冷+干', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        asc: 0,
        planets: [makePlanet(PlanetName.Saturn, 65)],
      });
      const value = expectOk(calculateTemperamentContributors(horo));
      const saturn = findPlanet(value, PlanetName.Saturn)!;
      expect(saturn.cold).toBeTrue();
      expect(saturn.dry).toBeTrue();
      expect(saturn.hot).toBeFalse();
      expect(saturn.wet).toBeFalse();
    });

    it('木星 = 热+湿', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        asc: 0,
        planets: [makePlanet(PlanetName.Jupiter, 65)],
      });
      const value = expectOk(calculateTemperamentContributors(horo));
      const jupiter = findPlanet(value, PlanetName.Jupiter)!;
      expect(jupiter.hot).toBeTrue();
      expect(jupiter.wet).toBeTrue();
    });

    it('南交点 = 热+干+冷', () => {
      const horo = makeHoro({
        sun: 0,
        moon: 180,
        asc: 0,
        planets: [makePlanet(PlanetName.SouthNode, 65)],
      });
      const value = expectOk(calculateTemperamentContributors(horo));
      const south = findPlanet(value, PlanetName.SouthNode)!;
      expect(south.hot).toBeTrue();
      expect(south.dry).toBeTrue();
      expect(south.cold).toBeTrue();
      expect(south.wet).toBeFalse();
    });
  });

  describe('星座性质 - 四元素', () => {
    it('ASC在白羊(火) → 1宫头星座 = 热+干', () => {
      const horo = makeHoro({ asc: 0, sun: 0, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const aries = findSign(value, Zodiac.Aries)!;
      expect(aries.hot).toBeTrue();
      expect(aries.dry).toBeTrue();
    });

    it('ASC在金牛(土) → 冷+干', () => {
      const horo = makeHoro({ asc: 30, sun: 60, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const taurus = findSign(value, Zodiac.Taurus)!;
      expect(taurus.cold).toBeTrue();
      expect(taurus.dry).toBeTrue();
    });

    it('ASC在双子(风) → 热+湿', () => {
      const horo = makeHoro({ asc: 60, sun: 90, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const gemini = findSign(value, Zodiac.Gemini)!;
      expect(gemini.hot).toBeTrue();
      expect(gemini.wet).toBeTrue();
    });

    it('ASC在巨蟹(水) → 冷+湿', () => {
      const horo = makeHoro({ asc: 90, sun: 120, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const cancer = findSign(value, Zodiac.Cancer)!;
      expect(cancer.cold).toBeTrue();
      expect(cancer.wet).toBeTrue();
    });
  });

  describe('收集规则', () => {
    it('1宫主星(ASC主星)入选', () => {
      // ASC 0° 白羊，主星火星
      const horo = makeHoro({ asc: 0, sun: 0, moon: 180 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const mars = findPlanet(value, PlanetName.Mars);
      expect(mars).toBeDefined();
      expect(mars!.sources).toContain('1宫主星');
    });

    it('与ASC相位取自aspects字段', () => {
      const horo = makeHoro({
        asc: 0,
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Saturn, 200)],
        aspects: [createMockAspect({ p0: PlanetName.ASC, p1: PlanetName.Saturn })],
      });
      const value = expectOk(calculateTemperamentContributors(horo));
      const saturn = findPlanet(value, PlanetName.Saturn)!;
      expect(saturn).toBeDefined();
      expect(saturn.sources).toContain('与ASC相位');
    });

    it('1宫内行星：使用getPlanetHouse判断', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      const value = expectOk(
        calculateTemperamentContributors(
          makeHoro({ asc: 0, sun: 0, moon: 180, cusps, planets: [makePlanet(PlanetName.Saturn, 15)] }),
        ),
      );
      const saturn = findPlanet(value, PlanetName.Saturn)!;
      expect(saturn).toBeDefined();
      expect(saturn.sources).toContain('1宫内行星');
    });

    it('非1宫内行星(无ASC相位)落选', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      const value = expectOk(
        calculateTemperamentContributors(
          makeHoro({ asc: 0, sun: 0, moon: 180, cusps, planets: [makePlanet(PlanetName.Saturn, 45)] }),
        ),
      );
      expect(findPlanet(value, PlanetName.Saturn)).toBeUndefined();
    });

    it('与月亮相位复用 aspects 数组', () => {
      const horo = makeHoro({
        asc: 0,
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Saturn, 200)],
        aspects: [createMockAspect({ p0: PlanetName.Moon, p1: PlanetName.Saturn })],
      });
      const value = expectOk(calculateTemperamentContributors(horo));
      const saturn = findPlanet(value, PlanetName.Saturn)!;
      expect(saturn).toBeDefined();
      expect(saturn.sources).toContain('与月亮相位');
    });

    it('行星去重：同一行星多来源合并为一条', () => {
      // ASC 0° 白羊，主星火星；火星再经月亮相位入选 → 合并来源
      const horo = makeHoro({
        asc: 0,
        sun: 0,
        moon: 180,
        planets: [makePlanet(PlanetName.Mars, 200)],
        aspects: [createMockAspect({ p0: PlanetName.Moon, p1: PlanetName.Mars })],
      });
      const value = expectOk(calculateTemperamentContributors(horo));
      const mars = findPlanet(value, PlanetName.Mars)!;
      expect(mars.sources).toContain('1宫主星');
      expect(mars.sources).toContain('与月亮相位');
    });

    it('太阳与月亮始终入选', () => {
      const horo = makeHoro({ asc: 60, sun: 90, moon: 200 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const sun = findPlanet(value, PlanetName.Sun)!;
      const moon = findPlanet(value, PlanetName.Moon)!;
      expect(sun.sources).toContain('太阳');
      expect(moon.sources).toContain('月亮');
    });

    it('入选行星所落星座与ASC星座去重计入星座contributor', () => {
      // ASC 0° 白羊；太阳 0° 白羊 → 白羊星座仅一条，含「1宫头星座」与「行星所落星座」
      const horo = makeHoro({ asc: 0, sun: 0, moon: 120 });
      const value = expectOk(calculateTemperamentContributors(horo));
      const aries = findSign(value, Zodiac.Aries)!;
      expect(aries.sources).toContain('1宫头星座');
      expect(aries.sources).toContain('行星所落星座');
      const ariesCount = value.filter(
        (c: TemperamentContributor) => c.kind === ContributorKind.Sign && c.name === Zodiac.Aries,
      ).length;
      expect(ariesCount).toBe(1);
    });
  });

  describe('calculateTemperamentSummary', () => {
    it('正确统计四性质计次', () => {
      const contributors: TemperamentContributor[] = [
        { id: 'p:Sun', kind: ContributorKind.Planet, name: PlanetName.Sun, sources: [], hot: true, cold: false, dry: false, wet: true },
        { id: 'p:Saturn', kind: ContributorKind.Planet, name: PlanetName.Saturn, sources: [], hot: false, cold: true, dry: true, wet: false },
      ];
      const s = calculateTemperamentSummary(contributors);
      expect(s.hot).toBe(1);
      expect(s.cold).toBe(1);
      expect(s.dry).toBe(1);
      expect(s.wet).toBe(1);
    });

    it('四体液分数 = 两性质之和', () => {
      const contributors: TemperamentContributor[] = [
        { id: 'p:Sun', kind: ContributorKind.Planet, name: PlanetName.Sun, sources: [], hot: true, cold: false, dry: false, wet: true },
        { id: 'p:Saturn', kind: ContributorKind.Planet, name: PlanetName.Saturn, sources: [], hot: false, cold: true, dry: true, wet: false },
      ];
      const s = calculateTemperamentSummary(contributors);
      // hot=1,wet=1,cold=1,dry=1
      expect(s.sanguine).toBe(2); // hot+wet
      expect(s.phlegmatic).toBe(2); // cold+wet
      expect(s.choleric).toBe(2); // hot+dry
      expect(s.melancholic).toBe(2); // cold+dry
      expect(s.total).toBe(8);
    });

    it('占比合计为100%', () => {
      const contributors: TemperamentContributor[] = [
        { id: 'p:Sun', kind: ContributorKind.Planet, name: PlanetName.Sun, sources: [], hot: true, cold: false, dry: true, wet: false },
        { id: 'p:Moon', kind: ContributorKind.Planet, name: PlanetName.Moon, sources: [], hot: false, cold: true, dry: false, wet: true },
        { id: 's:0', kind: ContributorKind.Sign, name: Zodiac.Aries, sources: [], hot: true, cold: false, dry: true, wet: false },
      ];
      const s = calculateTemperamentSummary(contributors);
      const sum =
        s.percentages.sanguine +
        s.percentages.phlegmatic +
        s.percentages.choleric +
        s.percentages.melancholic;
      expect(sum).toBeCloseTo(100, 5);
    });

    it('空contributors时占比为0且不除零', () => {
      const s = calculateTemperamentSummary([]);
      expect(s.total).toBe(0);
      expect(s.percentages.sanguine).toBe(0);
      expect(s.percentages.melancholic).toBe(0);
    });

    it('编辑性质后汇总同步变化', () => {
      const contributors: TemperamentContributor[] = [
        { id: 'p:Sun', kind: ContributorKind.Planet, name: PlanetName.Sun, sources: [], hot: true, cold: false, dry: false, wet: true },
      ];
      const before = calculateTemperamentSummary(contributors);
      contributors[0].hot = false;
      const after = calculateTemperamentSummary(contributors);
      expect(after.hot).toBe(before.hot - 1);
    });
  });
});
