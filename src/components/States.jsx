import { C } from '../theme'

export function Loading({ label = 'กำลังโหลด…' }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, minHeight: 240 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="ao-spinner" style={{
          width: 30, height: 30, borderRadius: '50%',
          border: `3px solid ${C.border}`, borderTopColor: C.teal,
          margin: '0 auto 12px',
        }} />
        <div style={{ fontFamily: "'Sarabun'", fontSize: 13, color: C.grayLight }}>{label}</div>
      </div>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, minHeight: 240 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 14, fontWeight: 600, color: C.burgundy, marginBottom: 6 }}>โหลดข้อมูลไม่สำเร็จ</div>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight, marginBottom: 14 }}>
          {error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล'}
        </div>
        {onRetry && (
          <button onClick={onRetry} className="btn" style={{
            fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: '#fff',
            background: C.teal, border: 'none', borderRadius: 9, padding: '8px 18px', cursor: 'pointer',
          }}>ลองใหม่</button>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ title = 'ยังไม่มีข้อมูล', sub }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 50, minHeight: 200 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 14, color: C.grayLight, marginBottom: 4 }}>{title}</div>
        {sub && <div style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: C.grayPale }}>{sub}</div>}
      </div>
    </div>
  )
}
