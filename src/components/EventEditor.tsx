import { useState } from 'react'
import { useStore, newEventId } from '../store'
import { Modal } from './Modal'
import { COLOR_HEX, EVENT_COLORS, REPEAT_LABELS, type EventColor, type RepeatRule } from '../types'

export function EventEditor() {
  const editing = useStore((s) => s.editing)!
  const closeEditor = useStore((s) => s.closeEditor)
  const upsertEvent = useStore((s) => s.upsertEvent)
  const removeEvent = useStore((s) => s.removeEvent)

  const existing = editing.event
  const [title, setTitle] = useState(existing?.title ?? '')
  const [date, setDate] = useState(existing?.date ?? editing.date)
  const [time, setTime] = useState(existing?.time ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [color, setColor] = useState<EventColor>(existing?.color ?? 'red')
  const [repeat, setRepeat] = useState<RepeatRule>(existing?.repeat ?? 'none')
  const [remind, setRemind] = useState(existing?.remind ?? false)
  const [error, setError] = useState('')

  function save() {
    if (!title.trim()) {
      setError('请填写标题')
      return
    }
    upsertEvent({
      id: existing?.id ?? newEventId(),
      title: title.trim(),
      date,
      time: time || undefined,
      note: note.trim() || undefined,
      color,
      repeat,
      remind,
      createdAt: existing?.createdAt ?? Date.now(),
    })
    closeEditor()
  }

  return (
    <Modal title={existing ? '编辑日程' : '添加日程'} onClose={closeEditor}>
      <div className="form">
        <label className="field">
          <span>标题</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError('')
            }}
            placeholder="如：奶奶生日"
            maxLength={50}
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>日期</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>时间（可选）</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>重复</span>
          <select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)}>
            {Object.entries(REPEAT_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="field">
          <span>颜色</span>
          <div className="swatches">
            {EVENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={'swatch' + (c === color ? ' is-active' : '')}
                style={{ background: COLOR_HEX[c] }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <label className="field">
          <span>备注（可选）</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="补充说明"
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} />
          到点浏览器通知（需在设置中开启提醒）
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          {existing && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(`删除「${existing.title}」？`)) {
                  removeEvent(existing.id)
                  closeEditor()
                }
              }}
            >
              删除
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-outline" onClick={closeEditor}>
            取消
          </button>
          <button type="button" className="btn btn-primary" onClick={save}>
            保存
          </button>
        </div>
      </div>
    </Modal>
  )
}
