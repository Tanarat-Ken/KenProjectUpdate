import { useState } from 'react'
import { C } from '../theme'
import { Pipeline } from '../components/Pipeline'
import { StatusBadge } from '../components/StatusBadge'
import { IconSearch, IconPlus } from '../components/Icons'
import { PROJECTS } from '../data'

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'กำลังทำ', label: 'กำลังทำ' },
  { key: 'รอลูกค้า', label: 'รอลูกค้า' },
  { key: 'รอตรวจรับ', label: 'รอตรวจรับ' },
  { key: 'ปิดงาน', label: 'ปิดงาน' },
]

function matchesFilter(project, key) {
  if (key === 'all') return true
  if (key === 'รอลูกค้า') return ['รอชำระ', 'รอตอบรับ'].includes(project.status)
  return project.status === key
}

export function ProjectsList({ navigate }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = PROJECTS.filter(p => matchesFilter(p, activeFilter))
  const count = (key) => PROJECTS.filter(p => matchesFilter(p, key)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar */}
      <div style={{
        height: 64, borderBottom: `1px solid ${C.border}`,
        padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.white, flexShrink: 0,
      }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink }}>งานทั้งหมด</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: 9, padding: '8px 13px', width: 210,
          }}>
            <IconSearch size={15} />
            <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight }}>ค้นหางาน…</span>
          </div>
          <button
            onClick={() => navigate('wizard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600,
              color: C.white, background: C.teal, border: 'none',
              borderRadius: 9, padding: '9px 15px', cursor: 'pointer',
            }}
            className="btn"
          >
            <IconPlus size={15} stroke={C.white} />
            สร้างงานใหม่
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 28px', background: C.bg, overflow: 'auto' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {FILTERS.map(f => {
            const active = activeFilter === f.key
            const c = count(f.key)
            return (
              <span
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: active ? 600 : 500,
                  color: active ? C.white : C.grayMed,
                  background: active ? C.ink : C.white,
                  border: `1px solid ${active ? C.ink : C.border}`,
                  padding: '7px 15px', borderRadius: 20, cursor: 'pointer',
                }}
              >
                {f.label} · {c}
              </span>
            )
          })}
        </div>

        {/* Table */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
            <div style={{ flex: 2.4, fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.grayLight }}>งาน / ลูกค้า</div>
            <div style={{ flex: 1.4, fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.grayLight }}>ขั้นตอน (Q→D→I→R)</div>
            <div style={{ flex: 0.9, fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.grayLight }}>สถานะ</div>
            <div style={{ flex: 0.8, textAlign: 'right', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.grayLight }}>มูลค่า</div>
            <div style={{ flex: 0.7, textAlign: 'right', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.grayLight }}>อัปเดต</div>
          </div>

          {/* Rows */}
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="card-hover"
              onClick={() => navigate('project', { projectId: p.id })}
              style={{
                display: 'flex', alignItems: 'center', padding: '16px 20px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 2.4, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>
                  {p.client} · <span style={{ fontFamily: "'Space Grotesk'" }}>{p.id}</span>
                </div>
              </div>
              <div style={{ flex: 1.4 }}>
                <Pipeline pipeline={p.pipeline} />
              </div>
              <div style={{ flex: 0.9 }}>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ flex: 0.8, textAlign: 'right' }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: p.status === 'ปิดงาน' ? C.grayLight : C.ink }}>
                  ฿{p.value.toLocaleString()}
                </span>
              </div>
              <div style={{ flex: 0.7, textAlign: 'right', fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>
                {p.updatedAt}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal, display: 'inline-block' }} />Q = เสนอราคา
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue, display: 'inline-block', marginLeft: 8 }} />D = ส่งมอบ
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.burgundy, display: 'inline-block', marginLeft: 8 }} />I = วางบิล
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', marginLeft: 8 }} />R = รับเงิน
          <span style={{ marginLeft: 'auto' }}>วงสีทึบ = ออก/บันทึกแล้ว · วงว่าง = ยังไม่ถึงขั้นนี้</span>
        </div>
      </div>
    </div>
  )
}
