import { Horoconfig } from '../../services/config/horo-config.service';
import { HoroscopeComparison } from '../../type/interface/response-data';
import * as fabric from 'fabric';
import {
  cos,
  degNorm,
  degreeToDMS,
  sin,
  zodiacLong,
} from '../horo-math/horo-math';
import { Drawable, renderElements } from './horo';
import { calculatePlanets } from './compare';

// 星盘图的宫位的宽度
const houseWidth = 50;

/**
 * 计算星盘的宫位元素
 * @param cups 星盘的宫头黄经度数
 * @param original_first_cups 被比较的星盘的第一宫的黄经度数
 * @param config 配置
 * @param options 星盘图的相关参数
 * @param options.cx 星图的中心x坐标
 * @param options.cy 星图的中心y坐标
 * @param options.r0 -星图宫位的半径，即星图最外的圆
 * @param options.r1 星盘图的宫位的内圆半径
 * @returns 星盘的宫位元素
 */
export function calculateHouseElements(
  cups: readonly number[],
  original_first_cups: number,
  config: Readonly<Horoconfig>,
  options: Readonly<{ cx: number; cy: number; r0: number; r1: number }>,
  original = true
): Drawable[] {
  const { cx, cy, r0 } = options;
  const r1 = original ? 0 : options.r1;
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

  // 星座圈的内圈圆
  elements.push({
    type: 'circle',
    left: cx,
    top: cy,
    radius: r0 - houseWidth,
    fill: '',
    stroke: 'black',
  });

  if (r1 > 0) {
    elements.push({
      type: 'circle',
      left: cx,
      top: cy,
      radius: r1,
      fill: '',
      stroke: 'black',
    });
  }

  // 宫头在canvas中的角度
  // 第一宫在cups[0],在180度
  const cupsOfImage: number[] = cups.map((x) => x + 180 - original_first_cups);

  for (let i = 0; i < cupsOfImage.length; i++) {
    const cupAngle = cupsOfImage[i];
    {
      // 宫头线
      const x0 = cx + (r0 - houseWidth) * cos(cupAngle);
      const y0 = cy - (r0 - houseWidth) * sin(cupAngle);

      const x1 = cx + r1 * cos(cupAngle);
      const y1 = cy - r1 * sin(cupAngle);

      elements.push({
        type: 'path',
        path: `M ${x1}, ${y1} L ${x0} ${y0}`,
        stroke: 'black',
      });
    }

    {
      // 计算并画宫位号，计算文字的圆心
      // d: 宫位宽度，>=0
      // (r0-r1)/8+r1
      const ratio = original ? 8 : 20;
      const d = degNorm(cupsOfImage[(i + 1) % cupsOfImage.length] - cupAngle);
      let x0 = cx + ((r0 - r1) / ratio + r1) * cos(cupAngle + d / 2);
      let y0 = cy - ((r0 - r1) / ratio + r1) * sin(cupAngle + d / 2);
      elements.push({
        type: 'text',
        text: `${i + 1}`,
        left: x0,
        top: y0,
        fontSize: 10,
        fontFamily: config.textFont,
      });
    }

    const cupsZodiacLong = zodiacLong(cups[i]);
    const fontSize = houseWidth / 4;
    {
      // Zodiac signs on cusps

      const x = cx + (r0 - houseWidth / 2) * cos(cupAngle);
      const y = cy - (r0 - houseWidth / 2) * sin(cupAngle);
      elements.push({
        type: 'text',
        text: `${config.zodiacFontString(cupsZodiacLong.zodiac)}`,
        left: x,
        top: y,
        fontSize: fontSize * 1.5,
        fontFamily: config.zodiacFontFamily(),
      });
    }

    {
      // 宫头的度和分
      const cupsZodiacLongDMS = degreeToDMS(cupsZodiacLong.long);
      const angleOffset = original ? 5 : 3;
      const textRadius = r0 - houseWidth / 2;

      const dAngle = i < 7 ? cupAngle - angleOffset : cupAngle + angleOffset;

      const x0 = cx + textRadius * cos(dAngle);
      const y0 = cy - textRadius * sin(dAngle);
      elements.push({
        type: 'text',
        text: `${cupsZodiacLongDMS.d};`,
        left: x0,
        top: y0,
        fontSize: fontSize,
        fontFamily: config.astrologyFont,
      });

      const mAngle = i < 7 ? cupAngle + angleOffset : cupAngle - angleOffset;
      const x1 = cx + textRadius * cos(mAngle);
      const y1 = cy - textRadius * sin(mAngle);
      elements.push({
        type: 'text',
        text: `${cupsZodiacLongDMS.m}'`,
        left: x1,
        top: y1,
        fontSize: fontSize,
        fontFamily: config.astrologyFont,
      });
    }
  }
  return elements;
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

  // 画原盘宫痊
  const originalHouseElements = calculateHouseElements(
    horosco.houses_cups,
    horosco.houses_cups[0],
    config,
    {
      cx: cx,
      cy: cy,
      r0: r0 / 2,
      r1: 0,
    }
  );

  // 画比较盘宫位
  const compareHouseElements = calculateHouseElements(
    horosco.comparison_cups,
    horosco.houses_cups[0],
    config,
    {
      cx: cx,
      cy: cy,
      r0: r0,
      r1: r0 / 2,
    },
    false
  );

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
    { cx: cx, cy: cy, r: r0 - houseWidth },
    false
  );

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
    { cx: cx, cy: cy, r: r0 / 2 - houseWidth },
    true
  );

  renderElements(
    canvas,
    [
      ...originalHouseElements,
      ...compareHouseElements,
      ...comparisonPlanetElements,
      ...nativePlanetElements,
    ],
    options
  );
}
