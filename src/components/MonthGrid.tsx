import { useMemo } from 'react'
import { useStore } from '../store'
import { cellSubLabel, getDayInfo, type DayInfo } from '../lib/lunar'
import { getDayStatus, type DayStatus } from '../lib/holidays'
import { monthCells, parseYmd, toDate, todayYmd, weekdayOf } from '../lib/date'
import { occursOn } from '../lib/repeat'
import { COLOR_HEX, type CalEvent } from '../types'

const WEEK = ['一', '二', '三', '四', '五', '六', '日']

export function MonthGrid() {
  const viewYear = useStore((s) => s.viewYear)
  const viewMonth = useStore((s) => s.viewMonth)
  const selected = useStore((s) => s.selected)
  const events = useStore((s) => s.events)
  // 依赖法定节假日异步加载完成的版本号，触发重算
  const holidayVersion = useStore((s) => s.holidayVersion)
  void holidayVersion
  const select = useStore((s) => s.select)

  const cells = useMemo(() => monthCells(viewYear, viewMonth), [viewYear, viewMonth])
  const today = todayYmd()

  const infos = useMemo(() => {
    const m = new Map<string, DayInfo>()
    for (const c of cells) m.set(c, getDayInfo(toDate(c)))
    return m
  }, [cells])

  const statuses = useMemo(() => {
    const m = new Map<string, DayStatus>()
    for (const c of cells) m.set(c, getDayStatus(c, weekdayOf(c)))
    return m
  }, [cells, holidayVersion])

  const byDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>()
    for (const c of cells) {
      const hit = events.filter((e) => occursOn(e, c))
      if (hit.length > 0) m.set(c, hit)
    }
    return m
  }, [events, cells])

  return (
    <section className="grid-card" aria-label="月视图">
      <div className="grid-week">
        {WEEK.map((w, i) => (
          <span key={w} className={'week-head' + (i >= 5 ? ' is-red' : '')}>
            {w}
          </span>
        ))}
      </div>
      <div className="grid-body">
        {cells.map((c) => (
          <DayCell
            key={c}
            ymd={c}
            inMonth={parseYmd(c).m === viewMonth}
            info={infos.get(c)!}
            status={statuses.get(c)!}
            events={byDate.get(c) ?? []}
            isSelected={c === selected}
            isToday={c === today}
            onSelect={() => select(c)}
          />
        ))}
      </div>
    </section>
  )
}

function DayCell({
  ymd,
  inMonth,
  info,
  status,
  events,
  isSelected,
  isToday,
  onSelect,
}: {
  ymd: string
  inMonth: boolean
  info: DayInfo
  status: DayStatus
  events: CalEvent[]
  isSelected: boolean
  isToday: boolean
  onSelect: () => void
}) {
  const { d } = parseYmd(ymd)
  const redDay = status.kind === 'off' || status.kind === 'weekend'
  const sub = cellSubLabel(info)

  return (
    <button
      type="button"
      className={
        'cell' + (inMonth ? '' : ' cell-out') + (isSelected ? ' cell-selected' : '')
      }
      onClick={onSelect}
      aria-label={ymd}
      title={status.label ? `${info.lunarFullCn} · ${status.label}` : info.lunarFullCn}
    >
      <span className="cell-head">
        <span className={'cell-num' + (redDay ? ' is-red' : '') + (isToday ? ' is-today' : '')}>
          {d}
        </span>
        {status.kind === 'off' && <span className="badge badge-off">休</span>}
        {status.kind === 'work' && <span className="badge badge-work">班</span>}
      </span>
      <span className={'cell-sub ' + sub.cls}>{sub.text}</span>
      <span className="cell-dots">
        {events.slice(0, 3).map((e) => (
          <i key={e.id} style={{ background: COLOR_HEX[e.color] }} />
        ))}
      </span>
    </button>
  )
}
