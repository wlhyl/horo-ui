import { degNorm, inCircularRange, zodiacLong } from '../horo-math/horo-math'
import { Result } from '../../type/interface/result'

export const HOUSE_OFFSET = 5

/**
 * 调整宫位边界：若 cusp - offset 跨越星座边界，则取 cusp 所在星座的 0 度
 * @param cusp 宫头黄道经度
 * @param offset 偏移度数
 * @returns 调整后的边界经度
 */
function adjustCuspBoundary(cusp: number, offset: number): number {
  const raw = degNorm(cusp - offset)
  const cuspSign = zodiacLong(cusp).zodiac
  const rawSign = zodiacLong(raw).zodiac
  return rawSign === cuspSign ? raw : cuspSign * 30
}

/**
 * 计算行星所在宫位（1-12），使用 5 度规则：
 * 第 n 宫区间为 [cusp_n - 5, cusp_{n+1} - 5)
 * 若 cusp - 5 跨越星座边界，则取 cusp 所在星座的 0 度
 * @param planetLong 行星黄道经度
 * @param cusps 12 宫头黄经数组，cusps[0] 为 1 宫头（ASC）
 * @returns 成功时返回宫位编号 1-12，失败时返回错误信息
 */
export function getPlanetHouse(planetLong: number, cusps: readonly number[]): Result<number, string> {
  const normalizedLong = degNorm(planetLong)
  for (let n = 0; n < 12; n++) {
    const a = cusps[n]
    const b = cusps[(n + 1) % 12]
    const a0 = adjustCuspBoundary(a, HOUSE_OFFSET)
    const b0 = adjustCuspBoundary(b, HOUSE_OFFSET)
    if (inCircularRange(normalizedLong, a0, b0)) {
      return { ok: true, value: n + 1 }
    }
  }
  return { ok: false, error: `行星经度 ${planetLong} 未匹配到任何宫位` }
}
