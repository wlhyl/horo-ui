import * as fabric from 'fabric';

import {
  sin,
  cos,
  degNorm,
  degreeToDMS,
  zodiacLong,
  newtonIteration,
} from '../horo-math/horo-math';
import {
  Aspect,
  Horoscope,
  Planet,
  ReturnHoroscope,
} from '../../type/interface/response-data';
import { Horoconfig } from '../../services/config/horo-config.service';
import { PlanetName } from '../../type/enum/planet';

// #region Drawing Element Interfaces
interface DrawingElement {
  type: 'path' | 'text' | 'circle';
}

export interface PathObject extends DrawingElement {
  type: 'path';
  path: string;
  stroke: string;
  strokeDashArray?: number[];
  selectable?: boolean;
}

export interface TextObject extends DrawingElement {
  type: 'text';
  text: string;
  left: number;
  top: number;
  fontSize: number;
  fontFamily: string;
  selectable?: boolean;
  textAlign?: 'left' | 'center';
}

export interface CircleObject extends DrawingElement {
  type: 'circle';
  left: number;
  top: number;
  radius: number;
  fill: string;
  stroke: string;
  selectable?: boolean;
}

export type Drawable = PathObject | TextObject | CircleObject;
// #endregion

// #region Renderer
export function renderElements(
  canvas: fabric.StaticCanvas,
  elements: readonly Drawable[],
  options: Readonly<{ width: number; height: number }>
) {
  canvas.clear();
  canvas.setDimensions({ width: options.width, height: options.height });

  for (const element of elements) {
    let fabricObject: fabric.Object | null = null;
    switch (element.type) {
      case 'path':
        fabricObject = new fabric.Path(element.path, {
          stroke: element.stroke,
          strokeDashArray: element.strokeDashArray,
          selectable: element.selectable ?? false,
        });
        break;
      case 'text':
        const text = new fabric.FabricText(element.text, {
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          selectable: element.selectable ?? false,
        });
        // 根据textAlign属性决定如何对齐
        const textAlign = element.textAlign ?? 'center';
        if (textAlign === 'center') {
          // 将文本居中
          text.left = element.left;
        } else {
          // 左对齐
          text.left = element.left + text.width! / 2;
        }
        text.top = element.top;// - text.height! / 2;
        fabricObject = text;
        break;
      case 'circle':
        fabricObject = new fabric.Circle({
          left: element.left,
          top: element.top,
          radius: element.radius,
          fill: element.fill,
          stroke: element.stroke,
          selectable: element.selectable ?? false,
        });
        break;
    }
    if (fabricObject) {
      canvas.add(fabricObject);
    }
  }
}
// #endregion

// #region Aspect Chart Calculations
export function calculateAspectGrid(
  planets: readonly PlanetName[],
  width: number,
  height: number
): PathObject[] {
  const elements: PathObject[] = [];
  const col = planets.length + 1;
  const row = col;

  // Horizontal lines
  for (let i = 1; i < col; i++) {
    const x0 = width / row;
    let y0 = (i * height) / col;
    const x1 = (width / row) * (i + 1);
    let y1 = y0;

    elements.push({
      type: 'path',
      path: `M ${x0}, ${y0} L ${x1} ${y1}`,
      stroke: 'black',
    });

    if (i === col - 1) {
      y0 += height / col;
      y1 = y0;
      elements.push({
        type: 'path',
        path: `M ${x0}, ${y0} L ${x1} ${y1}`,
        stroke: 'black',
      });
    }
  }

  // Vertical lines
  for (let i = 1; i < row; i++) {
    let x0 = ((i + 1) * width) / row;
    const y0 = (i * height) / row;
    let x1 = x0;
    const y1 = height;

    elements.push({
      type: 'path',
      path: `M ${x0}, ${y0} L ${x1} ${y1}`,
      stroke: 'black',
    });

    if (i === 1) {
      x0 = width / row;
      x1 = x0;
      elements.push({
        type: 'path',
        path: `M ${x0}, ${y0} L ${x1} ${y1}`,
        stroke: 'black',
      });
    }
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

  // Planet names
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const planetString = config.planetFontString(planet);
    const planetFontFamily = config.planetFontFamily(planet);
    let fontSize = width / col;
    if (planetString.length !== 1) fontSize /= planetString.length;
    else fontSize *= 0.8;

    // 画第一列
    // 第一个字符的中心坐标
    // cx=width / col / 2
    // cy = height / row * 1.5
    // 第n个字符的中心坐标
    // cx = width / col
    // cy = height / row * 1.5 + i * (height / row)
    let cx = width / col / 2;
    let cy = (height / row) * (i + 1.5);
    elements.push({
      type: 'text',
      text: planetString,
      left: cx,
      top: cy,
      fontSize: fontSize,
      fontFamily: planetFontFamily,
    });

    // 斜列
    // 第一个字符的中心坐标
    // cx=width / col * 1.5
    // cy = height / row / * 1.5
    // 第n个字符的中心坐标
    // cx = width / col * 1.5 + i * width / col
    // cy = height / row * .5 + i * (height / row)
    cx = (width / col) * (1.5 + i);
    cy = (height / row) * (i + 0.5);
    elements.push({
      type: 'text',
      text: planetString,
      left: cx,
      top: cy,
      fontSize: fontSize,
      fontFamily: planetFontFamily,
    });
  }

  // Aspect symbols and values
  for (const aspect of aspects) {
    const fontSize = width / col;

    // 第一格中心的坐标，即太阳与太阳相交的格子
    // x: width / col + width / col / 2
    // y: height / row + height / row / 2
    const cx = (width / col) * (1.5 + planets.indexOf(aspect.p0));
    const cy = (height / row) * (1.5 + planets.indexOf(aspect.p1));

    // Aspect symbol
    const aspectString = config.aspectFontString(aspect.aspect_value);
    elements.push({
      type: 'text',
      text: aspectString,
      left: cx,
      top: cy,
      fontSize: fontSize,
      fontFamily: config.aspectFontFamily(),
    });

    // Aspect value
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
  }

  return elements;
}
// #endregion

