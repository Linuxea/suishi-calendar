import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, monthCells, mondayIndex, toYmd } from '../date'

describe('date 工具', () => {
  it('mondayIndex 周一为 0', () => {
    // 2026-09-06 是周日，2026-08-31 是周一
    expect(mondayIndex('2026-09-06')).toBe(6)
    expect(mondayIndex('2026-08-31')).toBe(0)
  })

  it('monthCells 生成 6×7=42 格且包含整月', () => {
    const cells = monthCells(2026, 9)
    expect(cells).toHaveLength(42)
    expect(cells).toContain('2026-09-01')
    expect(cells).toContain('2026-09-30')
    // 2026-09-01 是周二，格子应从周一开始
    expect(cells[0]).toBe('2026-08-31')
    expect(mondayIndex(cells[0])).toBe(0)
    expect(mondayIndex(cells[7])).toBe(0)
  })

  it('addDays 跨月', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('daysBetween', () => {
    expect(daysBetween('2026-09-06', '2026-09-07')).toBe(1)
    expect(daysBetween('2026-09-07', '2026-09-06')).toBe(-1)
    expect(toYmd(2026, 9, 6)).toBe('2026-09-06')
  })
})
