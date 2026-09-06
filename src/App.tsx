import { useEffect } from 'react'
import { useStore } from './store'
import { HeaderBar } from './components/HeaderBar'
import { MonthGrid } from './components/MonthGrid'
import { DayPanel } from './components/DayPanel'
import { EventEditor } from './components/EventEditor'
import { SettingsDialog } from './components/SettingsDialog'
import { ensureHolidayYears } from './lib/holidays'
import { checkAndNotify } from './lib/notify'
import { todayYmd } from './lib/date'

export default function App() {
  const viewYear = useStore((s) => s.viewYear)
  const events = useStore((s) => s.events)
  const notifyOn = useStore((s) => s.settings.notify)
  const bumpHolidays = useStore((s) => s.bumpHolidays)
  const editing = useStore((s) => s.editing)
  const settingsOpen = useStore((s) => s.settingsOpen)

  // 浏览前后年份的法定节假日（当前年已有内置快照）
  useEffect(() => {
    let alive = true
    ensureHolidayYears([viewYear - 1, viewYear, viewYear + 1]).then(() => {
      if (alive) bumpHolidays()
    })
    return () => {
      alive = false
    }
  }, [viewYear, bumpHolidays])

  // 每半分钟检查一次到点事件
  useEffect(() => {
    const tick = () => checkAndNotify(events, todayYmd(), new Date(), notifyOn)
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [events, notifyOn])

  return (
    <div className="app">
      <HeaderBar />
      <main className="layout">
        <MonthGrid />
        <DayPanel />
      </main>
      {editing && <EventEditor key={editing.event?.id ?? `new-${editing.date}`} />}
      {settingsOpen && <SettingsDialog />}
    </div>
  )
}
