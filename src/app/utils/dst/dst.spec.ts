import { isInChineseDST } from './dst'

describe('isInChineseDST', () => {
  describe('1986', () => {
    it('应在起始日 02:00 之前返回 false', () => {
      expect(isInChineseDST({ year: 1986, month: 5, day: 4, hour: 1, minute: 59 })).toBe(false)
    })

    it('应在起始日 02:00(含)返回 true', () => {
      expect(isInChineseDST({ year: 1986, month: 5, day: 4, hour: 2, minute: 0 })).toBe(true)
    })

    it('应在区间内返回 true', () => {
      expect(isInChineseDST({ year: 1986, month: 7, day: 1, hour: 12, minute: 0 })).toBe(true)
    })

    it('应在结束日 02:00 之前返回 true', () => {
      expect(isInChineseDST({ year: 1986, month: 9, day: 14, hour: 1, minute: 59 })).toBe(true)
    })

    it('应在结束日 02:00(不含)返回 false', () => {
      expect(isInChineseDST({ year: 1986, month: 9, day: 14, hour: 2, minute: 0 })).toBe(false)
    })

    it('应在结束日之后返回 false', () => {
      expect(isInChineseDST({ year: 1986, month: 9, day: 15, hour: 0, minute: 0 })).toBe(false)
    })

    it('应在起始日之前返回 false', () => {
      expect(isInChineseDST({ year: 1986, month: 5, day: 3, hour: 12, minute: 0 })).toBe(false)
    })
  })

  describe('1987-1991 各年区间内', () => {
    it('1987 年区间内返回 true', () => {
      expect(isInChineseDST({ year: 1987, month: 6, day: 15, hour: 0, minute: 0 })).toBe(true)
    })

    it('1988 年区间内返回 true', () => {
      expect(isInChineseDST({ year: 1988, month: 6, day: 15, hour: 0, minute: 0 })).toBe(true)
    })

    it('1989 年区间内返回 true', () => {
      expect(isInChineseDST({ year: 1989, month: 6, day: 15, hour: 0, minute: 0 })).toBe(true)
    })

    it('1990 年区间内返回 true', () => {
      expect(isInChineseDST({ year: 1990, month: 6, day: 15, hour: 0, minute: 0 })).toBe(true)
    })

    it('1991 年区间内返回 true', () => {
      expect(isInChineseDST({ year: 1991, month: 6, day: 15, hour: 0, minute: 0 })).toBe(true)
    })

    it('1991 年结束日 02:00 返回 false', () => {
      expect(isInChineseDST({ year: 1991, month: 9, day: 15, hour: 2, minute: 0 })).toBe(false)
    })
  })

  describe('非夏令时年份', () => {
    it('1985 年始终返回 false', () => {
      expect(isInChineseDST({ year: 1985, month: 7, day: 1, hour: 12, minute: 0 })).toBe(false)
    })

    it('1992 年始终返回 false', () => {
      expect(isInChineseDST({ year: 1992, month: 7, day: 1, hour: 12, minute: 0 })).toBe(false)
    })

    it('2000 年始终返回 false', () => {
      expect(isInChineseDST({ year: 2000, month: 7, day: 1, hour: 12, minute: 0 })).toBe(false)
    })
  })

  describe('边缘用例（防止旧 toMinutes 算法回归）', () => {
    it('5月31日 23:59 与 6月1日 00:00 不应碰撞（旧算法按 30 天/月会判等）', () => {
      // 两者都在 1986 DST 区间内，都应为 true
      // 用 Date 实现保证时间戳严格不同，比较严格单调
      expect(isInChineseDST({ year: 1986, month: 5, day: 31, hour: 23, minute: 59 })).toBe(true)
      expect(isInChineseDST({ year: 1986, month: 6, day: 1, hour: 0, minute: 0 })).toBe(true)
    })

    it('7月31日 23:59 与 8月1日 00:00 不应碰撞', () => {
      expect(isInChineseDST({ year: 1986, month: 7, day: 31, hour: 23, minute: 59 })).toBe(true)
      expect(isInChineseDST({ year: 1986, month: 8, day: 1, hour: 0, minute: 0 })).toBe(true)
    })

    it('8月31日 23:59 与 9月1日 00:00 不应碰撞', () => {
      expect(isInChineseDST({ year: 1986, month: 8, day: 31, hour: 23, minute: 59 })).toBe(true)
      expect(isInChineseDST({ year: 1986, month: 9, day: 1, hour: 0, minute: 0 })).toBe(true)
    })

    it('12月末不应溢出到下一年（旧算法年项 525600 < 月日时分最大合计 564479）', () => {
      // 1986-12-31 23:59 不应被误判为 1987 年初从而落入 1987 DST 区间
      expect(isInChineseDST({ year: 1986, month: 12, day: 31, hour: 23, minute: 59 })).toBe(false)
    })
  })
})
