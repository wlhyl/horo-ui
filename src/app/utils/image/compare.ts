import { Horoconfig } from '../../services/config/horo-config.service';
import {
  Aspect,
  HoroscopeComparison,
  Planet,
} from '../../type/interface/response-data';
import * as fabric from 'fabric';
import {
  cos,
  degNorm,
  degreeToDMS,
  newtonIteration,
  sin,
  zodiacLong,
} from '../horo-math/horo-math';
import { CircleObject, Drawable, renderElements, TextObject } from './horo';
import { PathObject } from './horo';
import { PlanetName } from '../../type/enum/planet';

export function calculateAspectGrid(
  planets: readonly PlanetName[],
  width: number,
  height: number
): PathObject[] {
  const elements: PathObject[] = [];
  const col = planets.length + 1;
  const row = col;

  // 画横线
  // 画网格，共有13颗星，共14行（行星行+行星标识行=14行），共14条横线
  // 左侧坐标(x0, y0) = (width / 14, 0 + i * hegith / 14 )，第一列是行星，因此x坐标从第二个格开始，每格宽：width/14，因此，x0=width/14
  // 右侧坐标(x1, y1) = (width, y0)
  for (let i = 0; i < col; i++) {
    const x0 = width / row;
    const y0 = (i * height) / col;

    const x1 = width;
    const y1 = y0;

    elements.push({
      type: 'path',
      path: `M ${x0}, ${y0} L ${x1} ${y1}`,
      stroke: 'black',
    });
  }

  // 画竖线
  // 画网格，共有13颗星，共14列（行星列+行星标识列=14列），共14条竖线
  // x坐标从第二个格开始，每格宽：width/14
  // 上端坐标(x0, y0) = ((i + 1) * width / row, 0)，第一列是行星，每格宽：width/row
  // 下端坐标(x1, y1) = (x0, height - height / row)
  for (let i = 0; i < row; i++) {
    const x0 = ((i + 1) * width) / row;
    const y0 = 0; // 竖线起点从顶部开始
    const x1 = x0;
    const y1 = height - height / row; // 竖线终点到倒数第二行

    elements.push({
      type: 'path',
      path: `M ${x0}, ${y0} L ${x1} ${y1}`,
      stroke: 'black',
    });
  }
  return elements;
}

export function calculateAspectText(
  aspects: readonly Aspect[],
  planets: readonly PlanetName[],
  config: Readonly<Horoconfig>,
  width: number,
  height: number
): TextObject[] {
  const elements: TextObject[] = [];
  const col = planets.length + 1;
  const row = col;

  // 画行星符号
  planets.forEach((planet, i) => {
    const planetString = config.planetFontString(planet);
    const planetFontFamily = config.planetFontFamily(planet);

    const fontSize =
      planetString.length === 1
        ? (width / col) * 0.8
        : width / col / planetString.length;

    // 画第一列的行星符号
    // 第一个字符的中心坐标
    // cx=width / col / 2
    // cy = height / row * 0.5
    // 第n个字符的中心坐标
    // cx = width / col
    // cy = height / row * 0.5 + i * (height / row)
    let cx = width / col / 2;
    let cy = (height / row) * (i + 0.5);
    elements.push({
      type: 'text',
      text: planetString,
      left: cx,
      top: cy,
      fontSize: fontSize,
      fontFamily: planetFontFamily,
    });

    // 底部行的行星符号
    // 第一个字符的中心坐标
    // cx = width / col * 1.5
    // cy = height - height / row * 0.5
    // 第n个字符的中心坐标
    // cx = width / col * 1.5 + i * width / col
    // cy = height - height / row * 0.5
    cx = (width / col) * (1.5 + i);
    cy = height - (height / row) * 0.5; // 移到底部
    elements.push({
      type: 'text',
      text: planetString,
      left: cx,
      top: cy,
      fontSize: fontSize,
      fontFamily: planetFontFamily,
    });
  });

  // 画相位
  // 第一格中心的坐标，即太阳与太阳相交的格子
  // x: width / col + width / col / 2
  // y: height / row / 2
  aspects.forEach((aspect) => {
    const fontSize = width / col;

    // 画相位符号
    const cx = (width / col) * (1.5 + planets.indexOf(aspect.p0));
    const cy = (height / row) * (0.5 + planets.indexOf(aspect.p1));
    const aspectString = config.aspectFontString(aspect.aspect_value);
    elements.push({
      type: 'text',
      text: aspectString,
      left: cx,
      top: cy,
      fontSize: fontSize,
      fontFamily: config.aspectFontFamily(),
    });

    // 画相位值
    const aspectValue = degreeToDMS(aspect.d);
    const aspectValueString = aspect.apply
      ? `${aspectValue.d} A ${aspectValue.m}`
      : `${aspectValue.d} S ${aspectValue.m}`;

    elements.push({
      type: 'text',
      text: aspectValueString,
      left: cx,
      top: cy + ((width / col / 2.0) * 3) / 4.0,
      fontSize: fontSize * 0.2,
      fontFamily: config.textFont,
    });
  });
  return elements;
}

