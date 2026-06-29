import { useState } from 'react'
import { C, DOC_COLORS } from '../theme'
import { IconSearch, IconPlus } from '../components/Icons'
import { StatusBadge } from '../components/StatusBadge'
import { Loading, ErrorState, EmptyState } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getAllDocuments } from '../lib/api'
import { baht, thaiDate } from '../lib/format'

const TYPE_FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'QT', label: 'ใบเสนอราคา' },
  { key: 'DN', label: 'ใบส่งงาน' },
  { key: 'INV', label: 'ใบแจ้งหนี้' },
]

export function DocumentsList({ navigate }) {
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useAsync(getAllDocuments, [])

  const docs = (data || [])
    .filter((d) => type === 'all' || d.type === type)
    .filter((d) => !search || `${d.id} ${d.client}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="ao-topbar" style={{ height: 64, borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink }}>เอกสารทั้งหมด</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="ao-search" style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 13px', width: 210 }}>
            <IconSearch size={15} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาเลขที่ / ลูกค้า…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Sarabun'", fontSize: 12.5, color: C.ink, width: '100%' }} />
          </div>
          <button onClick={() => navigate('wizard')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.white, background: C.teal, border: 'none', borderRadius: 9, padding: '9px 15px', cursor: 'pointer' }}>
            <IconPlus size={15} stroke={C.white} />สร้างงานใหม่
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 28px', background: C.bg, overflow: 'auto' }}>
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map((f) => {
                const active = type === f.key
                const n = f.key === 'all' ? data.length : data.filter((d) => d.type === f.key).length
                return (
                  <span key={f.key} onClick={() => setType(f.key)} style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? C.white : C.grayMed, background: active ? C.ink : C.white, border: `1px solid ${active ? C.ink : C.border}`, padding: '7px 15px', borderRadius: 20, cursor: 'pointer' }}>
                    {f.label} · {n}
                  </span>
                )
              })}
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                {['เลขที่ / ชนิด', 'ลูกค้า', 'วันที่', 'สถานะ', 'มูลค่า'].map((h, i) => (
                  <div key={h} className={i === 2 ? 'ao-hide-mobile' : undefined} style={{ flex: [1.6, 1.6, 1, 0.9, 0.8][i], textAlign: i === 4 ? 'right' : 'left', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.grayLight }}>{h}</div>
                ))}
              </div>
              {docs.length === 0 ? (
                <EmptyState title="ไม่มีเอกสารในหมวดนี้" />
              ) : (
                docs.map((d, i) => (
                  <div key={`${d.type}-${d.id}`} className="card-hover" onClick={() => d.projectCode && navigate('project', { projectId: d.projectCode })} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < docs.length - 1 ? `1px solid ${C.borderLight}` : 'none', cursor: d.projectCode ? 'pointer' : 'default' }}>
                    <div style={{ flex: 1.6, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ width: 7, height: 28, borderRadius: 4, background: DOC_COLORS[d.type] || C.grayPale, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: C.ink }}>{d.id}</div>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>{d.label}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1.6, fontFamily: "'Sarabun'", fontSize: 12.5, color: C.ink, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.client}</div>
                    <div className="ao-hide-mobile" style={{ flex: 1, fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed }}>{thaiDate(d.date)}</div>
                    <div style={{ flex: 0.9 }}><StatusBadge status={d.status} /></div>
                    <div style={{ flex: 0.8, textAlign: 'right', fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: C.ink }}>{baht(d.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
