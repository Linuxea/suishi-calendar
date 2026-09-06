import { create } from 'zustand'
import type { CalEvent, Settings } from './types'
import { loadEvents, loadSettings, saveEvents, saveSettings } from './lib/storage'
import { todayYmd, toYmd } from './lib/date'

interface EditorTarget {
  date: string
  event?: CalEvent
}

interface AppState {
  viewYear: number
  viewMonth: number
  selected: string
  events: CalEvent[]
  settings: Settings
  /** 法定节假日数据异步加载完成后递增，驱动格子重算 */
  holidayVersion: number
  editing: EditorTarget | null
  settingsOpen: boolean

  setView: (year: number, month: number) => void
  shiftMonth: (delta: number) => void
  goToday: () => void
  select: (ymd: string) => void
  upsertEvent: (ev: CalEvent) => void
  removeEvent: (id: string) => void
  replaceAll: (events: CalEvent[], settings: Settings) => void
  updateSettings: (patch: Partial<Settings>) => void
  bumpHolidays: () => void
  openEditor: (date: string, event?: CalEvent) => void
  closeEditor: () => void
  setSettingsOpen: (open: boolean) => void
}

const now = new Date()
const today = todayYmd()

export const useStore = create<AppState>((set, get) => ({
  viewYear: now.getFullYear(),
  viewMonth: now.getMonth() + 1,
  selected: today,
  events: loadEvents(),
  settings: loadSettings(),
  holidayVersion: 0,
  editing: null,
  settingsOpen: false,

  setView: (year, month) => set({ viewYear: year, viewMonth: month }),

  shiftMonth: (delta) => {
    const { viewYear, viewMonth } = get()
    let y = viewYear
    let m = viewMonth + delta
    if (m < 1) {
      m = 12
      y--
    } else if (m > 12) {
      m = 1
      y++
    }
    set({ viewYear: y, viewMonth: m })
  },

  goToday: () => {
    const d = new Date()
    set({
      viewYear: d.getFullYear(),
      viewMonth: d.getMonth() + 1,
      selected: todayYmd(),
    })
  },

  select: (ymd) => {
    const [y, m] = ymd.split('-').map(Number)
    set({ selected: ymd, viewYear: y, viewMonth: m })
  },

  upsertEvent: (ev) => {
    const events = get().events
    const idx = events.findIndex((e) => e.id === ev.id)
    const next = idx >= 0 ? events.map((e) => (e.id === ev.id ? ev : e)) : [...events, ev]
    saveEvents(next)
    set({ events: next })
  },

  removeEvent: (id) => {
    const next = get().events.filter((e) => e.id !== id)
    saveEvents(next)
    set({ events: next })
  },

  replaceAll: (events, settings) => {
    saveEvents(events)
    saveSettings(settings)
    set({ events, settings })
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch }
    saveSettings(settings)
    set({ settings })
  },

  bumpHolidays: () => set((s) => ({ holidayVersion: s.holidayVersion + 1 })),

  openEditor: (date, event) => set({ editing: { date, event } }),
  closeEditor: () => set({ editing: null }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}))

export function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ymdOf(y: number, m: number, d: number): string {
  return toYmd(y, m, d)
}
