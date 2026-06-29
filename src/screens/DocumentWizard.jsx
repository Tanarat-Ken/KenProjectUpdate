import { useState, useEffect } from 'react'
import { C } from '../theme'
import { IconFile, IconCheck, IconPlus } from '../components/Icons'
import { Loading } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getCustomers, getProjectByCode, createProject, createDocument } from '../lib/api'
import { baht } from '../lib/format'

/* ------------------------------------------------------------------ shared shell */
function StepDot({ n, label, state }) {
  const bg = state === 'done' ? C.green : state === 'current' ? C.teal : C.white
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: bg, border: state === 'pending' ? `2px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state === 'done' ? <IconCheck size={13} stroke="#fff" /> : <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: state === 'pending' ? C.grayPale : '#fff' }}>{n}</span>}
      </div>
      <span style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: state === 'current' ? 600 : 500, color: state === 'current' ? C.teal : state === 'done' ? C.ink : C.grayLight }}>{label}</span>
    </div>
  )
}
function StepBar({ labels, step, accent }) {
  return (
    <div style={{ padding: '18px 26px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', flexShrink: 0, overflowX: 'auto' }}>
      {labels.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < labels.length - 1 ? 1 : 'none', minWidth: 'fit-content' }}>
          <StepDot n={i + 1} label={label} state={i < step - 1 ? 'done' : i === step - 1 ? 'current' : 'pending'} />
          {i < labels.length - 1 && <div style={{ flex: 1, height: 2, background: i < step - 1 ? C.green : C.border, margin: '0 12px', minWidth: 18 }} />}
        </div>
      ))}
    </div>
  )
}
const fieldStyle = { width: '100%', boxSizing: 'border-box', background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', fontFamily: "'Sarabun'", fontSize: 13.5, color: C.ink, outline: 'none' }
const labelStyle = { fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.grayMed, marginBottom: 6, display: 'block' }
const sectionHint = { fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight, marginBottom: 16, lineHeight: 1.5 }

function ItemsEditor({ items, setItems, accent }) {
  const total = items.reduce((s, it) => s + Number(it.amount || 0), 0)
  return (
    <>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'flex', padding: '9px 15px', background: C.panel, borderBottom: `1px solid ${C.borderLight}` }}>
          <span style={{ flex: 1, fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: C.grayLight }}>รายละเอียดงาน</span>
          <span style={{ width: 120, textAlign: 'right', fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: C.grayLight }}>ราคา (บาท)</span>
          <span style={{ width: 24 }} />
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 15px', borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
            <input value={it.desc} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="เช่น พัฒนาบอทดึงรายงาน" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Sarabun'", fontSize: 13, color: C.ink }} />
            <input type="number" value={it.amount} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))} style={{ width: 120, textAlign: 'right', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 11px', fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: C.ink, outline: 'none' }} />
            <span onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : items)} style={{ width: 24, textAlign: 'center', color: C.grayPale, cursor: items.length > 1 ? 'pointer' : 'default', fontSize: 17 }}>×</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => setItems([...items, { desc: '', amount: 0 }])} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: accent, cursor: 'pointer' }}>
          <IconPlus size={15} stroke={accent} /> เพิ่มรายการ
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 13, color: C.grayMed }}>ยอดรวม</span>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: accent }}>{baht(total)}</span>
        </div>
      </div>
    </>
  )
}

/* ================================================================ NEW-JOB FLOW */
const NEWJOB_STEPS = ['ลูกค้า', 'รายละเอียดงาน', 'รายการ & ราคา', 'ตรวจ & สร้าง']
const emptyCust = { name: '', contact_name: '', phone: '', email: '' }

function NewJobWizard({ navigate }) {
  const accent = C.teal
  const { data: customers } = useAsync(getCustomers, [])
  const [step, setStep] = useState(1)
  const [custMode, setCustMode] = useState('existing')
  const [custId, setCustId] = useState(null)
  const [newCust, setNewCust] = useState(emptyCust)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [items, setItems] = useState([{ desc: '', amount: 0 }])
  const [busy, setBusy] = useState(false)

  // default to "new customer" if there are none yet
  useEffect(() => { if (customers && customers.length === 0) setCustMode('new') }, [customers])

  const chosenCustomer = custMode === 'new'
    ? (newCust.name.trim() ? newCust : null)
    : (customers || []).find((c) => c.id === custId) || null

  const canNext =
    step === 1 ? !!chosenCustomer :
    step === 2 ? !!name.trim() :
    step === 3 ? items.some((it) => it.desc.trim()) : true

  const submit = async () => {
    setBusy(true)
    try {
      const { code } = await createProject({
        customer: custMode === 'new' ? newCust : { id: custId, name: chosenCustomer?.name },
        name, description: desc, items,
      })
      alert(`สร้างงานสำเร็จ — ออกใบเสนอราคาให้แล้ว ✓`)
      navigate('project', { projectId: code })
    } catch (err) {
      alert('สร้างงานไม่สำเร็จ: ' + (err.message || err))
    } finally { setBusy(false) }
  }

  return (
    <Shell
      title="สร้างงานใหม่"
      subtitle="เริ่มต้นด้วยการออกใบเสนอราคาให้ลูกค้า"
      accent={accent}
      labels={NEWJOB_STEPS}
      step={step}
      onClose={() => navigate('dashboard')}
      onBack={() => (step > 1 ? setStep(step - 1) : navigate('dashboard'))}
      next={step < 4
        ? { label: ['', 'ถัดไป', 'ถัดไป', 'ถัดไป'][step] + ' →', disabled: !canNext, onClick: () => setStep(step + 1) }
        : { label: busy ? 'กำลังสร้าง…' : 'สร้างงาน + ออกใบเสนอราคา', disabled: busy, onClick: submit }}
    >
      {step === 1 && (
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 5 }}>งานนี้ทำให้ลูกค้าคนไหน?</div>
          <div style={sectionHint}>เลือกลูกค้าที่เคยทำ หรือเพิ่มลูกค้าใหม่ (ใส่แค่ชื่อก็พอ ที่เหลือเติมทีหลังได้)</div>

          <div style={{ display: 'inline-flex', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3, marginBottom: 16 }}>
            {[['existing', 'ลูกค้าเดิม'], ['new', 'ลูกค้าใหม่']].map(([k, lb]) => (
              <span key={k} onClick={() => setCustMode(k)} style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: custMode === k ? '#fff' : C.grayMed, background: custMode === k ? accent : 'transparent', padding: '7px 16px', borderRadius: 8, cursor: 'pointer' }}>{lb}</span>
            ))}
          </div>

          {custMode === 'existing' ? (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden' }}>
              {(customers || []).length === 0 && <div style={{ padding: 16, fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight }}>ยังไม่มีลูกค้า — กดแท็บ “ลูกค้าใหม่” เพื่อเพิ่ม</div>}
              {(customers || []).map((c, i, arr) => (
                <div key={c.id} onClick={() => setCustId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.borderLight}` : 'none', cursor: 'pointer', background: custId === c.id ? C.tealLight : 'transparent' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${custId === c.id ? accent : C.border}`, background: custId === c.id ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {custId === c.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: 600, color: C.ink }}>{c.name}</div>
                    {(c.contact_name || c.email) && <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{c.contact_name || c.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, maxWidth: 560 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>ชื่อบริษัท / ลูกค้า *</label>
                <input autoFocus value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} placeholder="เช่น บริษัท ตัวอย่าง จำกัด" style={fieldStyle} />
              </div>
              <div><label style={labelStyle}>ผู้ติดต่อ</label><input value={newCust.contact_name} onChange={(e) => setNewCust({ ...newCust, contact_name: e.target.value })} style={fieldStyle} /></div>
              <div><label style={labelStyle}>เบอร์โทร</label><input value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} style={fieldStyle} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>อีเมล</label><input value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} style={fieldStyle} /></div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 5 }}>งานนี้ทำเรื่องอะไร?</div>
          <div style={sectionHint}>ตั้งชื่อให้จำง่าย จะได้หาเจอภายหลัง</div>
          <label style={labelStyle}>ชื่องาน *</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ทำบอทดึงรายงานยอดขายรายวัน" style={{ ...fieldStyle, marginBottom: 16 }} />
          <label style={labelStyle}>รายละเอียด / โน้ต (ไม่บังคับ)</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="ขอบเขตงานคร่าว ๆ หรือสิ่งที่ลูกค้าต้องการ" style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 5 }}>จะเสนอราคาเท่าไหร่?</div>
          <div style={sectionHint}>ใส่งานที่จะทำพร้อมราคาแต่ละรายการ — รายการเหล่านี้จะกลายเป็น “ใบเสนอราคา” ใบแรกของงานอัตโนมัติ</div>
          <ItemsEditor items={items} setItems={setItems} accent={accent} />
        </div>
      )}

      {step === 4 && (
        <div style={{ maxWidth: 540 }}>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 14 }}>ตรวจสอบก่อนสร้าง</div>
          <SummaryCard rows={[
            ['ลูกค้า', chosenCustomer?.name || '—'],
            ['ชื่องาน', name || '—'],
            ['จำนวนรายการ', `${items.filter((it) => it.desc.trim()).length} รายการ`],
            ['ยอดเสนอราคา', baht(items.reduce((s, it) => s + Number(it.amount || 0), 0))],
          ]} />
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 14, background: C.tealLight, border: `1px solid ${C.tealMid}`, borderRadius: 10, padding: '11px 14px' }}>
            <IconCheck size={16} stroke={C.teal} />
            <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.tealDark, lineHeight: 1.5 }}>ระบบจะสร้างงานใหม่ และออก<b>ใบเสนอราคา</b>ให้อัตโนมัติ — ข้อมูลผู้ออก/บัญชีดึงจากหน้า “ตั้งค่า”</span>
          </div>
        </div>
      )}
    </Shell>
  )
}

/* ================================================================ FOLLOW-UP DOC FLOW */
const DOC_STEPS = ['ชนิดเอกสาร', 'รายการ', 'เงื่อนไข', 'ตรวจ & ออก']
const DOC_INFO = {
  DN:  { label: 'ใบส่งงาน', color: C.blue, bg: C.blueLight, when: 'เมื่อทำงานเสร็จและส่งมอบให้ลูกค้าตรวจรับ' },
  INV: { label: 'ใบแจ้งหนี้', color: C.burgundy, bg: C.burgundyLight, when: 'เมื่อต้องการเรียกเก็บเงินจากลูกค้า' },
  QT:  { label: 'ใบเสนอราคา (ใหม่)', color: C.teal, bg: C.tealLight, when: 'เสนอราคาเพิ่ม หรือแก้ไขข้อเสนอเดิม' },
}
const DOC_ORDER = ['DN', 'INV', 'QT']

function recommendType(project) {
  const p = project.pipeline || {}
  if (!p.DN) return 'DN'
  if (!p.INV) return 'INV'
  return 'INV'
}

function DocWizard({ navigate, projectCode, initialType }) {
  const { data: project, loading } = useAsync(() => getProjectByCode(projectCode), [projectCode])
  const [step, setStep] = useState(1)
  const [type, setType] = useState(initialType || null)
  const [items, setItems] = useState([])
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (project && !type) setType(recommendType(project))
  }, [project]) // eslint-disable-line
  useEffect(() => {
    if (project) setItems(project.lineItems?.length ? project.lineItems.map((it) => ({ ...it })) : [{ desc: '', amount: 0 }])
  }, [project])

  if (loading || !project) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: C.bg }}><Loading /></div>

  const info = DOC_INFO[type] || DOC_INFO.DN
  const accent = info.color
  const recommended = recommendType(project)
  const total = items.reduce((s, it) => s + Number(it.amount || 0), 0)
  const canNext = step === 1 ? !!type : true

  const submit = async () => {
    setBusy(true)
    try {
      const { number } = await createDocument({ type, project, items: items.filter((it) => it.desc.trim()), dueDate, note })
      alert(`ออก${info.label}สำเร็จ: ${number}`)
      navigate('project', { projectId: project.id })
    } catch (err) {
      alert('ออกเอกสารไม่สำเร็จ: ' + (err.message || err))
    } finally { setBusy(false) }
  }

  return (
    <Shell
      title={`ออก${info.label}`}
      subtitle={`${project.name} · ${project.client}`}
      accent={accent}
      labels={DOC_STEPS}
      step={step}
      onClose={() => navigate('project', { projectId: project.id })}
      onBack={() => (step > 1 ? setStep(step - 1) : navigate('project', { projectId: project.id }))}
      next={step < 4
        ? { label: 'ถัดไป →', disabled: !canNext, onClick: () => setStep(step + 1) }
        : { label: busy ? 'กำลังออกเอกสาร…' : `ออก${info.label}`, disabled: busy, onClick: submit }}
    >
      {step === 1 && (
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 5 }}>จะออกเอกสารอะไร?</div>
          <div style={sectionHint}>เลือกตามขั้นที่งานไปถึง — ระบบดึงรายการจากใบเสนอราคามาให้อัตโนมัติ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DOC_ORDER.map((k) => {
              const d = DOC_INFO[k]; const on = type === k
              return (
                <div key={k} onClick={() => setType(k)} style={{ display: 'flex', alignItems: 'center', gap: 14, border: on ? `2px solid ${d.color}` : `1px solid ${C.border}`, background: on ? d.bg : C.white, borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconFile size={20} stroke="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>{d.label}</span>
                      {k === recommended && <span style={{ fontFamily: "'Sarabun'", fontSize: 10, fontWeight: 700, color: '#fff', background: d.color, padding: '2px 8px', borderRadius: 10 }}>แนะนำ</span>}
                    </div>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed, marginTop: 2 }}>{d.when}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${on ? d.color : C.border}`, background: on ? d.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <IconCheck size={12} stroke="#fff" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 5 }}>รายการในเอกสาร</div>
          <div style={sectionHint}>ดึงมาจากใบเสนอราคาของงานนี้แล้ว — แก้ได้ตามจริง</div>
          <ItemsEditor items={items} setItems={setItems} accent={accent} />
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: 540 }}>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 5 }}>เงื่อนไข</div>
          <div style={sectionHint}>{type === 'INV' ? 'กำหนดวันครบชำระและหมายเหตุ' : 'เพิ่มหมายเหตุถ้ามี (ไม่บังคับ)'}</div>
          {type === 'INV' && (
            <div style={{ marginBottom: 16, maxWidth: 240 }}>
              <label style={labelStyle}>วันครบกำหนดชำระ</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={fieldStyle} />
            </div>
          )}
          <label style={labelStyle}>หมายเหตุ</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="เช่น เงื่อนไขการชำระเงิน" style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>
      )}

      {step === 4 && (
        <div style={{ maxWidth: 540 }}>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 14 }}>ตรวจสอบก่อนออกเอกสาร</div>
          <SummaryCard rows={[
            ['ชนิดเอกสาร', info.label],
            ['งาน', project.name],
            ['ลูกค้า', project.client],
            ['จำนวนรายการ', `${items.filter((it) => it.desc.trim()).length} รายการ`],
            ['ยอดรวม', baht(total)],
            ...(type === 'INV' && dueDate ? [['ครบกำหนด', dueDate]] : []),
          ]} />
          <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 12 }}>เลขเอกสารออกอัตโนมัติตามที่ตั้งค่าไว้ และบันทึกลงฐานข้อมูลจริง</div>
        </div>
      )}
    </Shell>
  )
}

