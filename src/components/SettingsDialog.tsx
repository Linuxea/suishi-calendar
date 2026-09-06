import { useRef, useState } from 'react'
import { useStore } from '../store'
import { Modal } from './Modal'
import { exportPayload, parseImport } from '../lib/storage'
import { permissionState, requestPermission } from '../lib/notify'
import { todayYmd } from '../lib/date'

export function SettingsDialog() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const events = useStore((s) => s.events)
  const replaceAll = useStore((s) => s.replaceAll)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const perm = permissionState()

  async function onNotifyToggle(on: boolean) {
    if (!on) {
      updateSettings({ notify: false })
      return
    }
    const ok = await requestPermission()
    updateSettings({ notify: ok })
    setMsg(
      ok
        ? ''
        : perm === 'unsupported'
          ? '当前浏览器不支持通知'
          : '浏览器未授权通知，请在地址栏权限设置中允许后重试',
    )
  }

  function onExport() {
    const blob = new Blob([JSON.stringify(exportPayload(events, settings), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suishi-backup-${todayYmd().replace(/-/g, '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onImportFile(file: File) {
    try {
      const text = await file.text()
      const data = parseImport(text)
      const ok = window.confirm(
        `导入 ${data.events.length} 条日程，将覆盖现有的 ${events.length} 条，确定？`,
      )
      if (ok) {
        replaceAll(data.events, data.settings)
        setMsg(`已导入 ${data.events.length} 条日程`)
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '导入失败')
    }
  }

  return (
    <Modal title="设置" onClose={() => setSettingsOpen(false)}>
      <div className="form">
        <div className="setting-row">
          <div>
            <strong>黄历宜忌</strong>
            <p className="setting-desc">展示每日宜忌、吉神凶煞与冲煞（传统文化参考）</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.showAlmanac}
              onChange={(e) => updateSettings({ showAlmanac: e.target.checked })}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-row">
          <div>
            <strong>事件提醒</strong>
            <p className="setting-desc">
              {perm === 'granted'
                ? '已授权，事件到点弹浏览器通知'
                : perm === 'denied'
                  ? '通知权限已被拒绝，需在浏览器设置中恢复'
                  : perm === 'unsupported'
                    ? '当前浏览器不支持通知'
                    : '开启后将请求浏览器通知权限'}
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.notify}
              onChange={(e) => onNotifyToggle(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-row">
          <div>
            <strong>数据备份</strong>
            <p className="setting-desc">日程仅保存在本浏览器中，可导出 JSON 备份或迁移到其他设备</p>
          </div>
          <div className="btn-col">
            <button type="button" className="btn btn-outline btn-sm" onClick={onExport}>
              导出
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileRef.current?.click()}
            >
              导入
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImportFile(f)
                e.target.value = ''
              }}
            />
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>清空数据</strong>
            <p className="setting-desc">当前共 {events.length} 条日程，清空后不可恢复</p>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (events.length === 0) return
              if (window.confirm('确定清空全部日程？此操作不可恢复')) {
                replaceAll([], settings)
                setMsg('已清空')
              }
            }}
          >
            清空
          </button>
        </div>

        {msg && <p className="form-msg">{msg}</p>}
      </div>
    </Modal>
  )
}
