import { useState } from 'react'
import { C } from '../theme'
import { IconFile, IconCheck, IconPlus } from '../components/Icons'
import { PROJECTS, LINE_ITEMS, OWNER } from '../data'

const DOC_TYPES = [
  { key: 'QT', label: 'ใบเสนอราคา', color: C.teal, bg: C.tealLight },
  { key: 'DN', label: 'ใบส่งงาน', color: C.blue, bg: C.blueLight },
  { key: 'INV', label: 'ใบแจ้งหนี้', color: C.burgundy, bg: C.burgundyLight },
  { key: 'RC', label: 'ใบเสร็จรับเงิน', color: C.green, bg: C.greenLight },
]

const STEP_LABELS = ['เลือกลูกค้า', 'รายการ', 'เงื่อนไข', 'ตรวจ & ออก']

function StepDot({ n, label, state }) {
  // state: 'done' | 'current' | 'pending'
  const bgColor = state === 'done' ? C.green : state === 'current' ? C.burgundy : C.white
  const borderColor = state === 'pending' ? C.border : 'none'
  const textColor = state === 'pending' ? C.grayPale : '#fff'
  const labelColor = state === 'current' ? C.burgundy : state === 'done' ? C.ink : C.grayLight
  const labelWeight = state === 'current' ? 600 : 500

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: bgColor, border: state === 'pending' ? `2px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state === 'done'
          ? <IconCheck size={13} stroke="#fff" />
          : <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: textColor }}>{n}</span>
        }
      </div>
      <span style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: labelWeight, color: labelColor }}>{label}</span>
    </div>
  )
}

function StepBar({ step }) {
  const lineColor = (i) => i < step - 1 ? C.green : C.border
  return (
    <div style={{ padding: '18px 26px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      {STEP_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
          <StepDot
            n={i + 1}
            label={label}
            state={i < step - 1 ? 'done' : i === step - 1 ? 'current' : 'pending'}
          />
          {i < 3 && <div style={{ flex: 1, height: 2, background: lineColor(i), margin: '0 12px' }} />}
        </div>
      ))}
    </div>
  )
}

function Step1({ selectedProject, setSelectedProject, selectedType, setSelectedType }) {
  return (
    <div style={{ flex: 1, padding: '22px 26px', background: C.bg, overflow: 'auto' }}>
      <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>เลือกโปรเจกต์</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden', marginBottom: 20 }}>
        {PROJECTS.filter(p => p.status !== 'ปิดงาน').map((p, i, arr) => (
          <div
            key={p.id}
            onClick={() => setSelectedProject(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${C.borderLight}` : 'none',
              cursor: 'pointer',
              background: selectedProject === p.id ? C.tealLight : 'transparent',
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedProject === p.id ? C.teal : C.border}`, background: selectedProject === p.id ? C.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedProject === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
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
        {DOC_TYPES.map(dt => (
          <div
            key={dt.key}
            onClick={() => setSelectedType(dt.key)}
            style={{
              border: selectedType === dt.key ? `2px solid ${dt.color}` : `1px solid ${C.border}`,
              borderRadius: 11, padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
              background: selectedType === dt.key ? dt.bg : C.white,
            }}
          >
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: selectedType === dt.key ? dt.color : C.grayMed, marginBottom: 4 }}>{dt.key}</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: selectedType === dt.key ? dt.color : C.grayLight }}>{dt.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step2() {
  const [items, setItems] = useState(LINE_ITEMS.map(it => ({ ...it })))
  const total = items.reduce((s, it) => s + it.amount, 0)

  return (
    <div style={{ flex: 1, padding: '22px 26px', background: C.bg, overflow: 'auto' }}>
      <div style={{ background: C.tealLight, border: `1px solid ${C.tealMid}`, borderRadius: 10, padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round"/></svg>
        <span style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.tealDark }}>ดึงรายการจากใบเสนอราคา <b style={{ fontFamily: "'Space Grotesk'" }}>QT-2026-009</b> มาให้แล้ว — แก้ได้ตามจริง</span>
      </div>

      <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>รายการในใบแจ้งหนี้</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden', marginBottom: 16 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '11px 15px', borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: C.ink }}>{it.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 11px' }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12.5, fontWeight: 600, color: C.ink }}>{it.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 500, color: C.teal, marginBottom: 16, cursor: 'pointer' }}>
        <IconPlus size={14} stroke={C.teal} />
        เพิ่มรายการ
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 260, background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, padding: '13px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink }}>ยอดที่ต้องชำระ</span>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 19, color: C.burgundy }}>฿{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3() {
  return (
    <div style={{ flex: 1, padding: '22px 26px', background: C.bg, overflow: 'auto' }}>
      <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 11 }}>เงื่อนไขการชำระเงิน</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 500 }}>
        {[
          { label: 'วันครบกำหนด', value: '15 มี.ค. 2569' },
          { label: 'เครดิต', value: '15 วัน' },
          { label: 'หมายเหตุ', value: 'กรุณาโอนพร้อม VAT 7%' },
        ].map(({ label, value }) => (
          <div key={label} style={label === 'หมายเหตุ' ? { gridColumn: 'span 2' } : {}}>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>{label}</div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', fontFamily: "'Sarabun'", fontSize: 13, color: C.ink }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step4({ selectedProject, selectedType, onClose }) {
  const project = PROJECTS.find(p => p.id === selectedProject)
  const total = LINE_ITEMS.reduce((s, it) => s + it.amount, 0)
  const dt = DOC_TYPES.find(d => d.key === selectedType) || DOC_TYPES[2]

  return (
    <div style={{ flex: 1, padding: '22px 26px', background: C.bg, overflow: 'auto' }}>
      <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 14 }}>ตรวจสอบก่อนออกเอกสาร</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '18px 20px', maxWidth: 520 }}>
        {[
          { label: 'ประเภทเอกสาร', value: dt.label },
          { label: 'โปรเจกต์', value: project ? project.name : '-' },
          { label: 'ลูกค้า', value: project ? project.client : '-' },
          { label: 'ยอดชำระ', value: `฿${total.toLocaleString()}` },
          { label: 'ครบกำหนด', value: '15 มี.ค. 2569' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.borderLight}` }}>
            <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>{label}</span>
            <span style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.ink }}>{value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{ marginTop: 18, fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: '#fff', background: C.burgundy, border: 'none', borderRadius: 9, padding: '11px 26px', cursor: 'pointer' }}
        className="btn"
      >
        ออกเอกสาร →
      </button>
    </div>
  )
}