export function calculateHouseElements(
  cups: readonly number[],
  config: Readonly<Horoconfig>,
  options: Readonly<{ cx: number; cy: number; r0: number; r1: number }>
): Drawable[] {
  const { cx, cy, r0, r1 } = options;
  const elements: Drawable[] = [];

  // Outer and inner circles
  elements.push({
    type: 'circle',
    left: cx - r0,
    top: cy - r0,
    radius: r0,
    fill: '',
    stroke: 'black',
  });
  elements.push({
    type: 'circle',
    left: cx - r1,
    top: cy - r1,
    radius: r1,
    fill: '',
    stroke: 'black',
  });

  // 宫头在canvas中的角度
  // 第一宫在cups[0],在180度
  const cupsOfImage: number[] = cups.map((x) => x + 180 - cups[0]);

  for (let i = 0; i < cupsOfImage.length; i++) {
    const cupAngle = cupsOfImage[i];
    // Cusp lines
    let x = cx + r1 * cos(cupAngle);
    let y = cy - r1 * sin(cupAngle);
    elements.push({
      type: 'path',
      path: `M ${cx}, ${cy} L ${x} ${y}`,
      stroke: 'black',
    });

    // 计算并画宫位号，计算文字的圆心
    // d: 宫位宽度，>=0
    const d = degNorm(cupsOfImage[(i + 1) % cupsOfImage.length] - cupAngle);
    x = cx + (r1 / 8) * cos(cupAngle + d / 2);
    y = cy - (r1 / 8) * sin(cupAngle + d / 2);
    elements.push({
      type: 'text',
      text: `${i + 1}`,
      left: x,
      top: y,
      fontSize: 10,
      fontFamily: config.textFont,
    });

    // Zodiac signs on cusps
    const cupsZodiacLong = zodiacLong(cups[i]);
    x = cx + (r1 + (r0 - r1) / 2) * cos(cupAngle);
    y = cy - (r1 + (r0 - r1) / 2) * sin(cupAngle);
    elements.push({
      type: 'text',
      text: `${config.zodiacFontString(cupsZodiacLong.zodiac)}`,
      left: x,
      top: y,
      fontSize: (r0 - r1) / 2,
      fontFamily: config.zodiacFontFamily(),
    });

    // Cusp degrees and minutes
    const cupsZodiacLongDMS = degreeToDMS(cupsZodiacLong.long);
    const angleOffset = 5;
    const textRadius = r1 + (r0 - r1) / 2;

    const dAngle = i < 7 ? cupAngle - angleOffset : cupAngle + angleOffset;
    x = cx + textRadius * cos(dAngle);
    y = cy - textRadius * sin(dAngle);
    elements.push({
      type: 'text',
      text: `${cupsZodiacLongDMS.d};`,
      left: x,
      top: y,
      fontSize: (r0 - r1) / 4,
      fontFamily: config.astrologyFont,
    });

    const mAngle = i < 7 ? cupAngle + angleOffset : cupAngle - angleOffset;
    x = cx + textRadius * cos(mAngle);
    y = cy - textRadius * sin(mAngle);
    elements.push({
      type: 'text',
      text: `${cupsZodiacLongDMS.m}'`,
      left: x,
      top: y,
      fontSize: (r0 - r1) / 4,
      fontFamily: config.astrologyFont,
    });
  }
  return elements;
}

