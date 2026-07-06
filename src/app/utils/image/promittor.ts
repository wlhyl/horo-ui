import {
  cos,
  degNorm,
  sin,
  degreeToDMS,
  zodiacLong,
  newtonIteration,
} from '../horo-math/horo-math';
import { Planet, PromittorType } from '../../type/interface/response-data';
import { PlanetName } from '../../type/enum/planet';
import { Zodiac } from '../../type/enum/zodiac';
import { Drawable } from './horo';
import { Horoconfig } from '../../services/config/horo-config.service';
import { ptolemyTerm } from './zodiac';

// #region Types
export interface PromittorPoint {
  planet: PlanetName;
  type: PromittorType;
  longitude: number;
}

export type Selection =
  | { kind: 'none' }
  | { kind: 'planet'; planet: PlanetName }
  | { kind: 'term'; zodiac: Zodiac; termIndex: number };

// #endregion

// #region Term Range Helpers
export function getTermRange(
  zodiac: Zodiac,
  termIndex: number,
): { start: number; end: number } {
  const terms = ptolemyTerm(zodiac);
  const start =
    termIndex === 0 ? zodiac * 30 : zodiac * 30 + terms[termIndex - 1].d;
  const end = zodiac * 30 + terms[termIndex].d;
  return { start, end };
}

export function isInTermRange(
  longitude: number,
  start: number,
  end: number,
): boolean {
  const long = degNorm(longitude);
  return long >= start && long < end;
}
// #endregion

// #region Promittor Calculation
// 参照 horo-api/horo/src/direction/utils.rs generate_zodiacal_direction_promittors
export function calculatePromittors(
  planets: readonly Planet[],
  partOfFortune: Planet,
): PromittorPoint[] {
  const result: PromittorPoint[] = [];

  for (const planet of [...planets, partOfFortune]) {
    const long = planet.long;

    // 合相
    result.push({
      planet: planet.name,
      type: PromittorType.Conjunction,
      longitude: long,
    });

    // 映点: 180 - long
    const antisciaLong = degNorm(180 - planet.long);
    result.push({
      planet: planet.name,
      type: PromittorType.Antiscoins,
      longitude: antisciaLong,
    });

    // 南北交点只算合相 + 映点，不算反映点与相位
    if (
      planet.name === PlanetName.NorthNode ||
      planet.name === PlanetName.SouthNode
    ) {
      continue;
    }

    // 反映点: 180 + antisciaLong (= 360 - long)
    result.push({
      planet: planet.name,
      type: PromittorType.Contraantiscias,
      longitude: degNorm(180 + antisciaLong),
    });

    // 左相位 (sinister, 黄经 +)
    result.push({
      planet: planet.name,
      type: PromittorType.SinisterSextile,
      longitude: degNorm(long + 60),
    });
    result.push({
      planet: planet.name,
      type: PromittorType.SinisterSquare,
      longitude: degNorm(long + 90),
    });
    result.push({
      planet: planet.name,
      type: PromittorType.SinisterTrine,
      longitude: degNorm(long + 120),
    });

    // 右相位 (dexter, 黄经 -)
    result.push({
      planet: planet.name,
      type: PromittorType.DexterSextile,
      longitude: degNorm(long - 60),
    });
    result.push({
      planet: planet.name,
      type: PromittorType.DexterSquare,
      longitude: degNorm(long - 90),
    });
    result.push({
      planet: planet.name,
      type: PromittorType.DexterTrine,
      longitude: degNorm(long - 120),
    });

    // 对冲
    result.push({
      planet: planet.name,
      type: PromittorType.Opposition,
      longitude: degNorm(long + 180),
    });
  }

  return result;
}
// #endregion

// #region Promittor Drawing Helpers
function getPromittorColor(type: PromittorType): string {
  switch (type) {
    case PromittorType.SinisterSextile:
    case PromittorType.SinisterSquare:
    case PromittorType.SinisterTrine:
      return '#1a73e8'; // 蓝 - 左相位
    case PromittorType.DexterSextile:
    case PromittorType.DexterSquare:
    case PromittorType.DexterTrine:
      return '#d33'; // 红 - 右相位
    case PromittorType.Opposition:
      return '#7b1fa2'; // 紫 - 对冲
    case PromittorType.Antiscoins:
      return '#0d8050'; // 绿 - 映点
    case PromittorType.Contraantiscias:
      return '#e8740b'; // 橙 - 反映点
    default:
      return '#888';
  }
}

function promittorAspectValue(type: PromittorType): number | null {
  switch (type) {
    case PromittorType.SinisterSextile:
    case PromittorType.DexterSextile:
      return 60;
    case PromittorType.SinisterSquare:
    case PromittorType.DexterSquare:
      return 90;
    case PromittorType.SinisterTrine:
    case PromittorType.DexterTrine:
      return 120;
    case PromittorType.Opposition:
      return 180;
    default:
      return null;
  }
}

