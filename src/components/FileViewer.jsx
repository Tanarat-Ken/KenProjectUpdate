import { useState } from 'react'
import { C } from '../theme'
import { Markdown } from './Markdown'
import { Loading } from './States'
import { useAsync } from '../lib/useAsync'
import { getFileText } from '../lib/api'

export function FileViewer({ file }) {
  const [mode, setMode] = useState('read')
  const ext = (file?.type || '').toLowerCase()
  const textual = ['md', 'markdown', 'html', 'htm', 'txt', 'json', 'csv'].includes(ext)
  const { data: text, loading, error } = useAsync(
    () => (textual && file?.url ? getFileText(file) : Promise.resolve('')),
    [file?.id]
  )

  if (!file) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.grayLight, fontFamily: "'Sarabun'", fontSize: 13 }}>
        เลือกไฟล์เพื่อดูเนื้อหา
      </div>
    )
  }

  const isMd = ['md', 'markdown'].includes(ext)
  const isHtml = ['html', 'htm'].includes(ext)

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ height: 48, borderBottom: `1px solid ${C.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 8, color: '#fff', background: file.typeColor, padding: '3px 6px', borderRadius: 5 }}>{file.type}</span>
          <span style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {textual && (
            <>
              <span onClick={() => setMode('read')} style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 600, color: mode === 'read' ? C.teal : C.grayLight, background: mode === 'read' ? C.tealLight : 'transparent', padding: '5px 11px', borderRadius: 7, cursor: 'pointer' }}>{isHtml ? 'พรีวิว' : 'อ่าน'}</span>
              <span onClick={() => setMode('code')} style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 500, color: mode === 'code' ? C.teal : C.grayLight, background: mode === 'code' ? C.tealLight : 'transparent', padding: '5px 11px', borderRadius: 7, cursor: 'pointer' }}>โค้ด</span>
            </>
          )}
          {file.url && (
            <a href={file.url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 600, color: C.grayMed, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '5px 11px', borderRadius: 7 }}>เปิด ↗</a>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', background: C.white }}>
        {loading && <Loading />}
        {error && <div style={{ padding: 30, fontFamily: "'Sarabun'", fontSize: 13, color: C.burgundy }}>โหลดเนื้อหาไม่สำเร็จ</div>}
        {!loading && !error && (
          textual ? (
            mode === 'code' ? (
              <pre style={{ fontFamily: 'monospace', fontSize: 12, color: C.ink, lineHeight: 1.6, margin: 0, padding: '24px 30px', whiteSpace: 'pre-wrap' }}>{text}</pre>
            ) : isHtml ? (
              <iframe title={file.name} srcDoc={text} sandbox="" style={{ width: '100%', height: '100%', border: 'none', minHeight: 400 }} />
            ) : isMd ? (
              <div style={{ padding: '30px 40px', maxWidth: 760 }}><Markdown text={text} /></div>
            ) : (
              <pre style={{ fontFamily: 'monospace', fontSize: 12, color: C.ink, lineHeight: 1.6, margin: 0, padding: '24px 30px', whiteSpace: 'pre-wrap' }}>{text}</pre>
            )
          ) : (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Sarabun'", color: C.grayLight }}>
              <div style={{ fontSize: 13, marginBottom: 8 }}>ไฟล์ชนิดนี้แสดงตัวอย่างในระบบไม่ได้</div>
              {file.url && <a href={file.url} target="_blank" rel="noreferrer" style={{ color: C.teal, fontWeight: 600, fontSize: 13 }}>ดาวน์โหลด / เปิดไฟล์ ↗</a>}
            </div>
          )
        )}
      </div>
    </div>
  )
}
