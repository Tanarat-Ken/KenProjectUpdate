import { C, DOC_COLORS } from '../theme'
import { IconPlus, IconArrowRight, IconGrid, IconBriefcase, IconFile, IconPaperclip, IconUsers, IconSettings } from '../components/Icons'
import { Loading, ErrorState } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getProjects } from '../lib/api'

// The 7 working stages — mirrors STEP_DEFS in ProjectDetail so the diagram
// always matches what the buttons inside a project actually do.
const STAGES = [
  {
    n: 1, doc: 'QT', color: C.teal,
    label: 'สร้างงาน + เสนอราคา',
    sub: 'ออกใบเสนอราคา (QT) ส่งให้ลูกค้า',
    action: 'กด “สร้างงานใหม่” แล้วกรอกรายการ → ระบบออก QT ให้',
    page: 'wizard',
    where: 'ปุ่มสร้างงานใหม่ / ตัวช่วยออกเอกสาร',
  },
  {
    n: 2, doc: null, color: C.amber,
    label: 'ลูกค้าตอบรับข้อเสนอ',
    sub: 'รอลูกค้ายืนยันจ้างงาน / รับมัดจำ',
    action: 'เปิดงาน → กดปุ่ม “ลูกค้าตอบรับแล้ว”',
    page: 'projects',
    where: 'งานทั้งหมด → เปิดงาน',
  },
  {
    n: 3, doc: null, color: C.teal,
    label: 'พัฒนางาน',
    sub: 'พัฒนา + ทดสอบให้พร้อมส่งมอบ',
    action: 'ทำงานจริง เสร็จแล้วกด “พัฒนาเสร็จ พร้อมส่ง”',
    page: 'projects',
    where: 'งานทั้งหมด → เปิดงาน',
  },
  {
    n: 4, doc: 'DN', color: C.blue,
    label: 'ส่งมอบงาน',
    sub: 'ออกใบส่งงาน (DN) ลูกค้าตรวจรับ',
    action: 'เปิดงาน → กด “ออกใบส่งงาน”',
    page: 'projects',
    where: 'งานทั้งหมด → เปิดงาน',
  },
  {
    n: 5, doc: 'INV', color: C.burgundy,
    label: 'วางบิล / แจ้งหนี้',
    sub: 'ออกใบแจ้งหนี้ (INV) ส่งให้ลูกค้า',
    action: 'เปิดงาน → กด “ออกใบแจ้งหนี้”',
    page: 'projects',
    where: 'งานทั้งหมด → เปิดงาน',
  },
  {
    n: 6, doc: 'RC', color: C.green,
    label: 'รับเงิน + ออกใบเสร็จ',
    sub: 'บันทึกรับเงิน ระบบออกใบเสร็จ (RC)',
    action: 'เปิดงาน → กด “บันทึกรับเงิน”',
    page: 'projects',
    where: 'งานทั้งหมด → เปิดงาน',
  },
  {
    n: 7, doc: null, color: C.grayMed,
    label: 'ปิดงาน',
    sub: 'เก็บเข้าคลังงานที่เสร็จสมบูรณ์',
    action: 'งานเสร็จสมบูรณ์ — ไม่ต้องทำอะไรเพิ่ม',
    page: 'projects',
    where: 'งานทั้งหมด (เก็บถาวร)',
  },
]

const MENU_GUIDE = [
  { Icon: IconGrid, label: 'ภาพรวม', desc: 'สรุปงานค้าง · เงินรอเก็บ · กิจกรรมล่าสุด', page: 'dashboard' },
  { Icon: IconBriefcase, label: 'งานทั้งหมด', desc: 'รายการงาน — เปิดงานเพื่อเดินทีละขั้นตอน', page: 'projects' },
  { Icon: IconFile, label: 'เอกสาร', desc: 'ดูใบเสนอราคา/ส่งงาน/แจ้งหนี้ทุกใบข้ามงาน', page: 'documents' },
  { Icon: IconPaperclip, label: 'ไฟล์ & คอนเซป', desc: 'อัปโหลด/เปิดไฟล์ .md .html แนบกับงาน', page: 'files' },
  { Icon: IconUsers, label: 'ลูกค้า', desc: 'เพิ่ม/แก้ไข/ลบข้อมูลลูกค้า', page: 'clients' },
  { Icon: IconSettings, label: 'ตั้งค่า', desc: 'ข้อมูลผู้ออกเอกสาร · บัญชี · เลขรันนิ่งเอกสาร', page: 'settings' },
]

// Soft background tint for a stage color (cards / chips)
const tint = (color) => `${color}14`

