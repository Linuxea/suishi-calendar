import { Lunar, LunarMonth } from 'lunar-typescript'
import type { CalEvent } from '../types'
import { addDays, mondayIndex, parseYmd, toDate } from './date'

/** 某事件是否落在某日（含重复规则展开） */
export function occursOn(event: CalEvent, ymd: string): boolean {
  if (ymd < event.date) return false
  switch (event.repeat) {
    case 'none':
      return ymd === event.date
    case 'daily':
      return true
    case 'weekly':
      return mondayIndex(ymd) === mondayIndex(event.date)
    case 'monthly':
      return parseYmd(ymd).d === parseYmd(event.date).d
    case 'yearly':
      return ymd.slice(5) === event.date.slice(5)
    case 'lunar-yearly': {
      const cur = Lunar.fromDate(toDate(ymd))
      const start = Lunar.fromDate(toDate(event.date))
      // 闰月与平月同号：生日设在今年闰四月时，平年四月也过（取绝对值比较）
      if (Math.abs(cur.getMonth()) !== Math.abs(start.getMonth())) return false
      const curCount = LunarMonth.fromYm(cur.getYear(), cur.getMonth())?.getDayCount() ?? 30
      if (cur.getDay() === start.getDay()) return true
      // 起始日为三十、当年该月只有廿九：落到当月最后一天
      return start.getDay() > curCount && cur.getDay() === curCount
    }
  }
}

/** 从 fromYmd（含）起第一次出现的日期；找不到返回 null */
export function nextOccurrence(event: CalEvent, fromYmd: string, maxScan = 400): string | null {
  let s = fromYmd
  for (let i = 0; i <= maxScan; i++) {
    if (occursOn(event, s)) return s
    s = addDays(s, 1)
  }
  return null
}