function isAspectFirst(type: PromittorType): boolean {
  return (
    type === PromittorType.SinisterSextile ||
    type === PromittorType.SinisterTrine
  );
}
// #endregion

// #region Ptolemy Bounds Drawing
// 端口自 quadrant_process.component.ts L416-460
export function calculatePtolemyBounds(
  config: Readonly<Horoconfig>,
  opts: {
    cx: number;
    cy: number;
    rInner: number;
    rOuter: number;
    firstCuspLong: number;
    selectedTerm: { zodiac: Zodiac; termIndex: number } | null;
  },
): Drawable[] {
  const { cx, cy, rInner, rOuter, firstCuspLong, selectedTerm } = opts;
  const elements: Drawable[] = [];

  for (let i = 0; i < 12; i++) {
    const zodiac = i as Zodiac;
    const terms = ptolemyTerm(zodiac);

    let termStartLong = i * 30;
    for (let j = 0; j < terms.length; j++) {
      const term = terms[j];
      const termEndLong = i * 30 + term.d;
      const angle = termEndLong + 180 - firstCuspLong;

      const x1 = cx + rInner * cos(angle);
      const y1 = cy - rInner * sin(angle);
      const x2 = cx + rOuter * cos(angle);
      const y2 = cy - rOuter * sin(angle);

      elements.push({
        type: 'path',
        path: `M ${x1} ${y1} L ${x2} ${y2}`,
        stroke: '#888',
        strokeDashArray: [2, 2],
      });

      // 界主星符号
      const termCenter =
        termStartLong + degNorm(termEndLong - termStartLong) / 2;
      const termCenterAngle = termCenter + 180 - firstCuspLong;
      const x = cx + (rInner + (rOuter - rInner) / 2) * cos(termCenterAngle);
      const y = cy - (rInner + (rOuter - rInner) / 2) * sin(termCenterAngle);

      const isSelectedTerm =
        selectedTerm !== null &&
        selectedTerm.zodiac === zodiac &&
        j === selectedTerm.termIndex;

      elements.push({
        type: 'text',
        text: config.planetFontString(term.p),
        left: x,
        top: y,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: config.planetFontFamily(term.p),
        ...(isSelectedTerm ? { fill: '#1976d2' } : {}),
      });

      termStartLong = termEndLong;
    }
  }

  return elements;
}
// #endregion

// #region Promittor Marks Drawing
export function calculatePromittorElements(
  promittors: readonly PromittorPoint[],
  config: Readonly<Horoconfig>,
  opts: {
    cx: number;
    cy: number;
    r: number;
    firstCuspLong: number;
    selection: Selection;
  },
): Drawable[] {
  const { cx, cy, r, firstCuspLong, selection } = opts;
  const elements: Drawable[] = [];

  if (selection.kind === 'none') {
    // 未选中：所有承诺星显示为小色点（合相除外）
    for (const p of promittors) {
      if (p.type === PromittorType.Conjunction) continue;
      const angle = p.longitude + 180 - firstCuspLong;
      const x = cx + r * cos(angle);
      const y = cy - r * sin(angle);
      const color = getPromittorColor(p.type);
      elements.push({
        type: 'circle',
        left: x,
        top: y,
        radius: 2,
        fill: color,
        stroke: color,
      });
    }
    return elements;
  }

  // 选中行星或界：将承诺星作为本命行星显示在内圈
  const selected =
    selection.kind === 'planet'
      ? promittors.filter((p) => p.planet === selection.planet)
      : (() => {
          const { start, end } = getTermRange(
            selection.zodiac,
            selection.termIndex,
          );
          return promittors.filter((p) =>
            isInTermRange(p.longitude, start, end),
          );
        })();
  const sorted = selected.toSorted(
    (a, b) => degNorm(a.longitude) - degNorm(b.longitude),
  );

  // 计算角度并调整位置避免重叠
  const p = sorted.map((x) => degNorm(x.longitude + 180 - firstCuspLong));
  const w = 7;
  for (let i = 0; i < p.length; i++) {
    let n = p.length;
    for (let j = 1; j < p.length; j++) {
      if (degNorm(p[(i + j) % p.length] - p[i]) >= w * j) {
        n = j;
        break;
      }
    }
    for (let j = 1; j < n; j++) {
      p[(i + j) % p.length] = degNorm(p[i] + j * w);
    }
  }

  for (let i = 0; i < p.length; i++) {
    const angle = p[i];
    const originalAngle = sorted[i].longitude + 180 - firstCuspLong;
    const color = getPromittorColor(sorted[i].type);

    const x_text = cx + ((r * 8) / 9.0) * cos(angle);
    const y_text = cy - ((r * 8) / 9.0) * sin(angle);
    const x_circle = cx + r * cos(originalAngle);
    const y_circle = cy - r * sin(originalAngle);

    // 指示线（牛顿迭代求起点）
    const f = (t: number) =>
      ((x_circle - x_text) * t + x_text - cx) ** 2 +
      ((y_circle - y_text) * t + y_text - cy) ** 2 -
      ((r * 8.4) / 9.0) ** 2;
    let x0 = x_text,
      y0 = y_text;
    try {
      const t = newtonIteration(0, f);
      x0 = x_text + (x_circle - x_text) * t;
      y0 = y_text + (y_circle - y_text) * t;
    } catch (error) {
      console.log(error);
    }

    elements.push({
      type: 'path',
      path: `M ${x0}, ${y0} L ${x_circle} ${y_circle}`,
      stroke: color,
      strokeDashArray: [3, 2],
    });

    // 标签：行星与相位符号沿同一半径分布
    pushPromittorLabel(elements, sorted[i], config, cx, cy, angle, r, color);

    // 位置信息（度、星座、分）— 内移以避免与内圈符号重叠
    const longOnZodiac = zodiacLong(sorted[i].longitude);
    const dms = degreeToDMS(longOnZodiac.long);
    const fontSize = 15;

    let x = cx + ((r * 6.5) / 9.0) * cos(angle);
    let y = cy - ((r * 6.5) / 9.0) * sin(angle);
    elements.push({
      type: 'text',
      text: `${dms.d};`,
      left: x,
      top: y,
      fontSize,
      fontFamily: config.astrologyFont,
    });

    x = cx + ((r * 6) / 9.0) * cos(angle);
    y = cy - ((r * 6) / 9.0) * sin(angle);
    elements.push({
      type: 'text',
      text: config.zodiacFontString(longOnZodiac.zodiac),
      left: x,
      top: y,
      fontSize,
      fontFamily: config.astrologyFont,
    });

    x = cx + ((r * 5.5) / 9.0) * cos(angle);
    y = cy - ((r * 5.5) / 9.0) * sin(angle);
    elements.push({
      type: 'text',
      text: `${dms.m}'`,
      left: x,
      top: y,
      fontSize,
      fontFamily: config.astrologyFont,
    });
  }

  return elements;
}

