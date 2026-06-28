import { useState, useEffect } from 'react'
import { C } from '../theme'
import { IconFile, IconCheck, IconPlus } from '../components/Icons'
import { Loading } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getProjects, getProjectByCode, createDocument } from '../lib/api'
import { baht } from '../lib/format'

const DOC_TYPES = [
  { key: 'QT', label: 'ใบเสนอราคา', color: C.teal, bg: C.tealLight },
  { key: 'DN', label: 'ใบส่งงาน', color: C.blue, bg: C.blueLight },
  { key: 'INV', label: 'ใบแจ้งหนี้', color: C.burgundy, bg: C.burgundyLight },
  { key: 'RC', label: 'ใบเสร็จรับเงิน', color: C.green, bg: C.greenLight },
]
const STEP_LABELS = ['เลือกงาน', 'รายการ', 'เงื่อนไข', 'ตรวจ & ออก']

function StepDot({ n, label, state }) {
  const bgColor = state === 'done' ? C.green : state === 'current' ? C.burgundy : C.white
  const textColor = state === 'pending' ? C.grayPale : '#fff'
  const labelColor = state === 'current' ? C.burgundy : state === 'done' ? C.ink : C.grayLight
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: bgColor, border: state === 'pending' ? `2px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state === 'done' ? <IconCheck size={13} stroke="#fff" /> : <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: textColor }}>{n}</span>}
      </div>
      <span style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: state === 'current' ? 600 : 500, color: labelColor }}>{label}</span>
    </div>
  )
}

function StepBar({ step }) {
  return (
    <div style={{ padding: '18px 26px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {STEP_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
          <StepDot n={i + 1} label={label} state={i < step - 1 ? 'done' : i === step - 1 ? 'current' : 'pending'} />
          {i < 3 && <div style={{ flex: 1, height: 2, background: i < step - 1 ? C.green : C.border, margin: '0 12px' }} />}
        </div>
      ))}
    </div>
  )
}

export function DocumentWizard({ navigate, initial }) {
  const { data: projects, loading } = useAsync(getProjects, [])
  const [step, setStep] = useState(1)
  const [projectCode, setProjectCode] = useState(initial?.projectId || null)
  const [type, setType] = useState('QT')
  const [project, setProject] = useState(null)
  const [items, setItems] = useState([])
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load full project (with line items) whenever the selected code changes
  useEffect(() => {
    let alive = true
    if (!projectCode) { setProject(null); return }
    getProjectByCode(projectCode).then((p) => {
      if (!alive) return
      setProject(p)
      setItems(p?.lineItems?.length ? p.lineItems.map((it) => ({ ...it })) : [{ desc: '', amount: 0 }])
    })
    return () => { alive = false }
  }, [projectCode])

  const dt = DOC_TYPES.find((d) => d.key === type) || DOC_TYPES[0]
  const total = items.reduce((s, it) => s + Number(it.amount || 0), 0)

  const canNext = step === 1 ? projectCode && type : true

  const handleNext = async () => {
    if (step < 4) { setStep(step + 1); return }
    // Final: create the document
    setSubmitting(true)
    try {
      const { number } = await createDocument({ type, project, items: items.filter((it) => it.desc), dueDate, note })
      window.dispatchEvent(new CustomEvent('agentoffice:cat-react', { detail: { action: 'happy' } }))
      alert(`ออก${dt.label}สำเร็จ: ${number}`)
      navigate('project', { projectId: project.id })
    } catch (err) {
      alert('ออกเอกสารไม่สำเร็จ: ' + (err.message || err))
    } finally {
      setSubmitting(false)
    }
  }
  const handleBack = () => (step > 1 ? setStep(step - 1) : navigate('dashboard'))

  const NEXT_LABELS = ['', 'ถัดไป: รายการ →', 'ถัดไป: เงื่อนไข →', 'ถัดไป: ตรวจ & ออก →', `ออก${dt.label} →`]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.bg, padding: 20 }}>
      <div style={{ width: 880, maxWidth: '100%', background: C.white, borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', height: 760, maxHeight: '92vh' }}>
        {/* Header */}
        <div style={{ height: 58, borderBottom: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: dt.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconFile size={16} stroke="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink }}>สร้าง{dt.label}</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>{project ? `จากงาน ${project.id}` : 'เลือกงานก่อน'}</div>
            </div>
          </div>
          <button onClick={() => navigate('dashboard')} style={{ fontFamily: "'Sarabun'", fontSize: 18, color: C.grayPale, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <StepBar step={step} />

        {/* Step content */}
        {loading ? <Loading /> : (
          <div style={{ flex: 1, overflow: 'auto', background: C.bg }}>
            {step === 1 && (
              <div style={{ padding: '22px 26px' }}>
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>เลือกงาน</div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden', marginBottom: 20 }}>
                  {(projects || []).length === 0 && <div style={{ padding: 16, fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight }}>ยังไม่มีงาน — สร้างงานในหน้า “งานทั้งหมด” ก่อน</div>}
                  {(projects || []).map((p, i, arr) => (
                    <div key={p.id} onClick={() => setProjectCode(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.borderLight}` : 'none', cursor: 'pointer', background: projectCode === p.id ? C.tealLight : 'transparent' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${projectCode === p.id ? C.teal : C.border}`, background: projectCode === p.id ? C.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {projectCode === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.ink }}>{p.name}</div>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{p.client} · <span style={{ fontFamily: "'Space Grotesk'" }}>{p.id}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>ประเภทเอกสาร</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {DOC_TYPES.map((d) => (
                    <div key={d.key} onClick={() => setType(d.key)} style={{ border: type === d.key ? `2px solid ${d.color}` : `1px solid ${C.border}`, borderRadius: 11, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', background: type === d.key ? d.bg : C.white }}>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: type === d.key ? d.color : C.grayMed, marginBottom: 4 }}>{d.key}</div>
                      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: type === d.key ? d.color : C.grayLight }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ padding: '22px 26px' }}>
                {project?.lineItems?.length > 0 && type !== 'QT' && (
                  <div style={{ background: C.tealLight, border: `1px solid ${C.tealMid}`, borderRadius: 10, padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round"/></svg>
                    <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.tealDark }}>ดึงรายการจากใบเสนอราคาของงานนี้มาให้แล้ว — แก้ได้ตามจริง</span>
                  </div>
                )}
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>รายการในเอกสาร</div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden', marginBottom: 16 }}>
                  {items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <input value={it.desc} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="รายละเอียดงาน" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Sarabun'", fontSize: 12.5, color: C.ink }} />
                      <input type="number" value={it.amount} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))} style={{ width: 110, textAlign: 'right', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 11px', fontFamily: "'Space Grotesk'", fontSize: 12.5, fontWeight: 600, color: C.ink, outline: 'none' }} />
                      <span onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ color: C.grayPale, cursor: 'pointer', fontSize: 16 }}>×</span>
                    </div>
                  ))}
                </div>
                <div onClick={() => setItems([...items, { desc: '', amount: 0 }])} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: C.teal, marginBottom: 16, cursor: 'pointer' }}>
                  <IconPlus size={14} stroke={C.teal} /> เพิ่มรายการ
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: 260, background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink }}>ยอดรวม</span>
                    <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 19, color: dt.color }}>{baht(total)}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ padding: '22px 26px' }}>
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>เงื่อนไข</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 520 }}>
                  {(type === 'INV') && (
                    <div>
                      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>วันครบกำหนดชำระ</div>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={fieldStyle} />
                    </div>
                  )}
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>หมายเหตุ</div>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="เช่น เงื่อนไขการชำระเงิน / รายละเอียดเพิ่มเติม" style={{ ...fieldStyle, resize: 'vertical' }} />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ padding: '22px 26px' }}>
                <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 14 }}>ตรวจสอบก่อนออกเอกสาร</div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '18px 20px', maxWidth: 520 }}>
                  {[
                    ['ประเภทเอกสาร', dt.label],
                    ['งาน', project?.name || '-'],
                    ['ลูกค้า', project?.client || '-'],
                    ['จำนวนรายการ', `${items.filter((it) => it.desc).length} รายการ`],
                    ['ยอดรวม', baht(total)],
                    ...(type === 'INV' && dueDate ? [['ครบกำหนด', dueDate]] : []),
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                      <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>{label}</span>
                      <span style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.ink }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 12 }}>เลขเอกสารจะถูกออกอัตโนมัติตามที่ตั้งค่าไว้ และบันทึกลงฐานข้อมูลจริง</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ height: 62, borderTop: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={handleBack} style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 18px', cursor: 'pointer' }}>← ย้อนกลับ</button>
          <button onClick={handleNext} disabled={!canNext || submitting} className="btn" style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: '#fff', background: dt.color, border: 'none', borderRadius: 9, padding: '9px 22px', cursor: canNext ? 'pointer' : 'not-allowed', opacity: !canNext || submitting ? 0.55 : 1 }}>
            {submitting ? 'กำลังออกเอกสาร…' : NEXT_LABELS[step]}
          </button>
        </div>
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%', boxSizing: 'border-box', background: C.white, border: `1px solid ${C.border}`,
  borderRadius: 9, padding: '10px 13px', fontFamily: "'Sarabun'", fontSize: 13, color: C.ink, outline: 'none',
}
