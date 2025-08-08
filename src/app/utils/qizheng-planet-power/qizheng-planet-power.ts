import {
  LunarMansionsName,
  PlanetName,
  PowerName,
} from 'src/app/type/enum/qizheng';
import { Planet } from 'src/app/type/interface/response-qizheng';

export function planetPower(planet: Planet) {
  const planetName = planet.name;
  const long = planet.long;
  const xiu = planet.xiu;

  const powers = [];

  // 检查行星是否在对应的殿宿中
  const planetPalaces = PLANET_PALACE_MAP.get(planetName);
  if (planetPalaces?.includes(xiu)) {
    powers.push(PowerName.殿);
  }

  if (long < 30.0) {
    // 戌
    if (planetName === PlanetName.火) powers.push(PowerName.垣);

    if (planetName === PlanetName.计) powers.push(PowerName.旺);
    if (planetName === PlanetName.日) powers.push(PowerName.旺);
    if (planetName === PlanetName.月) powers.push(PowerName.庙);

    if (planetName === PlanetName.罗) powers.push(PowerName.喜);
    if (planetName === PlanetName.气) powers.push(PowerName.喜);
  } else if (long < 60.0) {
    // 酉
    if (planetName === PlanetName.金) powers.push(PowerName.垣);

    if (planetName === PlanetName.金) powers.push(PowerName.庙);
    if (planetName === PlanetName.月) powers.push(PowerName.旺);

    if (planetName === PlanetName.金) powers.push(PowerName.乐);
    if (planetName === PlanetName.孛) powers.push(PowerName.乐);
  } else if (long < 90.0) {
    // 申
    if (planetName === PlanetName.水) powers.push(PowerName.垣);

    if (planetName === PlanetName.水) powers.push(PowerName.旺);
    if (planetName === PlanetName.气) powers.push(PowerName.庙);

    if (planetName === PlanetName.水) powers.push(PowerName.乐);
    if (planetName === PlanetName.火) powers.push(PowerName.喜);
  } else if (long < 120.0) {
    // 未
    if (planetName === PlanetName.月) powers.push(PowerName.垣);

    if (planetName === PlanetName.木) powers.push(PowerName.旺);
    if (planetName === PlanetName.孛) powers.push(PowerName.庙);

    if (planetName === PlanetName.木) powers.push(PowerName.喜);
    if (planetName === PlanetName.月) powers.push(PowerName.乐);
  } else if (long < 150.0) {
    // 午
    if (planetName === PlanetName.日) powers.push(PowerName.垣);

    if (planetName === PlanetName.水) powers.push(PowerName.庙);
    if (planetName === PlanetName.金) powers.push(PowerName.旺);
    if (planetName === PlanetName.日) powers.push(PowerName.庙);
    if (planetName === PlanetName.罗) powers.push(PowerName.庙);

    if (planetName === PlanetName.土) powers.push(PowerName.喜);
    if (planetName === PlanetName.日) powers.push(PowerName.乐);
  } else if (long < 180.0) {
    // 巳
    if (planetName === PlanetName.水) powers.push(PowerName.垣);

    if (planetName === PlanetName.计) powers.push(PowerName.庙);
    if (planetName === PlanetName.孛) powers.push(PowerName.旺);
    if (planetName === PlanetName.水) powers.push(PowerName.旺);
    if (planetName === PlanetName.日) powers.push(PowerName.旺);

    if (planetName === PlanetName.水) powers.push(PowerName.乐);
    if (planetName === PlanetName.金) powers.push(PowerName.喜);
  } else if (long < 210.0) {
    // 辰
    if (planetName === PlanetName.金) powers.push(PowerName.垣);

    if (planetName === PlanetName.金) powers.push(PowerName.庙);
    if (planetName === PlanetName.土) powers.push(PowerName.旺);

    if (planetName === PlanetName.水) powers.push(PowerName.喜);
    if (planetName === PlanetName.日) powers.push(PowerName.乐);
    if (planetName === PlanetName.金) powers.push(PowerName.乐);
  } else if (long < 240.0) {
    // 卯
    if (planetName === PlanetName.火) powers.push(PowerName.垣);

    if (planetName === PlanetName.火) powers.push(PowerName.庙);
    if (planetName === PlanetName.罗) powers.push(PowerName.旺);
    if (planetName === PlanetName.计) powers.push(PowerName.旺);
    if (planetName === PlanetName.土) powers.push(PowerName.旺);

    if (planetName === PlanetName.火) powers.push(PowerName.乐);
    if (planetName === PlanetName.月) powers.push(PowerName.喜);
    if (planetName === PlanetName.计) powers.push(PowerName.乐);
  } else if (long < 270.0) {
    // 寅
    if (planetName === PlanetName.木) powers.push(PowerName.垣);

    if (planetName === PlanetName.孛) powers.push(PowerName.旺);
    if (planetName === PlanetName.计) powers.push(PowerName.旺);
    if (planetName === PlanetName.罗) powers.push(PowerName.庙);

    if (planetName === PlanetName.日) powers.push(PowerName.喜);
    if (planetName === PlanetName.木) powers.push(PowerName.乐);
  } else if (long < 300.0) {
    // 丑
    if (planetName === PlanetName.土) powers.push(PowerName.垣);

    if (planetName === PlanetName.土) powers.push(PowerName.庙);
    if (planetName === PlanetName.火) powers.push(PowerName.旺);
    if (planetName === PlanetName.气) powers.push(PowerName.旺);

    if (planetName === PlanetName.土) powers.push(PowerName.乐);
    if (planetName === PlanetName.火) powers.push(PowerName.喜);
  } else if (long < 330.0) {
    // 子
    if (planetName === PlanetName.土) powers.push(PowerName.垣);

    if (planetName === PlanetName.水) powers.push(PowerName.旺);
    if (planetName === PlanetName.土) powers.push(PowerName.庙);

    if (planetName === PlanetName.土) powers.push(PowerName.乐);
    if (planetName === PlanetName.孛) powers.push(PowerName.乐);
    if (planetName === PlanetName.计) powers.push(PowerName.喜);
  } else {
    // 亥
    if (planetName === PlanetName.木) powers.push(PowerName.垣);

    if (planetName === PlanetName.金) powers.push(PowerName.旺);
    if (planetName === PlanetName.计) powers.push(PowerName.庙);
    if (planetName === PlanetName.木) powers.push(PowerName.庙);
    if (planetName === PlanetName.气) powers.push(PowerName.旺);

    if (planetName === PlanetName.孛) powers.push(PowerName.喜);
    if (planetName === PlanetName.木) powers.push(PowerName.乐);
    if (planetName === PlanetName.月) powers.push(PowerName.喜);
  }

  return powers;
}