function addPlanetDetails(
  elements: (TextObject | PathObject)[],
  config: Readonly<Horoconfig>,
  options: Readonly<{
    cx: number;
    cy: number;
    r: number;
    angle: number;
    planet: Readonly<Planet>;
    fontSize: number;
    radii: Readonly<{
      degreeX: number;
      degreeY: number;
      zodiac: number;
      minute: number;
      retrograde: number;
    }>;
  }>
) {
  const { cx, cy, r, angle, planet, fontSize, radii } = options;

  const planetLongOnZodiac = zodiacLong(planet.long);
  const planetLongDMS = degreeToDMS(planetLongOnZodiac.long);
  const isRetrograde = planet.speed < 0;

  // Degrees
  let x = cx + r * radii.degreeX * cos(angle);
  let y = cy - r * radii.degreeY * sin(angle);
  elements.push({
    type: 'text',
    text: `${planetLongDMS.d};`,
    left: x,
    top: y,
    fontSize: fontSize,
    fontFamily: config.astrologyFont,
  });

  // Zodiac Sign
  x = cx + r * radii.zodiac * cos(angle);
  y = cy - r * radii.zodiac * sin(angle);
  elements.push({
    type: 'text',
    text: `${config.zodiacFontString(planetLongOnZodiac.zodiac)}`,
    left: x,
    top: y,
    fontSize: fontSize,
    fontFamily: config.astrologyFont,
  });

  // Minutes
  x = cx + r * radii.minute * cos(angle);
  y = cy - r * radii.minute * sin(angle);
  elements.push({
    type: 'text',
    text: `${planetLongDMS.m}'`,
    left: x,
    top: y,
    fontSize: fontSize,
    fontFamily: config.astrologyFont,
  });

  // Retrograde
  if (isRetrograde) {
    x = cx + r * radii.retrograde * cos(angle);
    y = cy - r * radii.retrograde * sin(angle);
    elements.push({
      type: 'text',
      text: '>',
      left: x,
      top: y,
      fontSize: fontSize,
      fontFamily: config.astrologyFont,
    });
  }
}

export function calculatePlanets(
  planets: readonly Planet[],
  firstCupsLong: number,
  config: Readonly<Horoconfig>,
  options: Readonly<{ cx: number; cy: number; r: number }>,
  isNative: boolean
): (TextObject | PathObject)[] {
  const { cx, cy, r } = options;
  const w = isNative ? 12 : 8; // 字符间宽度，以角度表示
  const elements: (TextObject | PathObject)[] = [];

  const sortedPlanets = planets.toSorted(
    (a, b) => degNorm(a.long) - degNorm(b.long)
  );

  // p：行星在canvas的位置
  const p = sortedPlanets.map((x) => degNorm(x.long + 180 - firstCupsLong));

  // Adjust planet positions to avoid overlap
  for (let i = 0; i < p.length; i++) {
    let n = 0;
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
    const originalAngle = sortedPlanets[i].long + 180 - firstCupsLong;

    // 先画行星指示线，以保证行星名字的图层能在指示线之上
    // 文字中心位置
    const x_text = cx + ((r * 8) / 9.0) * cos(angle);
    const y_text = cy - ((r * 8) / 9.0) * sin(angle);
    const x_circle = cx + r * cos(originalAngle);
    const y_circle = cy - r * sin(originalAngle);

    // (x0, y0), (x1, y1)组成的直线方程是：
    // x-x0=(x1-x0)t
    // y-y0=(y1-y0)t
    // 圆心(cx,cy),r= r*8.5/9.0 作为标示线的起点
    // 直线与圆交点：
    // ((x1-x0)t+x0-cx)^2+((y1-y0)t+y0-cy)^2=(r*8.4/9.0)^2
    // 在t=0处作牛顿迭代，求出t>0的值
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
      stroke: 'black',
      strokeDashArray: [3, 2],
    });

    // Planet symbol
    const planetString = config.planetFontString(sortedPlanets[i].name);
    let fontSize = planetString.length > 1 ? 15 : 30;
    elements.push({
      type: 'text',
      text: planetString,
      left: x_text,
      top: y_text,
      fontSize: fontSize,
      fontFamily: config.planetFontFamily(sortedPlanets[i].name),
    });

    // Planet position (degrees, sign, minutes)
    fontSize = 15;

    const radii = isNative
      ? {
          degreeX: 6.8 / 9.0,
          degreeY: 6.6 / 9.0,
          zodiac: 5.5 / 9.0,
          minute: 4.5 / 9.0,
          retrograde: 3.5 / 9.0,
        }
      : {
          degreeX: 7 / 9.0,
          degreeY: 7 / 9.0,
          zodiac: 6.5 / 9.0,
          minute: 6 / 9.0,
          retrograde: 5.5 / 9.0,
        };

    addPlanetDetails(elements, config, {
      cx,
      cy,
      r,
      angle,
      planet: sortedPlanets[i],
      fontSize,
      radii,
    });
  }
  return elements;
}

