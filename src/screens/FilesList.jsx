import { useState } from 'react'
import { C } from '../theme'
import { IconUpload } from '../components/Icons'
import { FileViewer } from '../components/FileViewer'
import { Loading, ErrorState } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getAllFiles, getProjects, uploadFile, deleteFile } from '../lib/api'

export function FilesList() {
  const { data: files, loading, error, reload } = useAsync(getAllFiles, [])
  const { data: projects } = useAsync(getProjects, [])
  const [activeId, setActiveId] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = files || []
  const active = list.find((f) => f.id === activeId) || list[0]
  const projByUuid = Object.fromEntries((projects || []).map((p) => [p.uuid, p]))

  const onUpload = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    try {
      await uploadFile('unsorted', f)
      await reload()
    } catch (err) {
      alert('อัปโหลดไม่สำเร็จ: ' + (err.message || err))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const onDelete = async (f) => {
    if (!confirm(`ลบไฟล์ "${f.name}"?`)) return
    await deleteFile(f)
    setActiveId(null)
    await reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="ao-topbar" style={{ height: 64, borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink }}>ไฟล์ &amp; คอนเซป</div>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>คลังไฟล์ .md / .html อธิบายคอนเซปงาน</div>
        </div>
        <label className="btn" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.white, background: C.teal, border: 'none', borderRadius: 9, padding: '9px 15px', cursor: 'pointer' }}>
          <IconUpload size={15} stroke={C.white} />
          {busy ? 'กำลังอัปโหลด…' : 'อัปโหลดไฟล์'}
          <input type="file" onChange={onUpload} disabled={busy} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="ao-twopane" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {files && (
          <>
            <div className="ao-pane-list" style={{ width: 320, borderRight: `1px solid ${C.border}`, padding: '20px 18px', flexShrink: 0, overflow: 'auto', background: C.bg }}>
              {list.length === 0 && (
                <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight, lineHeight: 1.6, padding: '8px 4px' }}>
                  ยังไม่มีไฟล์ในคลัง<br />อัปโหลดไฟล์คอนเซป .md หรือ .html เพื่อเริ่มต้น
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {list.map((f) => {
                  const proj = projByUuid[f.dealId]
                  return (
                    <div key={f.id} onClick={() => setActiveId(f.id)} style={{ background: C.white, border: active?.id === f.id ? `2px solid ${C.teal}` : `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 9, color: '#fff', background: f.typeColor, padding: '3px 6px', borderRadius: 5, flexShrink: 0 }}>{f.type}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayLight }}>{proj ? proj.name : (f.dealId === 'unsorted' ? 'ยังไม่ผูกงาน' : f.size)}</div>
                      </div>
                      <span onClick={(e) => { e.stopPropagation(); onDelete(f) }} title="ลบ" style={{ color: C.grayPale, fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>×</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: C.white }}>
              <FileViewer file={active} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
