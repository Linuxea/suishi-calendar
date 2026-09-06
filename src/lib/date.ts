/** 公历日期工具：全程使用本地时区的 Date，日期串一律 YYYY-MM-DD */

export interface Ymd {
  y: number
  m: number
  d: number
}

export function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

export function toYmd(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

export function parseYmd(s: string): Ymd {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m, d }
}

export function toDate(s: string): Date {
  const { y, m, d } = parseYmd(s)
  return new Date(y, m - 1, d)
}

export function dateToYmd(date: Date): string {
  return toYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function todayYmd(): string {
  return dateToYmd(new Date())
}

export function addDays(s: string, n: number): string {
  const d = toDate(s)
  d.setDate(d.getDate() + n)
  return dateToYmd(d)
}

/** 0=周日 … 6=周六 */
export function weekdayOf(s: string): number {
  return toDate(s).getDay()
}

/** 一周从周一开始的序号：0=周一 … 6=周日 */
export function mondayIndex(s: string): number {
  return (toDate(s).getDay() + 6) % 7
}

/** 覆盖某月的 6×7 日历格子（周一开头） */
export function monthCells(year: number, month: number): string[] {
  const first = toYmd(year, month, 1)
  const lead = mondayIndex(first)
  const start = addDays(first, -lead)
  const cells: string[] = []
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i))
  return cells
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000)
}
