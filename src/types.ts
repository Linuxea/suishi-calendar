/** 通用类型定义 */

export type EventColor = 'red' | 'blue' | 'green' | 'gold' | 'purple'

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lunar-yearly'

export interface CalEvent {
  id: string
  title: string
  /** 起始日期 YYYY-MM-DD */
  date: string
  /** HH:mm，缺省为全天 */
  time?: string
  note?: string
  color: EventColor
  repeat: RepeatRule
  /** 到点用浏览器通知提醒 */
  remind: boolean
  createdAt: number
}

export interface Settings {
  /** 黄历宜忌模块开关 */
  showAlmanac: boolean
  /** 事件提醒开关（仍需浏览器授权） */
  notify: boolean
}

export const EVENT_COLORS: EventColor[] = ['red', 'blue', 'green', 'gold', 'purple']

export const COLOR_HEX: Record<EventColor, string> = {
  red: '#b03a2e',
  blue: '#33566b',
  green: '#4a6b4f',
  gold: '#a07d2e',
  purple: '#6b4a6e',
}

export const REPEAT_LABELS: Record<RepeatRule, string> = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
  'lunar-yearly': '每年（农历）',
}
