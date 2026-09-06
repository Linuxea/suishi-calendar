import { describe, expect, it } from 'vitest'
import type { CalEvent } from '../../types'
import { nextOccurrence, occursOn } from '../repeat'

function ev(partial: Partial<CalEvent>): CalEvent {
  return {
    id: 't1',
    title: '测试',
    date: '2026-09-06',
    color: 'red',
    repeat: 'none',
    remind: false,
    createdAt: 0,
    ...partial,
  }
}

describe('occursOn 重复规则', () => {
  it('不重复只在当天命中', () => {
    const e = ev({})
    expect(occursOn(e, '2026-09-06')).toBe(true)
    expect(occursOn(e, '2026-09-07')).toBe(false)
    expect(occursOn(e, '2026-09-05')).toBe(false)
  })

  it('每天', () => {
    const e = ev({ repeat: 'daily', date: '2026-09-06' })
    expect(occursOn(e, '2026-09-06')).toBe(true)
    expect(occursOn(e, '2027-01-01')).toBe(true)
    expect(occursOn(e, '2026-09-05')).toBe(false)
  })

  it('每周按周几', () => {
    // 2026-09-06 是周日
    const e = ev({ repeat: 'weekly', date: '2026-09-06' })
    expect(occursOn(e, '2026-09-13')).toBe(true)
    expect(occursOn(e, '2026-09-07')).toBe(false)
  })

  it('每月按日，31 号在 30 天月不命中', () => {
    const e = ev({ repeat: 'monthly', date: '2026-01-31' })
    expect(occursOn(e, '2026-03-31')).toBe(true)
    expect(occursOn(e, '2026-04-30')).toBe(false)
  })

  it('每年按月日', () => {
    const e = ev({ repeat: 'yearly', date: '2024-02-17' })
    expect(occursOn(e, '2026-02-17')).toBe(true)
    expect(occursOn(e, '2026-02-18')).toBe(false)
  })

  it('每年（农历）：正月初一生日在 2027 年正月初一命中', () => {
    // 2026-02-17 与 2027-02-06 都是农历正月初一
    const e = ev({ repeat: 'lunar-yearly', date: '2026-02-17', title: '奶奶生日' })
    expect(occursOn(e, '2027-02-06')).toBe(true)
    expect(occursOn(e, '2027-02-07')).toBe(false)
    expect(occursOn(e, '2026-02-17')).toBe(true)
  })

  it('每年（农历）：腊月三十生日在小年（廿九）年份落到除夕', () => {
    // 2025-01-28 是甲辰年腊月三十；次年腊月只有廿九（2026-02-16 除夕）
    const e = ev({ repeat: 'lunar-yearly', date: '2025-01-28', title: '爸爸生日' })
    expect(occursOn(e, '2026-02-16')).toBe(true)
    expect(occursOn(e, '2026-02-17')).toBe(false)
  })

  it('每年（农历）：闰月生日在平年同序号月命中', () => {
    // 2025-07-25 是闰六月初一；2026-07-14? 需要平年六月初一：2026 年六月初一为 2026-07-14
    const e = ev({ repeat: 'lunar-yearly', date: '2025-07-25', title: '闰月生日' })
    expect(occursOn(e, '2026-07-14')).toBe(true)
    expect(occursOn(e, '2026-07-15')).toBe(false)
  })
})

describe('nextOccurrence', () => {
  it('过去的一次性事件返回 null', () => {
    const e = ev({ repeat: 'none', date: '2026-01-01' })
    expect(nextOccurrence(e, '2026-09-06')).toBeNull()
  })

  it('从今天起找下一次', () => {
    const e = ev({ repeat: 'weekly', date: '2026-08-30', title: '周日跑步' })
    expect(nextOccurrence(e, '2026-09-06')).toBe('2026-09-06')
    expect(nextOccurrence(e, '2026-09-07')).toBe('2026-09-13')
  })
})
