/**
 * 法定节假日与调休。
 * 数据源 NateScarlet/holiday-cn（每日自动抓取国务院公告），
 * 运行时按年从 jsDelivr 拉取并缓存 localStorage，
 * 当前年份内置快照兜底；拉取失败时退化为「周末休」判断。
 */
import snapshot2026 from '../data/holiday-cn-2026.json'

export interface DayStatus {
  /** off=法定休 work=调休补班 weekend=周末 weekday=工作日 */
  kind: 'off' | 'work' | 'weekend' | 'weekday'
  /** 节假日名称（如「国庆节」） */
  label?: string
}

interface HolidayDay {
  name: string
  date: string
  isOffDay: boolean
}

interface HolidayYear {
  year: number
  days: HolidayDay[]
}

const byDate = new Map<string, { isOffDay: boolean; name: string }>()
const loadedYears = new Set<number>()

function mergeYear(data: HolidayYear): void {
  if (!data || !Array.isArray(data.days)) return
  for (const d of data.days) byDate.set(d.date, { isOffDay: d.isOffDay, name: d.name })
  loadedYears.add(data.year)
}

mergeYear(snapshot2026 as HolidayYear)

function cacheKey(year: number): string {
  return `suishi.holiday.v1.${year}`
}

/**
 * 国务院一般每年 10–11 月公布次年安排，此前年份没有官方数据，
 * 主动跳过这些年份的拉取，避免 404（页面退化为仅周末判断）。
 */
function dataPublished(year: number): boolean {
  const now = new Date()
  const latest = now.getMonth() >= 10 ? now.getFullYear() + 1 : now.getFullYear()
  return year <= latest
}

async function loadYear(year: number): Promise<void> {
  if (loadedYears.has(year)) return
  if (!dataPublished(year)) {
    loadedYears.add(year)
    return
  }
  try {
    const raw = localStorage.getItem(cacheKey(year))
    if (raw) {
      mergeYear(JSON.parse(raw))
      if (loadedYears.has(year)) return
    }
  } catch {
    /* 忽略缓存损坏 */
  }
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/${year}.json`)
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as HolidayYear
    mergeYear(data)
    try {
      localStorage.setItem(cacheKey(year), JSON.stringify(data))
    } catch {
      /* 存储满则放弃缓存 */
    }
  } catch {
    // 拉取失败：标记已处理，退化为周末判断
    loadedYears.add(year)
  }
}

export async function ensureHolidayYears(years: number[]): Promise<void> {
  await Promise.all(years.map(loadYear))
}

/** 纯同步：读取已加载的数据，配合 weekday(0=周日) 判断 */
export function getDayStatus(ymd: string, weekday: number): DayStatus {
  const hit = byDate.get(ymd)
  if (hit) return { kind: hit.isOffDay ? 'off' : 'work', label: hit.name }
  return weekday === 0 || weekday === 6 ? { kind: 'weekend' } : { kind: 'weekday' }
}