// #region Horoscope Chart Calculations
export function calculateHouseElements(
  cups: readonly number[],
  config: Horoconfig,
  options: Readonly<{ cx: number; cy: number; r0: number; r1: number }>
): Drawable[] {
  const { cx, cy, r0, r1 } = options;
  const elements: Drawable[] = [];

  // Outer and inner circles
  elements.push({
    type: 'circle',
    left: cx,
    top: cy,
    radius: r0,
    fill: '',
    stroke: 'black',
  });
  elements.push({
    type: 'circle',
    left: cx,
    top: cy,
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

export function calculatePlanetElements(
  planets: readonly Planet[],
  firstCupsLong: number,
  config: Horoconfig,
  options: Readonly<{ cx: number; cy: number; r: number }>
): (TextObject | PathObject)[] {
  const { cx, cy, r } = options;
  const elements: (TextObject | PathObject)[] = [];

  const sortedPlanets = planets.toSorted(
    (a, b) => degNorm(a.long) - degNorm(b.long)
  );

  const p = sortedPlanets.map((x) => degNorm(x.long + 180 - firstCupsLong));
  const w = 6; // Minimum angle between planets

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
      strokeDashArray: [3, 2], // strokeDashArray[a,b] =》 每隔a个像素空b个像素
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
    const planetLongOnZodiac = zodiacLong(sortedPlanets[i].long);
    const planetLongDMS = degreeToDMS(planetLongOnZodiac.long);
    fontSize = 15;

    // Degrees
    let x = cx + ((r * 7) / 9.0) * cos(angle);
    let y = cy - ((r * 7) / 9.0) * sin(angle);
    elements.push({
      type: 'text',
      text: `${planetLongDMS.d};`,
      left: x,
      top: y,
      fontSize: fontSize,
      fontFamily: config.astrologyFont,
    });

    // Zodiac Sign
    x = cx + ((r * 6.5) / 9.0) * cos(angle);
    y = cy - ((r * 6.5) / 9.0) * sin(angle);
    elements.push({
      type: 'text',
      text: `${config.zodiacFontString(planetLongOnZodiac.zodiac)}`,
      left: x,
      top: y,
      fontSize: fontSize,
      fontFamily: config.astrologyFont,
    });

    // Minutes
    x = cx + ((r * 6) / 9.0) * cos(angle);
    y = cy - ((r * 6) / 9.0) * sin(angle);
    elements.push({
      type: 'text',
      text: `${planetLongDMS.m}'`,
      left: x,
      top: y,
      fontSize: fontSize,
      fontFamily: config.astrologyFont,
    });

    // Retrograde
    if (sortedPlanets[i].speed < 0) {
      x = cx + ((r * 5.5) / 9.0) * cos(angle);
      y = cy - ((r * 5.5) / 9.0) * sin(angle);
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
  return elements;
}

// 在左上角绘制说明文字
export function calculateNotesElements(
  horosco: Readonly<Horoscope>,
  config: Readonly<Horoconfig>
): TextObject[] {
  const elements: TextObject[] = [];
  const fontSize = 20;
  const lineHeight = fontSize * 1.2;
  let currentY = fontSize;

  const addNote = (text: string, font: string) => {
    elements.push({
      type: 'text',
      text: text,
      left: 0,
      textAlign: 'left',
      top: currentY,
      fontSize: fontSize,
      fontFamily: font,
    });
    currentY += lineHeight;
  };

  addNote(horosco.house_name, config.textFont);
  addNote(horosco.is_diurnal ? '白天盘' : '夜间盘', config.textFont);

  // "日主星: [SYMBOL]"
  elements.push({
    type: 'text',
    text: '日主星:',
    left: 0,
    textAlign: 'left',
    top: currentY,
    fontSize: fontSize,
    fontFamily: config.textFont,
  });
  elements.push({
    type: 'text',
    text: config.planetFontString(horosco.planetary_day),
    left: 80, // Hardcoded offset
    textAlign: 'left',
    top: currentY,
    fontSize: fontSize,
    fontFamily: config.planetFontFamily(horosco.planetary_day),
  });
  currentY += lineHeight;

  // "时主星: [SYMBOL]"
  elements.push({
    type: 'text',
    text: '时主星:',
    left: 0,
    textAlign: 'left',
    top: currentY,
    fontSize: fontSize,
    fontFamily: config.textFont,
  });
  elements.push({
    type: 'text',
    text: config.planetFontString(horosco.planetary_hours),
    left: 80, // Hardcoded offset
    textAlign: 'left',
    top: currentY,
    fontSize: fontSize,
    fontFamily: config.planetFontFamily(horosco.planetary_hours),
  });
  currentY += lineHeight;

  return elements;
}
// #endregion

// #region Public Drawing Functions
/**
 * Draws an aspect grid.
 * @param aspects Aspect data.
 * @param aspectCanvas The canvas to draw on.
 * @param config Drawing configuration.
 * @param options Canvas dimensions.
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
 * Draws a horoscope chart.
 * @param horosco Horoscope data.
 * @param canvas The canvas to draw on.
 * @param config Drawing configuration.
 * @param options Canvas dimensions.
 */
export function drawHorosco(
  horosco: Readonly<Horoscope>,
  canvas: fabric.StaticCanvas,
  config: Readonly<Horoconfig>,
  options: Readonly<{ width: number; height: number }>
) {
  const cx = options.width / 2;
  const cy = options.height / 2;
  const r0 = options.width / 2;
  const r1 = r0 - 50;

  const houseElements = calculateHouseElements(horosco.houses_cups, config, {
    cx,
    cy,
    r0,
    r1,
  });
  const planetElements = calculatePlanetElements(
    [
      ...horosco.planets,
      horosco.asc,
      horosco.mc,
      horosco.dsc,
      horosco.ic,
      horosco.part_of_fortune,
    ],
    horosco.houses_cups[0],
    config,
    { cx, cy, r: r1 }
  );
  const noteElements = calculateNotesElements(horosco, config);

  renderElements(
    canvas,
    [...houseElements, ...planetElements, ...noteElements],
    options
  );
}

/**
 * Draws a return horoscope chart.
 * @param horosco Return horoscope data.
 * @param canvas The canvas to draw on.
 * @param config Drawing configuration.
 * @param options Canvas dimensions.
 */
export function drawReturnHorosco(
  horosco: Readonly<ReturnHoroscope>,
  canvas: fabric.StaticCanvas,
  config: Readonly<Horoconfig>,
  options: Readonly<{ width: number; height: number }>
) {
  const cx = options.width / 2;
  const cy = options.height / 2;
  const r0 = options.width / 2;
  const r1 = r0 - 50;

  const houseElements = calculateHouseElements(horosco.houses_cups, config, {
    cx,
    cy,
    r0,
    r1,
  });
  const planetElements = calculatePlanetElements(
    [
      ...horosco.planets,
      horosco.asc,
      horosco.mc,
      horosco.dsc,
      horosco.ic,
      horosco.part_of_fortune,
    ],
    horosco.houses_cups[0],
    config,
    { cx, cy, r: r1 }
  );

  renderElements(canvas, [...houseElements, ...planetElements], options);
}
// #endregion
