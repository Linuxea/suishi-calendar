import { Solar } from 'lunar-typescript'
import { toYmd } from './date'

/** 单日历法信息，全部来自 lunar-typescript 的现成计算 */
export interface DayInfo {
  /** 农历月（自带闰前缀，如「七」「闰六」「冬」「腊」） */
  lunarMonthCn: string
  /** 农历日，如「初五」「廿五」 */
  lunarDayCn: string
  /** 完整农历日期，如「二〇二六年七月廿五」 */
  lunarFullCn: string
  /** 当天节气名，无则空串 */
  jieQi: string
  /** 农历传统节日（春节、端午、除夕…），只用主列表，避免冷门条目污染格子 */
  lunarFestivals: string[]
  /** 公历节日（元旦节、劳动节、国庆节…） */
  solarFestivals: string[]
  yearGanZhi: string
  yearShengXiao: string
  monthGanZhi: string
  dayGanZhi: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  /** 如「(丁丑)牛」 */
  chong: string
  /** 如「西」 */
  sha: string
  nextJieQiName: string
  nextJieQiDate: string
}

const cache = new Map<string, DayInfo>()

export function getDayInfo(date: Date): DayInfo {
  const key = toYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const hit = cache.get(key)
  if (hit) return hit

  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  // 节气当天 getNextJieQi 仍返回当天，需从次日起取严格意义的「下一个」
  let next = lunar.getNextJieQi()
  if (next.getSolar().toYmd() <= solar.toYmd()) {
    const tomorrow = new Date(date)
    tomorrow.setDate(tomorrow.getDate() + 1)
    next = Solar.fromDate(tomorrow).getLunar().getNextJieQi()
  }

  const info: DayInfo = {
    lunarMonthCn: lunar.getMonthInChinese(),
    lunarDayCn: lunar.getDayInChinese(),
    lunarFullCn: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    jieQi: lunar.getJieQi() || '',
    lunarFestivals: lunar.getFestivals(),
    solarFestivals: solar.getFestivals(),
    yearGanZhi: lunar.getYearInGanZhi(),
    yearShengXiao: lunar.getYearShengXiao(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    jiShen: lunar.getDayJiShen(),
    xiongSha: lunar.getDayXiongSha(),
    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    nextJieQiName: next.getName(),
    nextJieQiDate: next.getSolar().toYmd(),
  }
  cache.set(key, info)
  return info
}

export interface CellSubLabel {
  text: string
  cls: 'sub-jieqi' | 'sub-festival' | 'sub-term' | 'sub-lunar'
}

/** 格子里农历位显示什么：节气 > 节日 > 初一显月名 > 农历日 */
export function cellSubLabel(info: DayInfo): CellSubLabel {
  if (info.jieQi) return { text: info.jieQi, cls: 'sub-jieqi' }
  const festival = info.lunarFestivals[0] ?? info.solarFestivals[0]
  if (festival) return { text: festival, cls: 'sub-festival' }
  if (info.lunarDayCn === '初一') return { text: `${info.lunarMonthCn}月`, cls: 'sub-term' }
  return { text: info.lunarDayCn, cls: 'sub-lunar' }
}
