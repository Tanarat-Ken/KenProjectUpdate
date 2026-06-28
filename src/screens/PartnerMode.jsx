import { C } from '../theme'
import { LogoIcon, IconFile, IconCreditCard, IconCheck } from '../components/Icons'
import { useAsync } from '../lib/useAsync'
import { getProjects } from '../lib/api'
import { useOwner } from '../lib/settings'
import { baht } from '../lib/format'

const ACTION_HINT = {
  'รอชำระ': { label: 'ออกใบเสร็จ / ตามชำระ', color: C.burgundy, bg: C.burgundyLight },
  'รอตรวจรับ': { label: 'ออกใบแจ้งหนี้', color: C.burgundy, bg: C.burgundyLight },
  'รอตอบรับ': { label: 'ตามใบเสนอราคา', color: C.amber, bg: C.amberLight },
  'กำลังทำ': { label: 'ติดตามงาน', color: C.teal, bg: C.tealLight },
}

export function PartnerMode({ navigate }) {
  const owner = useOwner()
  const { data } = useAsync(getProjects, [])
  const tasks = (data || []).filter((p) => p.status !== 'ปิดงาน')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      {/* Teal header */}
      <div style={{ height: 62, background: C.teal, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoIcon size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: '#fff' }}>{owner.logoText}</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: 'rgba(255,255,255,.8)' }}>โหมดผู้ช่วย</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: '#fff' }}>สวัสดี {owner.partnerName} 💚</span>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 12 }}>{owner.partnerInitial}</div>
          <button onClick={() => navigate('dashboard')} style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 600, color: C.teal, background: C.white, border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', marginLeft: 4 }}>เจ้าของ</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 19, color: C.ink }}>วันนี้มีอะไรให้ช่วยบ้าง?</div>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 13, color: C.grayLight, marginBottom: 22 }}>เลือกสิ่งที่ต้องทำ ระบบจะพาไปทีละขั้น ไม่ต้องคิดเยอะ</div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 26 }}>
          <ActionCard onClick={() => navigate('wizard')} icon={<IconFile size={24} stroke={C.teal} />} bg={C.tealLight} title="สร้างใบเสนอราคา" sub="เริ่มงานใหม่ให้ลูกค้า" />
          <ActionCard onClick={() => navigate('wizard')} icon={<IconCreditCard size={24} stroke={C.burgundy} />} bg={C.burgundyLight} title="ออกใบแจ้งหนี้" sub="จากงานที่ส่งมอบแล้ว" border={C.burgundy} badge={tasks.length ? `มีงานรอ ${tasks.length}` : null} />
          <ActionCard onClick={() => navigate('wizard')} icon={<IconCheck size={24} stroke={C.blue} />} bg={C.blueLight} title="ออกใบส่งงาน" sub="เมื่องานเสร็จพร้อมส่ง" />
        </div>

        {/* Task list */}
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 12 }}>งานที่รอคุณช่วย</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
          {tasks.length === 0 && (
            <div style={{ padding: '22px', fontFamily: "'Sarabun'", fontSize: 13, color: C.grayLight, textAlign: 'center' }}>ตอนนี้ไม่มีงานค้าง 🎉</div>
          )}
          {tasks.map((p, i) => {
            const hint = ACTION_HINT[p.status] || { label: 'ดูรายละเอียด', color: C.grayMed, bg: C.panelAlt }
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < tasks.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: hint.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: hint.color }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13.5, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{p.client} · {p.status} · {baht(p.value)}</div>
                </div>
                <button onClick={() => navigate('project', { projectId: p.id })} style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: '#fff', background: hint.color, border: 'none', borderRadius: 9, padding: '9px 16px', cursor: 'pointer', flexShrink: 0 }}>{hint.label} →</button>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 18, background: C.panel, border: `1px dashed ${C.borderDash}`, borderRadius: 11, padding: '13px 16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.grayLight} strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed }}>ข้อมูลบัญชี อีเมล และเลขผู้เสียภาษี {owner.shortName}ตั้งไว้แล้ว ระบบจะเติมให้อัตโนมัติ — คุณแค่ใส่รายการกับยอดเงิน</span>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ onClick, icon, bg, title, sub, border, badge }) {
  return (
    <div className="card-hover" onClick={onClick} style={{ background: C.white, border: border ? `2px solid ${border}` : `1px solid ${C.border}`, borderRadius: 14, padding: 20, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
      {badge && <span style={{ position: 'absolute', top: 11, right: 11, fontFamily: "'Sarabun'", fontSize: 9.5, fontWeight: 600, color: '#fff', background: C.burgundy, padding: '2px 8px', borderRadius: 10 }}>{badge}</span>}
      <div style={{ width: 48, height: 48, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 13px' }}>{icon}</div>
      <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>{title}</div>
      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 3 }}>{sub}</div>
    </div>
  )
}