function StageCard({ stage, projects, navigate, isLast }) {
  const count = projects.length
  // Steps 1-6 with work sitting in them are things you still need to act on.
  const needsAction = count > 0 && stage.n < 7

  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      {/* Rail: numbered dot + connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: count > 0 ? stage.color : C.white,
          border: count > 0 ? 'none' : `2px solid ${C.border}`,
          boxShadow: needsAction ? `0 0 0 4px ${tint(stage.color)}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700,
          color: count > 0 ? '#fff' : C.grayPale,
        }}>{stage.n}</div>
        {!isLast && <div style={{ flex: 1, width: 2, background: C.border, marginTop: 2, minHeight: 22 }} />}
      </div>

      {/* Card */}
      <div style={{
        flex: 1, minWidth: 0, marginBottom: 14,
        background: C.white,
        border: `1px solid ${needsAction ? stage.color : C.border}`,
        borderLeft: `4px solid ${stage.color}`,
        borderRadius: 12, padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14.5, color: C.ink }}>{stage.label}</span>
              {stage.doc && (
                <span style={{
                  fontFamily: "'Space Grotesk'", fontSize: 10.5, fontWeight: 700, color: '#fff',
                  background: DOC_COLORS[stage.doc], borderRadius: 6, padding: '2px 7px',
                }}>{stage.doc}</span>
              )}
            </div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed, marginTop: 3 }}>{stage.sub}</div>
          </div>
          {/* Live count of projects sitting at this stage */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, lineHeight: 1, color: count > 0 ? stage.color : C.grayPale }}>{count}</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayLight, marginTop: 2 }}>งาน</div>
          </div>
        </div>

        {/* What to do at this stage */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, marginTop: 11,
          background: tint(stage.color), borderRadius: 8, padding: '8px 10px',
        }}>
          <IconArrowRight size={14} stroke={stage.color} />
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{stage.action}</span>
        </div>

        {/* Projects currently here — click to jump straight to the action */}
        {count > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
            {projects.map((p) => (
              <span
                key={p.id}
                onClick={() => navigate('project', { projectId: p.id })}
                title={`เปิดงาน ${p.name}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: stage.color,
                  background: tint(stage.color), border: `1px solid ${stage.color}33`,
                  borderRadius: 20, padding: '4px 11px',
                }}
              >
                {p.name}
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: C.grayMed }}>{p.id}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function FlowDiagram({ navigate }) {
  const { data: projects, loading, error, reload } = useAsync(getProjects, [])

  // Bucket every project into the stage it is currently sitting at (1-7).
  const byStage = {}
  for (let n = 1; n <= 7; n++) byStage[n] = []
  ;(projects || []).forEach((p) => {
    const n = Math.min(Math.max(p.currentStep || 1, 1), 7)
    byStage[n].push(p)
  })
  const openCount = (projects || []).filter((p) => p.status !== 'ปิดงาน').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="ao-topbar" style={{
        height: 64, borderBottom: `1px solid ${C.border}`,
        padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.white, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink, lineHeight: 1.1 }}>โฟลว์งาน — เส้นทางการทำงาน</div>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>มองรอบเดียวรู้ว่าแต่ละงานอยู่ขั้นไหน และต้องไปกดที่ไหนต่อ</div>
        </div>
        <button
          onClick={() => navigate('wizard')}
          className="btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600,
            color: C.white, background: C.teal, border: 'none',
            borderRadius: 9, padding: '9px 15px', cursor: 'pointer',
          }}
        >
          <IconPlus size={15} stroke={C.white} />
          สร้างงานใหม่
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '26px 28px', background: C.bg, overflow: 'auto' }}>
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {projects && (
          <>
            {/* Document chain at a glance */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13.5, color: C.ink, marginBottom: 12 }}>สายโซ่เอกสาร</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { k: 'QT', t: 'ใบเสนอราคา' },
                  { k: 'DN', t: 'ใบส่งงาน' },
                  { k: 'INV', t: 'ใบแจ้งหนี้' },
                  { k: 'RC', t: 'ใบเสร็จรับเงิน' },
                ].map((d, i, arr) => (
                  <div key={d.k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: tint(DOC_COLORS[d.k]), borderRadius: 9, padding: '7px 12px' }}>
                      <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: DOC_COLORS[d.k] }}>{d.k}</span>
                      <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.ink }}>{d.t}</span>
                    </div>
                    {i < arr.length - 1 && <IconArrowRight size={15} stroke={C.grayPale} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="ao-stack-mobile" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* Left: the 7-stage flow */}
              <div style={{ flex: 1.7, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>7 ขั้นตอนของทุกงาน</span>
                  <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed }}>
                    กำลังดำเนินการ <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, color: C.teal }}>{openCount}</span> งาน
                  </span>
                </div>
                {STAGES.map((stage, i) => (
                  <StageCard
                    key={stage.n}
                    stage={stage}
                    projects={byStage[stage.n]}
                    navigate={navigate}
                    isLast={i === STAGES.length - 1}
                  />
                ))}
              </div>

              {/* Right: menu guide + how-to-read */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 14 }}>อยากทำอะไร ไปเมนูไหน</div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
                  {MENU_GUIDE.map(({ Icon, label, desc, page }, i, arr) => (
                    <div
                      key={page}
                      className="card-hover"
                      onClick={() => navigate(page)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                        padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                      }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={17} stroke={C.teal} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.ink }}>{label}</div>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, lineHeight: 1.35 }}>{desc}</div>
                      </div>
                      <IconArrowRight size={15} stroke={C.grayPale} />
                    </div>
                  ))}
                </div>

                {/* How to read */}
                <div style={{ background: C.panel, border: `1px dashed ${C.borderDash}`, borderRadius: 13, padding: 16, marginTop: 16 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 10 }}>วิธีอ่านแผนผัง</div>
                  {[
                    { c: C.teal, t: 'จุดมีสี = มีงานค้างอยู่ขั้นนั้น' },
                    { c: C.amber, t: 'วงแหวนรอบจุด = ขั้นที่ต้องลงมือทำ' },
                    { c: C.grayPale, t: 'จุดว่าง = ยังไม่มีงานอยู่ขั้นนั้น' },
                  ].map(({ c, t }) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                      <span style={{ width: 13, height: 13, borderRadius: '50%', background: c, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed, lineHeight: 1.35 }}>{t}</span>
                    </div>
                  ))}
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 4, lineHeight: 1.45 }}>
                    แตะชื่องานในแต่ละขั้นเพื่อเปิดงานนั้นและกดปุ่มขั้นตอนถัดไปได้ทันที
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
