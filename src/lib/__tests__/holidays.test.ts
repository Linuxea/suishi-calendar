import { describe, expect, it } from 'vitest'
import { getDayStatus } from '../holidays'
import { weekdayOf } from '../date'

describe('getDayStatus 法定节假日', () => {
  it('法定休假日', () => {
    const s = getDayStatus('2026-10-01', weekdayOf('2026-10-01'))
    expect(s).toEqual({ kind: 'off', label: '国庆节' })
    expect(getDayStatus('2026-09-25', 5).label).toBe('中秋节')
  })

  it('调休补班日', () => {
    const s = getDayStatus('2026-09-20', weekdayOf('2026-09-20'))
    expect(s).toEqual({ kind: 'work', label: '国庆节' })
  })

  it('普通周末与工作日', () => {
    // 2026-09-06 周日，2026-09-07 周一，均无调休数据
    expect(getDayStatus('2026-09-06', 0)).toEqual({ kind: 'weekend' })
    expect(getDayStatus('2026-09-07', 1)).toEqual({ kind: 'weekday' })
  })
})