// 定义各行星对应的殿宿
// prettier-ignore
const PLANET_PALACE_MAP = new Map([
  [PlanetName.日, [LunarMansionsName.房, LunarMansionsName.虚, LunarMansionsName.昴, LunarMansionsName.星]],
  [PlanetName.月, [LunarMansionsName.心, LunarMansionsName.危, LunarMansionsName.毕, LunarMansionsName.张]],
  [PlanetName.水, [LunarMansionsName.箕, LunarMansionsName.壁, LunarMansionsName.参, LunarMansionsName.轸]],
  [PlanetName.金, [LunarMansionsName.亢, LunarMansionsName.牛, LunarMansionsName.娄, LunarMansionsName.鬼]],
  [PlanetName.火, [LunarMansionsName.尾, LunarMansionsName.室, LunarMansionsName.觜, LunarMansionsName.翼]],
  [PlanetName.木, [LunarMansionsName.角, LunarMansionsName.斗, LunarMansionsName.奎, LunarMansionsName.井]],
  [PlanetName.土, [LunarMansionsName.氐, LunarMansionsName.女, LunarMansionsName.胃, LunarMansionsName.柳]],
]);

/**
 * 星辰贵格
 */
export function planetsGoodConfigs(planets: ReadonlyArray<Planet>): string[] {
  // 贵格数组
  const goodConfigs = [];

  const planetHouses = new Map(
    planets.map((p) => [p.name, Math.floor(p.long / 30)])
  );

  // 戌
  // 土日合照
  // 日遇白羊
  // 火居娄宿
  if (
    planetHouses.get(PlanetName.土) === 0 &&
    planetHouses.get(PlanetName.日) === 0
  ) {
    goodConfigs.push('土日合照');
  }
  if (planetHouses.get(PlanetName.日) === 0) {
    goodConfigs.push('日遇白羊');
  }

  if (planetHouses.get(PlanetName.火) === 0) {
    goodConfigs.push('火居娄宿');
  }

  // 酉
  // 月到金牛
  // 金居赵分
  // 月升沧海
  if (planetHouses.get(PlanetName.月) === 1) {
    goodConfigs.push('月到金牛');
    goodConfigs.push('月升沧海');
  }
  if (planetHouses.get(PlanetName.金) === 1) {
    goodConfigs.push('金居赵分');
  }

  // 申
  // 木土相会
  // 月遶昆仑
  // 火归坤地
  if (
    planetHouses.get(PlanetName.木) === 2 &&
    planetHouses.get(PlanetName.土) === 2
  ) {
    goodConfigs.push('木土相会');
  }
  if (planetHouses.get(PlanetName.月) === 2) {
    goodConfigs.push('月遶昆仑');
  }
  if (planetHouses.get(PlanetName.火) === 2) {
    goodConfigs.push('火归坤地');
  }

  // 未
  // 月挂柳梢
  // 金躔鬼宿
  // 木入秦州
  // 火号文昌
  // 星聚东井
  if (planetHouses.get(PlanetName.月) === 3) {
    goodConfigs.push('月挂柳梢');
  }
  if (planetHouses.get(PlanetName.金) === 3) {
    goodConfigs.push('金躔鬼宿');
  }
  if (planetHouses.get(PlanetName.木) === 3) {
    goodConfigs.push('木入秦州');
  }
  if (planetHouses.get(PlanetName.火) === 3) {
    goodConfigs.push('火号文昌');
  }
  if (
    planetHouses.get(PlanetName.水) === 3 &&
    planetHouses.get(PlanetName.金) === 3 &&
    planetHouses.get(PlanetName.火) === 3 &&
    planetHouses.get(PlanetName.木) === 3 &&
    planetHouses.get(PlanetName.土) === 3
  ) {
    goodConfigs.push('星聚东井');
  }

  // 午
  // 水阳相会
  // 日帝居阳
  // 水名荣显
  if (
    planetHouses.get(PlanetName.水) === 4 &&
    planetHouses.get(PlanetName.日) === 4
  ) {
    goodConfigs.push('水阳相会');
  }
  if (planetHouses.get(PlanetName.日) === 4) {
    goodConfigs.push('日帝居阳');
  }
  if (planetHouses.get(PlanetName.水) === 4) {
    goodConfigs.push('水名荣显');
  }

  // 巳
  // 金水会蛇
  // 日水乘旺
  // 水临双女
  if (
    planetHouses.get(PlanetName.水) === 5 &&
    planetHouses.get(PlanetName.金) === 5
  ) {
    goodConfigs.push('金水会蛇');
  }
  if (
    planetHouses.get(PlanetName.日) === 5 &&
    planetHouses.get(PlanetName.水) === 5
  ) {
    goodConfigs.push('日水乘旺');
  }
  if (planetHouses.get(PlanetName.水) === 5) {
    goodConfigs.push('水临双女');
  }

  // 辰
  // 金木逢龙
  // 水润金明
  // 金号太常
  // 木躔角道
  // 土归郑国
  if (
    planetHouses.get(PlanetName.金) === 6 &&
    planetHouses.get(PlanetName.木) === 6
  ) {
    goodConfigs.push('金木逢龙');
  }
  if (
    planetHouses.get(PlanetName.水) === 6 &&
    planetHouses.get(PlanetName.金) === 6
  ) {
    goodConfigs.push('水润金明');
  }
  if (planetHouses.get(PlanetName.金) === 6) {
    goodConfigs.push('金号太常');
  }
  if (planetHouses.get(PlanetName.木) === 6) {
    goodConfigs.push(
      '木躔角道(如果是木在辰宫有力，此格可能来自木星在辰的三分主星)'
    );
  }
  if (planetHouses.get(PlanetName.土) === 6) {
    goodConfigs.push('土归郑国');
  }

  // 卯
  // 火燃天蝎
  // 日出扶桑
  // 太阳逢兔
  if (planetHouses.get(PlanetName.火) === 7) {
    goodConfigs.push('火燃天蝎');
  }
  if (planetHouses.get(PlanetName.日) === 7) {
    goodConfigs.push('日出扶桑');
    goodConfigs.push('太阳逢兔');
  }

  // 寅
  // 木计同寅
  // 木居人马
  if (
    planetHouses.get(PlanetName.木) === 8 &&
    planetHouses.get(PlanetName.计) === 8
  ) {
    goodConfigs.push('木计同寅');
  }
  if (planetHouses.get(PlanetName.木) === 8) {
    goodConfigs.push('木居人马');
  }

  // 丑
  // 乙气骑牛
  // 孛星朝斗
  // 长庚朝斗
  // 火土会牛
  // 土号太常
  if (
    planetHouses.get(PlanetName.孛) === 9 &&
    planetHouses.get(PlanetName.气) === 9
  ) {
    goodConfigs.push('乙气骑牛');
  }
  if (planetHouses.get(PlanetName.孛) === 9) {
    goodConfigs.push('孛星朝斗');
  }
  if (planetHouses.get(PlanetName.金) === 9) {
    goodConfigs.push('长庚朝斗');
  }
  if (
    planetHouses.get(PlanetName.火) === 9 &&
    planetHouses.get(PlanetName.土) === 9
  ) {
    goodConfigs.push('火土会牛');
  }
  if (planetHouses.get(PlanetName.土) === 9) {
    goodConfigs.push('土号太常');
  }

  // 子
  // 水清宝瓶
  // 土号齐瓶
  // 水土朝北
  if (planetHouses.get(PlanetName.水) === 10) {
    goodConfigs.push('水清宝瓶');
  }
  if (planetHouses.get(PlanetName.土) === 10) {
    goodConfigs.push('土号齐瓶');
  }
  if (
    planetHouses.get(PlanetName.土) === 10 &&
    planetHouses.get(PlanetName.水) === 10
  ) {
    goodConfigs.push('水土朝北');
  }

  // 亥
  // 木计逢鱼
  // 太乙朝天
  // 木临营室
  // 日月朝天
  // 金居卫分
  // 金水乘旺
  if (
    planetHouses.get(PlanetName.木) === 11 &&
    planetHouses.get(PlanetName.计) === 11
  ) {
    goodConfigs.push('木计逢鱼');
  }
  if (planetHouses.get(PlanetName.孛) === 11) {
    goodConfigs.push('太乙朝天');
  }
  if (planetHouses.get(PlanetName.木) === 11) {
    goodConfigs.push('木临营室');
  }
  if (
    planetHouses.get(PlanetName.日) === 11 &&
    planetHouses.get(PlanetName.月) === 11
  ) {
    goodConfigs.push('日月朝天');
  }
  if (planetHouses.get(PlanetName.金) === 11) {
    goodConfigs.push('金居卫分');
  }
  if (
    planetHouses.get(PlanetName.金) === 11 &&
    planetHouses.get(PlanetName.水) === 11
  ) {
    goodConfigs.push('金水乘旺');
  }

  return goodConfigs;
}