export function DocumentWizard({ navigate }) {
  const [step, setStep] = useState(2)
  const [selectedProject, setSelectedProject] = useState('P-2026-009')
  const [selectedType, setSelectedType] = useState('INV')

  const NEXT_LABELS = ['', 'ถัดไป: รายการ →', 'ถัดไป: เงื่อนไข →', 'ถัดไป: ตรวจ & ออก →', 'ออกเอกสาร →']

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
    else navigate('projects')
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else navigate('dashboard')
  }

  const docTypeLabel = DOC_TYPES.find(d => d.key === selectedType)?.label || 'เอกสาร'
  const docTypeColor = DOC_TYPES.find(d => d.key === selectedType)?.color || C.burgundy
  const docTypeBg = DOC_TYPES.find(d => d.key === selectedType)?.bg || C.burgundyLight

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.bg, padding: 20 }}>
      <div style={{ width: 880, background: C.white, borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', height: 760 }}>
        {/* Header */}
        <div style={{ height: 58, borderBottom: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: docTypeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconFile size={16} stroke="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: C.ink }}>สร้าง{docTypeLabel}</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>จากงาน {selectedProject || '—'}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('dashboard')}
            style={{ fontFamily: "'Sarabun'", fontSize: 18, color: C.grayPale, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Step bar */}
        <StepBar step={step} />

        {/* Step content */}
        {step === 1 && <Step1 selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedType={selectedType} setSelectedType={setSelectedType} />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 selectedProject={selectedProject} selectedType={selectedType} onClose={() => navigate('projects')} />}

        {/* Footer */}
        <div style={{ height: 62, borderTop: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button
            onClick={handleBack}
            style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 18px', cursor: 'pointer' }}
          >← ย้อนกลับ</button>
          {step < 4 && (
            <button
              onClick={handleNext}
              style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: '#fff', background: docTypeColor, border: 'none', borderRadius: 9, padding: '9px 22px', cursor: 'pointer' }}
              className="btn"
            >{NEXT_LABELS[step]}</button>
          )}
        </div>
      </div>
    </div>
  )
}
