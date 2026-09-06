import { describe, expect, it } from 'vitest'
import { cellSubLabel, getDayInfo } from '../lunar'
import { toDate } from '../date'

function info(ymd: string) {
  return getDayInfo(toDate(ymd))
}

describe('getDayInfo 历法', () => {
  it('2026-02-17 丙午年春节', () => {
    const d = info('2026-02-17')
    expect(d.lunarDayCn).toBe('初一')
    expect(d.lunarFestivals).toContain('春节')
    expect(d.yearGanZhi).toBe('丙午')
    expect(d.yearShengXiao).toBe('马')
    expect(d.lunarFullCn).toBe('二〇二六年正月初一')
  })

  it('2026-02-16 除夕（腊月只有廿九）', () => {
    const d = info('2026-02-16')
    expect(d.lunarFestivals).toContain('除夕')
    expect(d.lunarDayCn).toBe('廿九')
  })

  it('闰月自带「闰」前缀', () => {
    const d = info('2025-07-25')
    expect(d.lunarMonthCn).toBe('闰六')
  })

  it('节气当天与下一节气', () => {
    const d = info('2026-09-07')
    expect(d.jieQi).toBe('白露')
    expect(d.nextJieQiName).toBe('秋分')
  })

  it('宜忌与冲煞有内容', () => {
    const d = info('2026-09-06')
    expect(d.yi.length).toBeGreaterThan(0)
    expect(d.ji.length).toBeGreaterThan(0)
    expect(d.chong).toMatch(/牛/)
    expect(d.dayGanZhi).toBe('癸未')
  })
})

describe('cellSubLabel 优先级', () => {
  it('节气优先于农历日', () => {
    const sub = cellSubLabel(info('2026-09-07'))
    expect(sub).toEqual({ text: '白露', cls: 'sub-jieqi' })
  })

  it('节日优先于农历日', () => {
    const sub = cellSubLabel(info('2026-02-17'))
    expect(sub.text).toBe('春节')
    expect(sub.cls).toBe('sub-festival')
  })

  it('初一显示月名', () => {
    const sub = cellSubLabel(info('2026-09-11'))
    // 2026-09-11 为八月初一
    expect(sub).toEqual({ text: '八月', cls: 'sub-term' })
  })

  it('普通日显示农历日', () => {
    const sub = cellSubLabel(info('2026-09-06'))
    expect(sub).toEqual({ text: '廿五', cls: 'sub-lunar' })
  })
})
