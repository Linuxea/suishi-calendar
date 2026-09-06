import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, exportPayload, parseImport } from '../storage'

const backing = new Map<string, string>()

beforeEach(() => {
  backing.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => void backing.set(k, v),
    removeItem: (k: string) => void backing.delete(k),
  })
})

const goodPayload = {
  app: 'suishi-calendar',
  version: 1,
  exportedAt: '2026-09-06T00:00:00.000Z',
  settings: { showAlmanac: true, notify: false },
  events: [
    {
      id: 'a1',
      title: '奶奶生日',
      date: '2026-02-17',
      time: '10:30',
      note: '买蛋糕',
      color: 'blue',
      repeat: 'lunar-yearly',
      remind: true,
      createdAt: 1,
    },
    { id: 'bad', title: '缺日期', color: 'pink', repeat: 'whatever', remind: 'yes' },
  ],
}

describe('storage 导入导出', () => {
  it('exportPayload 结构完整', () => {
    const p = exportPayload([], DEFAULT_SETTINGS)
    expect(p.app).toBe('suishi-calendar')
    expect(p.version).toBe(1)
    expect(p.exportedAt).toBeTruthy()
  })

  it('parseImport 校验事件并剔除脏数据', () => {
    const { events, settings } = parseImport(JSON.stringify(goodPayload))
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      id: 'a1',
      title: '奶奶生日',
      date: '2026-02-17',
      time: '10:30',
      color: 'blue',
      repeat: 'lunar-yearly',
      remind: true,
    })
    expect(settings).toEqual({ showAlmanac: true, notify: false })
  })

  it('非法 JSON 与陌生格式报错', () => {
    expect(() => parseImport('not json')).toThrow()
    expect(() => parseImport(JSON.stringify({ app: 'other' }))).toThrow(/格式不正确/)
  })
})