/**
 * 画相位
 * @param aspects 相位
 * @param aspectCanvas 相位canvas
 * @param options 相位图的相关参数
 */
export function drawAspect(
  aspects: readonly Aspect[],
  aspectCanvas: fabric.StaticCanvas,
  config: Readonly<Horoconfig>,
  options: Readonly<{ width: number; height: number }>
): void {
  const planets = config.horoPlanets;
  const gridElements = calculateAspectGrid(
    planets,
    options.width,
    options.height
  );
  const textElements = calculateAspectText(
    aspects,
    planets,
    config,
    options.width,
    options.height
  );
  renderElements(aspectCanvas, [...gridElements, ...textElements], options);
}

/**
 * 绘制天宫图
 * @param horosco 天宫图数据
 * @param canvas 天宫图canvas
 * @param options 天宫图图的相关参数
 */
export function drawHorosco(
  horosco: Readonly<HoroscopeComparison>,
  canvas: fabric.StaticCanvas,
  config: Readonly<Horoconfig>,
  options: Readonly<{ width: number; height: number }>
) {
  const cx = options.width / 2;
  const cy = options.height / 2;
  const r0 = options.width / 2;
  const r1 = r0 - 50;

  const houseElements = calculateHouseElements(horosco.houses_cups, config, {
    cx: cx,
    cy: cy,
    r0: r0,
    r1: r1,
  });

  const comparisonPlanets = [
    ...horosco.comparison_planets,
    horosco.comparison_asc,
    horosco.comparison_mc,
    horosco.comparison_dsc,
    horosco.comparison_ic,
    horosco.comparison_part_of_fortune,
  ];
  const comparisonPlanetElements = calculatePlanets(
    comparisonPlanets,
    horosco.houses_cups[0],
    config,
    { cx: cx, cy: cy, r: r1 },
    false
  );

  const r2 = (r1 * 1.6) / 3;
  const nativeCircle: CircleObject = {
    type: 'circle',
    left: cx - r2,
    top: cy - r2,
    radius: r2,
    fill: '',
    stroke: 'black',
  };

  const originalPlanets = [
    ...horosco.original_planets,
    horosco.original_asc,
    horosco.original_mc,
    horosco.original_dsc,
    horosco.original_ic,
    horosco.original_part_of_fortune,
  ];
  const nativePlanetElements = calculatePlanets(
    originalPlanets,
    horosco.houses_cups[0],
    config,
    { cx: cx, cy: cy, r: r2 },
    true
  );

  renderElements(
    canvas,
    [
      ...houseElements,
      ...comparisonPlanetElements,
      nativeCircle,
      ...nativePlanetElements,
    ],
    options
  );
}
