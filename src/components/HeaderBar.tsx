import { useMemo } from 'react'
import { useStore } from '../store'
import { getDayInfo } from '../lib/lunar'
import { toDate } from '../lib/date'

export function HeaderBar() {
  const viewYear = useStore((s) => s.viewYear)
  const viewMonth = useStore((s) => s.viewMonth)
  const shiftMonth = useStore((s) => s.shiftMonth)
  const goToday = useStore((s) => s.goToday)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)

  // 取当月 15 日的干支年，能正确反映正在浏览的农历年（含跨春节月份）
  const gz = useMemo(
    () => getDayInfo(toDate(`${viewYear}-${String(viewMonth).padStart(2, '0')}-15`)),
    [viewYear, viewMonth],
  )

  return (
    <header className="header">
      <div className="brand">
        <span className="seal" aria-hidden>
          岁
        </span>
        <div className="brand-text">
          <h1>岁时</h1>
          <span className="brand-sub">
            {gz.yearGanZhi}年 · {gz.yearShengXiao}
          </span>
        </div>
      </div>

      <div className="nav">
        <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="上一月">
          ‹
        </button>
        <span className="nav-title">
          {viewYear}年{viewMonth}月
        </span>
        <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label="下一月">
          ›
        </button>
        <button type="button" className="btn btn-outline" onClick={goToday}>
          今天
        </button>
      </div>

      <button type="button" className="btn btn-ghost" onClick={() => setSettingsOpen(true)}>
        设置
      </button>
    </header>
  )
}
