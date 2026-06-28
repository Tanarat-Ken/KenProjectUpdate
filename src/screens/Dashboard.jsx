import { C } from '../theme'
import { StatusBadge } from '../components/StatusBadge'
import { IconSearch, IconPlus, IconFile } from '../components/Icons'
import { Loading, ErrorState, EmptyState } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getDashboard, getRecentActivity } from '../lib/api'
import { useOwner } from '../lib/settings'
import { baht, timeThai } from '../lib/format'

function StatCard({ label, value, sub, dotColor, inverted }) {
  if (inverted) {
    return (
      <div style={{ background: C.burgundy, borderRadius: 13, padding: '17px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,.85)' }}>{label}</span>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,.7)', display: 'inline-block' }} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: 'rgba(255,255,255,.8)', marginTop: 5 }}>{sub}</div>
      </div>
    )
  }
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '17px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: C.grayMed }}>{label}</span>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
      </div>
      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight, marginTop: 5 }}>{sub}</div>
    </div>
  )
}

function ProjectRow({ project, onClick }) {
  const iconBg = {
    'รอชำระ': C.burgundyLight, 'กำลังทำ': C.tealLight,
    'รอตรวจรับ': C.blueLight, 'รอตอบรับ': C.amberLight,
  }
  const iconColor = {
    'รอชำระ': C.burgundy, 'กำลังทำ': C.teal,
    'รอตรวจรับ': C.blue, 'รอตอบรับ': C.amber,
  }
  const bg = iconBg[project.status] || C.panel
  const ic = iconColor[project.status] || C.grayMed

  return (
    <div
      className="card-hover"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '15px 18px', borderBottom: `1px solid ${C.borderLight}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconFile size={18} stroke={ic} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</div>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{project.client} · <span style={{ fontFamily: "'Space Grotesk'" }}>{project.id}</span></div>
      </div>
      <StatusBadge status={project.status} />
      <span style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: C.ink, width: 78, textAlign: 'right' }}>
        {baht(project.value)}
      </span>
    </div>
  )
}

export function Dashboard({ navigate }) {
  const owner = useOwner()
  const { data, loading, error, reload } = useAsync(getDashboard, [])
  const activity = useAsync(() => getRecentActivity(5), [])

  const today = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        height: 64, borderBottom: `1px solid ${C.border}`,
        padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.white, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink, lineHeight: 1.1 }}>สวัสดี {owner.shortName} 👋</div>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>{today}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: 9, padding: '8px 13px', width: 230,
          }}>
            <IconSearch size={15} />
            <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight }}>ค้นหางาน ลูกค้า เอกสาร…</span>
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
      <div style={{ flex: 1, padding: '26px 28px', background: C.bg, overflow: 'auto' }}>
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
              <StatCard label="งานค้าง (กำลังทำ)" value={data.counts.active} sub="กำลังพัฒนาอยู่" dotColor={C.teal} />
              <StatCard label="งานรอ (รอลูกค้า)" value={data.counts.waiting} sub="รอตอบรับ · รอชำระ" dotColor={C.amber} />
              <StatCard label="งานรีวิว (รอตรวจรับ)" value={data.counts.review} sub="ส่งมอบแล้ว รอเซ็น" dotColor={C.blue} />
              <StatCard label="เงินรอเก็บ" value={baht(data.receivable)} sub="ใบแจ้งหนี้ค้างชำระ" inverted />
            </div>

            {/* Main 2-col */}
            <div style={{ display: 'flex', gap: 18 }}>
              {/* Left */}
              <div style={{ flex: 1.6, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>งานที่ต้องดำเนินการ</span>
                  <span
                    onClick={() => navigate('projects')}
                    style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 500, color: C.teal, cursor: 'pointer' }}
                  >ดูทั้งหมด →</span>
                </div>

                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
                  {data.openProjects.length === 0
                    ? <EmptyState title="ไม่มีงานที่ต้องดำเนินการ" sub="All caught up" />
                    : data.openProjects.map((p) => (
                        <ProjectRow key={p.id} project={p} onClick={() => navigate('project', { projectId: p.id })} />
                      ))}
                </div>

                {/* Revenue */}
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, margin: '22px 0 12px' }}>รายได้ภาพรวม</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[
                    { label: 'เสนอราคาไป', value: baht(data.revenue.quoted), color: C.ink },
                    { label: 'รอเก็บ', value: baht(data.revenue.receivable), color: C.burgundy },
                    { label: 'เก็บแล้ว', value: baht(data.revenue.collected), color: C.green },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: 16 }}>
                      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed }}>{label}</div>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 21, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 12 }}>กิจกรรมล่าสุด</div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: 18 }}>
                  {activity.loading && <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>กำลังโหลด…</div>}
                  {activity.data && activity.data.length === 0 && (
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>ยังไม่มีกิจกรรม</div>
                  )}
                  {(activity.data || []).map((a, i, arr) => (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < arr.length - 1 ? 15 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: a.color, marginTop: 4 }} />
                        {i < arr.length - 1 && <div style={{ flex: 1, width: 2, background: C.borderLight, marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: C.ink, lineHeight: 1.4 }}>
                          {a.text} {a.code && <span style={{ fontFamily: "'Space Grotesk'", color: a.codeColor }}>{a.code}</span>}{a.codeSuffix}
                        </div>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight, marginTop: 2 }}>
                          {timeThai(a.time)}{a.user ? ` · โดย${a.user}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shortcuts */}
                <div style={{ background: C.panel, border: `1px dashed ${C.borderDash}`, borderRadius: 13, padding: 16, marginTop: 16 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: C.ink, marginBottom: 9 }}>ทางลัด</div>
                  {[
                    { label: 'สร้างใบเสนอราคา', color: C.teal, page: 'wizard' },
                    { label: 'ออกใบแจ้งหนี้จากงานที่ส่งแล้ว', color: C.burgundy, page: 'wizard' },
                    { label: 'อัปโหลดไฟล์คอนเซป (.md/.html)', color: C.grayLight, page: 'files' },
                  ].map(({ label, color, page }) => (
                    <div
                      key={label}
                      onClick={() => navigate(page)}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: C.grayMed, marginBottom: 8, cursor: 'pointer' }}
                    >
                      <span style={{ width: 24, height: 24, borderRadius: 7, background: C.white, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 16, fontWeight: 700 }}>+</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
