import { Zodiac } from '../../type/enum/zodiac';

/**
 *
 * @param x 单位：度
 * @returns 正弦值
 */
export function sin(x: number): number {
  return Math.sin((x * Math.PI) / 180);
}

/**
 *
 * @param x 单位：度
 * @returns 余弦值
 */
export function cos(x: number): number {
  return Math.cos((x * Math.PI) / 180);
}

// /**
//  *
//  * @param x [-1, 1]
//  * @returns 反正弦，单位：度
//  */
// export function asin(x :number) :number{
//     return Math.asin(x) * 180 / Math.PI
// }

/**
 *
 * @param x 度数
 * @returns 将度数调整到[0, 360)
 */
export function degNorm(x: number): number {
  while (x < 0) x += 360;
  while (x >= 360) x -= 360;
  return x;
}

/**
 *
 * @param degree 度数
 * @returns 返回度数的，度、分、秒，秒不作四舍五入
 */
export function degreeToDMS(degree: number): {
  d: number;
  m: number;
  s: number;
} {
  const l = Math.abs(degree);
  const d = Math.floor(l);
  // 不使用 (l - d) * 60
  // 如：l=1.2，使用此种方法,l-d=11.999999999
  // 丢失精度
  const m = Math.floor(l * 60 - d * 60);
  const s = Math.floor(l * 3600 - d * 3600 - m * 60);

  return degree >= 0 ? { d, m, s } : { d: -d, m: -m, s: -s };
}

/**
 * 得到给定黄道经度的星座度数
 * @param long 黄道经度
 * @returns 星座id和星座上的度数
 */
export function zodiacLong(long: number): { zodiac: Zodiac; long: number } {
  const normalizedDegree = degNorm(long);
  const zodiacIndex = Math.floor(normalizedDegree / 30);

  return { zodiac: zodiacIndex, long: normalizedDegree - zodiacIndex * 30 };
}

/**
 * NewtonIteration 牛顿迭代法求解方程的根
 */
export function newtonIteration(
  init_value: number,
  f: (x: number) => number
): number {
  const epsilon = 1e-7;
  const delta = 5e-6;
  let x = 0.0;
  let x0 = init_value;

  for (let i = 0; i < 1000; i++) {
    x = x0;
    const fx = f(x);

    // 导数
    const fx_delta = f(x + delta);

    const fpx = (fx_delta - fx) / delta;
    x0 = x - fx / fpx;
    if (Math.abs(x0 - x) <= epsilon) {
      break;
    }
  }
  if (Math.abs(x0 - x) <= epsilon) {
    return x;
  } else {
    throw '1000次迭代，求解失败，调整初值重试';
  }
}
