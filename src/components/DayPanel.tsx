import { useMemo } from 'react'
import { useStore } from '../store'
import { getDayInfo } from '../lib/lunar'
import { getDayStatus } from '../lib/holidays'
import { daysBetween, parseYmd, toDate, todayYmd, weekdayOf } from '../lib/date'
import { nextOccurrence, occursOn } from '../lib/repeat'
import { COLOR_HEX, type CalEvent } from '../types'

function byTime(a: CalEvent, b: CalEvent): number {
  const at = a.time ?? '99:99'
  const bt = b.time ?? '99:99'
  return at < bt ? -1 : at > bt ? 1 : a.createdAt - b.createdAt
}

function relLabel(date: string, today: string): string {
  const diff = daysBetween(today, date)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  const { m, d } = parseYmd(date)
  return `${m}月${d}日 · ${diff}天后`
}

export function DayPanel() {
  const selected = useStore((s) => s.selected)
  const events = useStore((s) => s.events)
  const settings = useStore((s) => s.settings)
  const holidayVersion = useStore((s) => s.holidayVersion)
  void holidayVersion
  const openEditor = useStore((s) => s.openEditor)
  const removeEvent = useStore((s) => s.removeEvent)

  const today = todayYmd()
  const info = useMemo(() => getDayInfo(toDate(selected)), [selected])
  const status = useMemo(() => getDayStatus(selected, weekdayOf(selected)), [selected, holidayVersion])
  const dayEvents = useMemo(
    () => events.filter((e) => occursOn(e, selected)).sort(byTime),
    [events, selected],
  )
  const upcoming = useMemo(() => {
    const out: { ev: CalEvent; date: string }[] = []
    for (const e of events) {
      const nx = nextOccurrence(e, today)
      if (nx) out.push({ ev: e, date: nx })
    }
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : byTime(a.ev, b.ev)))
    return out.slice(0, 5)
  }, [events, today])

  const { m, d } = parseYmd(selected)
  const weekCn = '日一二三四五六'[weekdayOf(selected)]
  const statusChip =
    status.kind === 'off'
      ? { text: `${status.label} · 休`, cls: 'chip-off' }
      : status.kind === 'work'
        ? { text: `${status.label} · 班`, cls: 'chip-work' }
        : null

  const jieQiLine = info.jieQi
    ? `今日${info.jieQi}`
    : `距${info.nextJieQiName}还有 ${daysBetween(today, info.nextJieQiDate)} 天`

  return (
    <aside className="panel" aria-label="当日详情">
      <div className="panel-date">
        <div className="panel-date-main">
          <strong>
            {m}月{d}日
          </strong>
          <span>星期{weekCn}</span>
          {statusChip && <span className={'chip ' + statusChip.cls}>{statusChip.text}</span>}
        </div>
        <p className="panel-lunar">{info.lunarFullCn}</p>
        <p className="panel-ganzhi">
          {info.yearGanZhi}年（{info.yearShengXiao}）· {info.monthGanZhi}月 {info.dayGanZhi}日
        </p>
        <p className={'panel-jieqi' + (info.jieQi ? ' is-today' : '')}>{jieQiLine}</p>
        {(info.lunarFestivals.length > 0 || info.solarFestivals.length > 0) && (
          <div className="panel-festivals">
            {[...info.lunarFestivals, ...info.solarFestivals].map((f) => (
              <span key={f} className="festival-chip">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {settings.showAlmanac && (
        <div className="panel-section almanac">
          <h4>黄历 <small>传统文化参考</small></h4>
          <div className="almanac-cols">
            <div className="almanac-col yi">
              <span className="almanac-tag">宜</span>
              <p>{info.yi.join(' ')}</p>
            </div>
            <div className="almanac-col ji">
              <span className="almanac-tag ji">忌</span>
              <p>{info.ji.join(' ')}</p>
            </div>
          </div>
          <dl className="almanac-extra">
            <div>
              <dt>吉神宜趋</dt>
              <dd>{info.jiShen.slice(0, 6).join(' ')}</dd>
            </div>
            <div>
              <dt>凶煞宜忌</dt>
              <dd>{info.xiongSha.slice(0, 6).join(' ')}</dd>
            </div>
            <div>
              <dt>冲煞</dt>
              <dd>
                冲{info.chong} 煞{info.sha}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="panel-section">
        <div className="section-head">
          <h4>本日日程</h4>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openEditor(selected)}>
            ＋ 添加
          </button>
        </div>
        {dayEvents.length === 0 ? (
          <p className="empty">这一天还没有安排</p>
        ) : (
          <ul className="event-list">
            {dayEvents.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="event-item"
                  onClick={() => openEditor(selected, e)}
                  title="点击编辑"
                >
                  <i style={{ background: COLOR_HEX[e.color] }} />
                  <span className="event-time">{e.time ?? '全天'}</span>
                  <span className="event-title">{e.title}</span>
                  {e.repeat !== 'none' && <span className="event-repeat">↻</span>}
                </button>
                <button
                  type="button"
                  className="icon-btn event-del"
                  aria-label={`删除${e.title}`}
                  onClick={() => {
                    if (window.confirm(`删除「${e.title}」？`)) removeEvent(e.id)
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="panel-section">
          <h4>近期日程</h4>
          <ul className="upcoming-list">
            {upcoming.map(({ ev, date }) => (
              <li key={ev.id + date}>
                <i style={{ background: COLOR_HEX[ev.color] }} />
                <span className="event-title">{ev.title}</span>
                <span className="upcoming-date">{relLabel(date, today)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