function pushPromittorLabel(
  elements: Drawable[],
  p: Readonly<PromittorPoint>,
  config: Readonly<Horoconfig>,
  cx: number,
  cy: number,
  angle: number,
  r: number,
  color: string,
): void {
  const planetChar = config.planetFontString(p.planet);
  const planetFont = config.planetFontFamily(p.planet);
  const aspectValue = promittorAspectValue(p.type);

  // 外圈（靠近指示线）与内圈（靠近度数信息）半径
  const rOuter = (r * 8) / 9.0;
  const rInner = (r * 7.3) / 9.0;

  const xOuter = cx + rOuter * cos(angle);
  const yOuter = cy - rOuter * sin(angle);
  const xInner = cx + rInner * cos(angle);
  const yInner = cy - rInner * sin(angle);

  if (p.type === PromittorType.Conjunction) {
    // 合相：仅行星符号（同本命行星）
    elements.push({
      type: 'text',
      text: planetChar,
      left: xOuter,
      top: yOuter,
      textAlign: 'center',
      fontSize: 30,
      fontFamily: planetFont,
    });
    return;
  }

  // 左相位（六合、三合）：先相位符号（内），再行星（外）
  // 其余（刑、冲、右相位、映点、反映点）：先行星（内），再符号（外）
  const aspectFirst = isAspectFirst(p.type);

  if (aspectValue !== null) {
    const aspectChar = config.aspectFontString(aspectValue);
    const aspectFont = config.aspectFontFamily();

    if (aspectFirst) {
      elements.push({
        type: 'text',
        text: aspectChar,
        left: xInner,
        top: yInner,
        textAlign: 'center',
        fontSize: 30,
        fontFamily: aspectFont,
        fill: color,
      });
      elements.push({
        type: 'text',
        text: planetChar,
        left: xOuter,
        top: yOuter,
        textAlign: 'center',
        fontSize: 30,
        fontFamily: planetFont,
        fill: color,
      });
    } else {
      elements.push({
        type: 'text',
        text: planetChar,
        left: xInner,
        top: yInner,
        textAlign: 'center',
        fontSize: 30,
        fontFamily: planetFont,
        fill: color,
      });
      elements.push({
        type: 'text',
        text: aspectChar,
        left: xOuter,
        top: yOuter,
        textAlign: 'center',
        fontSize: 30,
        fontFamily: aspectFont,
        fill: color,
      });
    }
    return;
  }

  // 映点/反映点：先行星（内），再 ant/co（外）
  if (p.type === PromittorType.Antiscoins || p.type === PromittorType.Contraantiscias) {
    elements.push({
      type: 'text',
      text: planetChar,
      left: xInner,
      top: yInner,
      textAlign: 'center',
      fontSize: 30,
      fontFamily: planetFont,
      fill: color,
    });
    elements.push({
      type: 'text',
      text: p.type === PromittorType.Antiscoins ? 'ant' : 'co',
      left: xOuter,
      top: yOuter,
      textAlign: 'center',
      fontSize: 14,
      fontFamily: config.textFont,
      fill: color,
    });
  }
}
// #endregion
