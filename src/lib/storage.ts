import type { CalEvent, Settings } from '../types'
import { EVENT_COLORS } from '../types'

const EVENTS_KEY = 'suishi.events.v1'
const SETTINGS_KEY = 'suishi.settings.v1'

export const DEFAULT_SETTINGS: Settings = { showAlmanac: true, notify: false }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function coerceEvent(v: unknown): CalEvent | null {
  if (!isRecord(v)) return null
  if (typeof v.id !== 'string' || typeof v.title !== 'string' || typeof v.date !== 'string') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return null
  const color = EVENT_COLORS.includes(v.color as CalEvent['color']) ? (v.color as CalEvent['color']) : 'red'
  const repeat = (
    ['none', 'daily', 'weekly', 'monthly', 'yearly', 'lunar-yearly'] as const
  ).includes(v.repeat as CalEvent['repeat'])
    ? (v.repeat as CalEvent['repeat'])
    : 'none'
  return {
    id: v.id,
    title: v.title,
    date: v.date,
    time: typeof v.time === 'string' && /^\d{2}:\d{2}$/.test(v.time) ? v.time : undefined,
    note: typeof v.note === 'string' ? v.note : undefined,
    color,
    repeat,
    remind: v.remind === true,
    createdAt: typeof v.createdAt === 'number' ? v.createdAt : Date.now(),
  }
}

export function loadEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(coerceEvent).filter((e): e is CalEvent => e !== null)
  } catch {
    return []
  }
}

export function saveEvents(events: CalEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  } catch {
    /* 存储不可用时静默 */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return { ...DEFAULT_SETTINGS }
    return {
      showAlmanac: parsed.showAlmanac !== false,
      notify: parsed.notify === true,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* 同上 */
  }
}

export interface ExportPayload {
  app: 'suishi-calendar'
  version: 1
  exportedAt: string
  events: CalEvent[]
  settings: Settings
}

export function exportPayload(events: CalEvent[], settings: Settings): ExportPayload {
  return {
    app: 'suishi-calendar',
    version: 1,
    exportedAt: new Date().toISOString(),
    events,
    settings,
  }
}

/** 校验并提取导入数据，格式不对时抛错 */
export function parseImport(text: string): { events: CalEvent[]; settings: Settings } {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('不是有效的 JSON 文件')
  }
  if (!isRecord(parsed) || parsed.app !== 'suishi-calendar' || !Array.isArray(parsed.events)) {
    throw new Error('文件格式不正确，请使用「岁时」导出的备份文件')
  }
  const events = parsed.events.map(coerceEvent).filter((e): e is CalEvent => e !== null)
  const s = isRecord(parsed.settings) ? parsed.settings : {}
  const settings: Settings = {
    showAlmanac: s.showAlmanac !== false,
    notify: s.notify === true,
  }
  return { events, settings }
}
