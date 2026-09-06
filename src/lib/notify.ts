import type { CalEvent } from '../types'
import { occursOn } from './repeat'

const KEY = 'suishi.notified.v1'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permissionState(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported'
}

export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    return (await Notification.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

function readDone(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const v: unknown = JSON.parse(raw)
    if (typeof v === 'object' && v !== null) return v as Record<string, string[]>
  } catch {
    /* ignore */
  }
  return {}
}

function writeDone(done: Record<string, string[]>): void {
  try {
    // 只留最近 7 天，避免无限增长
    const keys = Object.keys(done).sort().slice(-7)
    const trimmed: Record<string, string[]> = {}
    for (const k of keys) trimmed[k] = done[k]
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch {
    /* ignore */
  }
}

function fire(ev: CalEvent): void {
  try {
    const n = new Notification(ev.time ? `${ev.time} ${ev.title}` : ev.title, {
      body: ev.note || '岁时提醒',
      tag: ev.id,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    /* 通知失败不影响页面 */
  }
}

/** 检查今天已到点且未提醒过的事件并发通知，返回发出条数。页面加载与定时器都调用它。 */
export function checkAndNotify(events: CalEvent[], today: string, now: Date, enabled: boolean): number {
  if (!enabled || !notificationsSupported() || Notification.permission !== 'granted') return 0
  const done = readDone()
  const doneSet = new Set(done[today] ?? [])
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  let fired = 0
  for (const ev of events) {
    if (!ev.remind || !ev.time) continue
    if (doneSet.has(ev.id)) continue
    if (!occursOn(ev, today)) continue
    if (ev.time <= hhmm) {
      fire(ev)
      doneSet.add(ev.id)
      fired++
    }
  }
  if (fired > 0) {
    done[today] = [...doneSet]
    writeDone(done)
  }
  return fired
}