/* ------------------------------------------------------------------ shared bits */
function SummaryCard({ rows }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '6px 20px' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${C.borderLight}` }}>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight }}>{label}</span>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: 600, color: C.ink, textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function Shell({ title, subtitle, accent, labels, step, children, onClose, onBack, next }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.bg, padding: 20 }}>
      <div style={{ width: 880, maxWidth: '100%', background: C.white, borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column', height: 760, maxHeight: '92vh' }}>
        <div style={{ height: 60, borderBottom: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconFile size={17} stroke="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15.5, color: C.ink }}>{title}</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{subtitle}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ fontFamily: "'Sarabun'", fontSize: 19, color: C.grayPale, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <StepBar labels={labels} step={step} accent={accent} />

        <div style={{ flex: 1, overflow: 'auto', background: C.bg, padding: '24px 26px' }}>{children}</div>

        <div style={{ height: 64, borderTop: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={onBack} style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 18px', cursor: 'pointer' }}>← ย้อนกลับ</button>
          <button onClick={next.onClick} disabled={next.disabled} className="btn" style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: '#fff', background: accent, border: 'none', borderRadius: 9, padding: '10px 24px', cursor: next.disabled ? 'not-allowed' : 'pointer', opacity: next.disabled ? 0.5 : 1 }}>{next.label}</button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ entry */
export function DocumentWizard({ navigate, initial }) {
  if (initial?.projectId) return <DocWizard navigate={navigate} projectCode={initial.projectId} initialType={initial.type} />
  return <NewJobWizard navigate={navigate} />
}
