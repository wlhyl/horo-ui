export interface DateTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

// 中国夏令时实行区间(1986-1991)
// 起始日 02:00(含)进入夏令时，结束日 02:00(不含)恢复标准时
const CHINESE_DST_RANGES: ReadonlyArray<{ start: DateTime; end: DateTime }> = [
  { start: { year: 1986, month: 5, day: 4, hour: 2, minute: 0 }, end: { year: 1986, month: 9, day: 14, hour: 2, minute: 0 } },
  { start: { year: 1987, month: 4, day: 12, hour: 2, minute: 0 }, end: { year: 1987, month: 9, day: 13, hour: 2, minute: 0 } },
  { start: { year: 1988, month: 4, day: 10, hour: 2, minute: 0 }, end: { year: 1988, month: 9, day: 11, hour: 2, minute: 0 } },
  { start: { year: 1989, month: 4, day: 16, hour: 2, minute: 0 }, end: { year: 1989, month: 9, day: 17, hour: 2, minute: 0 } },
  { start: { year: 1990, month: 4, day: 15, hour: 2, minute: 0 }, end: { year: 1990, month: 9, day: 16, hour: 2, minute: 0 } },
  { start: { year: 1991, month: 4, day: 14, hour: 2, minute: 0 }, end: { year: 1991, month: 9, day: 15, hour: 2, minute: 0 } },
]

// 折算为时间戳用于单调比较
// 注：使用本地时区构造 Date，但所有日期都用同一函数构造，时区偏移在比较时相互抵消
function toTimestamp(dt: DateTime): number {
  return new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute).getTime()
}

export function isInChineseDST(dt: DateTime): boolean {
  const t = toTimestamp(dt)
  return CHINESE_DST_RANGES.some((r) => toTimestamp(r.start) <= t && t < toTimestamp(r.end))
}