/**
 * 星辰贱格
 */

export function planetsBadConfigs(planets: ReadonlyArray<Planet>): string[] {
  // 贵格数组
  const badConfigs = [];

  const planetHouses = new Map(
    planets.map((p) => [p.name, Math.floor(p.long / 30)])
  );

  // 戌
  // 金忌白羊
  // 水乘金旺
  if (planetHouses.get(PlanetName.金) === 0) {
    badConfigs.push('金忌白羊');
  }
  if (
    planetHouses.get(PlanetName.金) === 0 &&
    planetHouses.get(PlanetName.水) === 0
  ) {
    badConfigs.push('水乘金旺');
  }
  if (planetHouses.get(PlanetName.水) === 0) {
    badConfigs.push('水漂白羊');
  }

  // 酉
  // 火烧牛角
  if (planetHouses.get(PlanetName.火) === 1) {
    badConfigs.push('火烧牛角');
  }

  // 申
  // 土居水位
  if (planetHouses.get(PlanetName.土) === 2) {
    badConfigs.push('土居水位');
  }

  // 未
  // 计入秦分
  // 水流巨蟹
  if (planetHouses.get(PlanetName.计) === 3) {
    badConfigs.push('计入秦分');
  }
  if (planetHouses.get(PlanetName.水) === 3) {
    badConfigs.push('水流巨蟹');
  }

  // 午
  // 计临狮位
  // 木居狮子
  // 金火同周
  // 孛骑狮子
  if (planetHouses.get(PlanetName.计) === 4) {
    badConfigs.push('计临狮位');
  }
  if (planetHouses.get(PlanetName.木) === 4) {
    badConfigs.push('木居狮子');
  }
  if (
    planetHouses.get(PlanetName.金) === 4 &&
    planetHouses.get(PlanetName.火) === 4
  ) {
    badConfigs.push('金火同周');
  }
  if (planetHouses.get(PlanetName.孛) === 4) {
    badConfigs.push('孛骑狮子');
  }

  // 巳
  // 土埋双女
  // 水孛逢楚
  if (planetHouses.get(PlanetName.土) === 5) {
    badConfigs.push('土埋双女');
  }
  if (
    planetHouses.get(PlanetName.水) === 5 &&
    planetHouses.get(PlanetName.孛) === 5
  ) {
    badConfigs.push('水孛逢楚');
  }

  // 辰
  // 木触金龙
  // 火入金乡
  if (planetHouses.get(PlanetName.木) === 6) {
    badConfigs.push('木触金龙');
  }
  if (planetHouses.get(PlanetName.火) === 6) {
    badConfigs.push('火入金乡');
  }

  // 卯
  // 金乘火位
  if (planetHouses.get(PlanetName.金) === 7) {
    badConfigs.push('金乘火位');
  }

  // 寅
  // 金骑人马
  if (planetHouses.get(PlanetName.金) === 8) {
    badConfigs.push('金骑人马');
  }

  // 丑
  // 泉枯牛壑
  if (planetHouses.get(PlanetName.水) === 9) {
    badConfigs.push('泉枯牛壑(可能是因为土克水)');
  }
  // 子
  // 木打宝瓶
  if (planetHouses.get(PlanetName.木) === 10) {
    badConfigs.push('木打宝瓶');
  }

  // 亥
  /// 水计逢鱼
  if (planetHouses.get(PlanetName.水) === 11) {
    badConfigs.push('水计逢鱼');
  }

  return badConfigs;
}
