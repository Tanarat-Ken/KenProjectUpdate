import { useState } from 'react'
import { C, DOC_COLORS } from '../theme'
import { StatusBadge } from '../components/StatusBadge'
import { IconCheck, IconPrint, IconSend, IconEdit, IconUpload } from '../components/Icons'
import { Loading, ErrorState, EmptyState } from '../components/States'
import { FileViewer } from '../components/FileViewer'
import { useAsync } from '../lib/useAsync'
import { getProjectByCode, uploadFile, deleteFile } from '../lib/api'
import { useOwner } from '../lib/settings'
import { baht, timeThai } from '../lib/format'

const TABS = ['ภาพรวม', 'เอกสาร', 'ไฟล์ & คอนเซป', 'ประวัติการแก้ไข']

const STEP_DEFS = [
  { n: 1, label: 'สร้างงาน + เสนอราคา', type: 'QT', sub: 'ออกใบเสนอราคาให้ลูกค้า' },
  { n: 2, label: 'ลูกค้าตอบรับข้อเสนอ', sub: 'ยืนยันจ้างงาน / รับมัดจำ' },
  { n: 3, label: 'พัฒนางาน', sub: 'พัฒนา + ทดสอบให้พร้อมส่งมอบ' },
  { n: 4, label: 'ส่งมอบงาน', type: 'DN', sub: 'ออกใบส่งงาน ลูกค้าตรวจรับ' },
  { n: 5, label: 'วางบิล / แจ้งหนี้', type: 'INV', sub: 'ออกใบแจ้งหนี้ ส่งให้ลูกค้า' },
  { n: 6, label: 'รับเงิน + ออกใบเสร็จ', type: 'RC', sub: 'บันทึกรับเงิน ระบบออกใบเสร็จ' },
  { n: 7, label: 'ปิดงาน', sub: 'เก็บเข้าคลังงานที่เสร็จสมบูรณ์' },
]

function buildSteps(project) {
  const docOf = (type) => project.documents.find((d) => d.type === type)
  const cur = project.currentStep || 1
  return STEP_DEFS.map((s) => {
    const doc = s.type ? docOf(s.type) : null
    const done = cur > s.n
    const current = cur === s.n
    return {
      ...s,
      done,
      current,
      pending: cur < s.n,
      docId: doc && !doc.pending ? doc.id : null,
      docColor: s.type ? DOC_COLORS[s.type] : null,
      tag: done ? '✓ บันทึกแล้ว' : current ? project.status : '',
      tagColor: done ? C.green : current ? C.burgundy : C.grayPale,
      tagBg: current ? C.burgundyLight : null,
    }
  })
}

function OverviewTab({ project, navigate }) {
  const steps = buildSteps(project)
  const c = project.customer
  return (
    <div style={{ flex: 1, padding: '24px 28px', background: C.bg, overflow: 'auto', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {/* Left: Pipeline steps */}
      <div style={{ flex: 1.5, minWidth: 280 }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 13 }}>ขั้นตอนงาน — ทำทีละ step</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '8px 20px' }}>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            const dotBg = step.done ? C.green : step.current ? step.docColor || C.burgundy : C.white
            return (
              <div key={step.n} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: isLast ? 'none' : `1px solid ${C.borderLight}` }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: dotBg,
                    border: step.pending ? `2px solid ${C.border}` : step.current ? `3px solid ${step.tagBg}` : 'none',
                    boxShadow: step.current ? `0 0 0 1px ${dotBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {step.done
                      ? <IconCheck size={14} stroke="#fff" />
                      : <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, color: step.pending ? C.grayPale : '#fff' }}>{step.n}</span>}
                  </div>
                  {!isLast && <div style={{ flex: 1, width: 2, background: C.border, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: step.current ? 700 : 600, color: step.pending ? C.grayLight : step.current ? dotBg : C.ink }}>
                    {step.label}{step.current ? ' — ขั้นปัจจุบัน' : ''}
                  </div>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: step.pending ? C.grayPale : C.grayMed, marginTop: 2 }}>
                    {step.docId && <span style={{ fontFamily: "'Space Grotesk'", color: step.docColor }}>{step.docId} · </span>}{step.sub}
                  </div>
                  {step.current && (
                    <button onClick={() => navigate('wizard', { projectId: project.id })} style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: '#fff', background: dotBg, border: 'none', borderRadius: 8, padding: '6px 13px', marginTop: 9, cursor: 'pointer' }}>ทำขั้นนี้ →</button>
                  )}
                </div>
                {step.tag && (
                  <span style={{
                    fontFamily: "'Sarabun'", fontSize: 10.5, fontWeight: 600, color: step.tagColor,
                    background: step.tagBg || 'transparent', padding: step.tagBg ? '3px 9px' : 0,
                    borderRadius: step.tagBg ? 14 : 0, alignSelf: 'flex-start', marginTop: 2, flexShrink: 0,
                  }}>{step.tag}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Info + docs */}
      <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 13 }}>ข้อมูลงาน</div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '16px 18px' }}>
            {[
              { label: 'ลูกค้า', value: project.client },
              { label: 'ผู้ติดต่อ', value: c?.contact_name || '—' },
              { label: 'มูลค่างาน', value: baht(project.value), mono: true },
              { label: 'เริ่ม / ส่งมอบ', value: project.startDate || project.deliverDate ? `${project.startDate || '—'} → ${project.deliverDate || '—'}` : '—' },
              { label: 'ผู้ดูแล', value: project.managers || '—' },
            ].map(({ label, value, mono }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', gap: 12 }}>
                <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight, flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: mono ? "'Space Grotesk'" : "'Sarabun'", fontSize: mono ? 13 : 12.5, fontWeight: 600, color: C.ink, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
          {project.description && (
            <div style={{ background: C.panel, border: `1px dashed ${C.borderDash}`, borderRadius: 11, padding: '12px 15px', marginTop: 12, fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayMed, lineHeight: 1.6 }}>
              {project.description}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 13 }}>เอกสารในงานนี้</div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
            {project.documents.map((doc, i) => {
              const color = DOC_COLORS[doc.type] || C.grayPale
              const isPending = doc.pending
              return (
                <div key={doc.type} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 16px', borderBottom: i < project.documents.length - 1 ? `1px solid ${C.borderLight}` : 'none', opacity: isPending ? 0.6 : 1 }}>
                  <span style={{ width: 8, height: 30, borderRadius: 4, background: isPending ? C.border : color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: isPending ? C.grayLight : C.ink }}>{doc.label}</div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: isPending ? C.grayPale : C.grayLight }}>{isPending ? 'ยังไม่ออก' : doc.id}</div>
                  </div>
                  <span style={{ fontFamily: "'Sarabun'", fontSize: 10.5, fontWeight: isPending ? 400 : 600, color: isPending ? C.grayPale : C.grayMed }}>{doc.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const DOC_EN = { QT: 'QUOTATION', DN: 'DELIVERY NOTE', INV: 'INVOICE', RC: 'RECEIPT' }
const DOC_TH = { QT: 'ใบเสนอราคา', DN: 'ใบส่งงาน', INV: 'ใบแจ้งหนี้', RC: 'ใบเสร็จรับเงิน' }

function DocPreview({ type, project, owner }) {
  const color = DOC_COLORS[type] || C.ink
  const items = project.lineItems
  const total = items.reduce((s, it) => s + it.amount, 0)
  const c = project.customer
  return (
    <div className="ao-doc" style={{ width: 480, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,.1)', position: 'relative', borderRadius: 3 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: color }} />
      <div style={{ padding: '30px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="2.4" stroke="#fff" strokeWidth="1.6"/><circle cx="18" cy="18" r="2.4" stroke="#fff" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="#fff" strokeWidth="1.6"/><path d="M8.2 6H17M6 8.2V14a3.8 3.8 0 0 0 3.8 3.8h5.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 11, color: C.ink }}>{owner.name}</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 8, color: C.grayMed }}>{owner.role}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color }}>{DOC_EN[type]}</div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 9, color: C.ink }}>{DOC_TH[type]}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: C.grayLight, marginBottom: 3 }}>{type === 'INV' ? 'Bill to' : 'ลูกค้า'}</div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 10, color: C.ink }}>{project.client}</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 8, color: C.grayMed, lineHeight: 1.5 }}>{c?.address || ''}{c?.tax_id ? ` · เลขผู้เสียภาษี ${c.tax_id}` : ''}</div>
          </div>
          <div style={{ width: 170, background: color, borderRadius: 8, padding: '11px 13px', color: '#fff' }}>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 8, color: 'rgba(255,255,255,.85)' }}>{type === 'INV' ? 'ยอดที่ต้องชำระ' : type === 'RC' ? 'ยอดที่ชำระแล้ว' : 'ยอดรวม'}</div>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 23, lineHeight: 1.1 }}>{baht(total)}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.borderLight}` }}>
          <div style={{ display: 'flex', background: C.ink, padding: '6px 10px' }}>
            <span style={{ flex: 1, fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 7.5, color: '#fff' }}>รายละเอียด</span>
            <span style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 7.5, color: '#fff' }}>รวม</span>
          </div>
          {items.length === 0 && <div style={{ padding: '10px', fontFamily: "'Sarabun'", fontSize: 8, color: C.grayLight }}>— ไม่มีรายการ —</div>}
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', padding: '7px 10px', borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
              <span style={{ flex: 1, fontFamily: "'Sarabun'", fontWeight: 500, fontSize: 8, color: C.ink }}>{item.desc}</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 8, color: C.ink }}>{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, background: type === 'INV' ? C.burgundyLight : C.panel, border: `1px solid ${type === 'INV' ? C.burgundy : C.borderLight}`, borderRadius: 8, padding: '9px 13px' }}>
          <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 9, color: type === 'INV' ? C.burgundy : C.ink }}>{type === 'INV' ? 'ยอดที่ต้องชำระ' : 'ยอดรวมทั้งสิ้น'}</span>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: type === 'INV' ? C.burgundy : C.ink }}>{baht(total)}</span>
        </div>

        {type === 'INV' && (owner.bank || owner.promptPay) && (
          <div style={{ marginTop: 12, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: '9px 12px' }}>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 8, color: C.ink }}>{owner.bank}</div>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 12, color: C.ink }}>{owner.bankAccount}</div>
            {owner.promptPay && <div style={{ fontFamily: "'Sarabun'", fontSize: 7.5, color: C.grayMed }}>PromptPay {owner.promptPay}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ project }) {
  const owner = useOwner()
  const available = project.documents.filter((d) => !d.pending)
  const [activeId, setActiveId] = useState(available[available.length - 1]?.id || null)
  const current = project.documents.find((d) => d.id === activeId) || available[available.length - 1]
  const docColor = current ? DOC_COLORS[current.type] : C.grayMed

  if (available.length === 0) {
    return <EmptyState title="ยังไม่มีเอกสารในงานนี้" sub="Create a document from the wizard" />
  }

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, background: C.bg }}>
      <div style={{ width: 268, borderRight: `1px solid ${C.border}`, padding: '20px 18px', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 12 }}>เอกสารทั้งหมด ({project.documents.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {project.documents.map((doc) => {
            const color = DOC_COLORS[doc.type] || C.grayPale
            const isActive = doc.id === activeId
            const isPending = doc.pending
            return (
              <div key={doc.type} onClick={() => !isPending && setActiveId(doc.id)} style={{
                background: isPending ? C.panel : C.white,
                border: isActive ? `2px solid ${color}` : `1px solid ${isPending ? C.borderDash : C.border}`,
                borderStyle: isPending ? 'dashed' : 'solid', borderRadius: 11, padding: '12px 13px',
                cursor: isPending ? 'default' : 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 7, height: 26, borderRadius: 4, background: isPending ? C.border : color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: isPending ? C.grayLight : C.ink }}>{doc.label}</div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10.5, color: isPending ? C.grayPale : (isActive ? color : C.grayLight) }}>
                      {isPending ? 'ยังไม่ออก' : `${doc.id}${isActive ? ' · กำลังดู' : ''}`}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${C.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 13, color: C.ink }}>{current?.id}</span>
            {current && <StatusBadge status={current.status} />}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              <IconPrint size={14} stroke="currentColor" />พิมพ์ PDF
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: '#fff', background: docColor, border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              <IconSend size={14} stroke="#fff" />ส่งให้ลูกค้า
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#EFEDE5', display: 'flex', justifyContent: 'center', padding: '26px 20px' }}>
          {current && <DocPreview type={current.type} project={project} owner={owner} />}
        </div>
      </div>
    </div>
  )
}

function FilesTab({ project, reload }) {
  const [activeId, setActiveId] = useState(project.files[0]?.id || null)
  const [busy, setBusy] = useState(false)
  const file = project.files.find((f) => f.id === activeId) || project.files[0]

  const onUpload = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    try {
      await uploadFile(project.uuid, f)
      await reload()
    } catch (err) {
      alert('อัปโหลดไม่สำเร็จ: ' + (err.message || err))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const onDelete = async (f) => {
    if (!confirm(`ลบไฟล์ "${f.name}"?`)) return
    await deleteFile(f)
    await reload()
  }

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, background: C.bg }}>
      <div style={{ width: 300, borderRight: `1px solid ${C.border}`, padding: '20px 18px', flexShrink: 0 }}>
        <label style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: C.teal, background: C.white, border: `1px dashed ${C.teal}`, borderRadius: 10, padding: 11, marginBottom: 16, cursor: 'pointer' }}>
          <IconUpload size={15} stroke={C.teal} />
          {busy ? 'กำลังอัปโหลด…' : 'อัปโหลดไฟล์ (.md, .html, …)'}
          <input type="file" onChange={onUpload} disabled={busy} style={{ display: 'none' }} />
        </label>
        <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: C.grayLight, marginBottom: 10 }}>ไฟล์ในงานนี้ · {project.files.length}</div>
        {project.files.length === 0 && <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>ยังไม่มีไฟล์ — อัปโหลดไฟล์คอนเซป .md / .html ได้เลย</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {project.files.map((f) => (
            <div key={f.id} onClick={() => setActiveId(f.id)} style={{ background: C.white, border: file?.id === f.id ? `2px solid ${C.teal}` : `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 9, color: '#fff', background: f.typeColor, padding: '3px 6px', borderRadius: 5, flexShrink: 0 }}>{f.type}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayLight }}>{f.size}{file?.id === f.id ? ' · กำลังดู' : ''}</div>
              </div>
              <span onClick={(e) => { e.stopPropagation(); onDelete(f) }} title="ลบ" style={{ color: C.grayPale, fontSize: 15, cursor: 'pointer', flexShrink: 0 }}>×</span>
            </div>
          ))}
        </div>
      </div>
      <FileViewer file={file} />
    </div>
  )
}

function RevisionsTab({ project }) {
  const revisions = project.revisions
  if (revisions.length === 0) {
    return <EmptyState title="ยังไม่มีประวัติการแก้ไข" sub="Activity will appear here" />
  }
  return (
    <div style={{ flex: 1, padding: '22px 26px', background: C.bg, overflow: 'auto' }}>
      <div style={{ position: 'relative' }}>
        {revisions.map((rev, i) => {
          const isLast = i === revisions.length - 1
          return (
            <div key={rev.id} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: rev.color || C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {rev.icon === 'check'
                    ? <IconCheck size={16} stroke="#fff" />
                    : rev.icon === 'file'
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
                    : <IconEdit size={15} stroke="#fff" />}
                </div>
                {!isLast && <div style={{ flex: 1, width: 2, background: C.border, marginTop: 5 }} />}
              </div>
              <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, gap: 10 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink }}>
                    {rev.title}{' '}
                    {rev.docId && <span style={{ fontFamily: "'Space Grotesk'", color: rev.docColor }}>{rev.docId}</span>}
                    {rev.rev && <span style={{ fontFamily: "'Sarabun'", fontSize: 10.5, fontWeight: 500, color: C.amber, background: C.amberLight, padding: '2px 7px', borderRadius: 10, marginLeft: 6 }}>{rev.rev}</span>}
                  </div>
                  <span style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight, flexShrink: 0 }}>{timeThai(rev.time)}</span>
                </div>
                {rev.detail && <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed, lineHeight: 1.5 }}>{rev.detail}</div>}
                {Array.isArray(rev.diff) && rev.diff.length > 0 && (
                  <div style={{ background: C.panel, borderRadius: 8, padding: '9px 12px', marginTop: 4 }}>
                    {rev.diff.map((d, j) => (
                      <div key={j} style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: d.type === 'remove' ? C.burgundy : C.green, lineHeight: 1.6 }}>{d.text}</div>
                    ))}
                  </div>
                )}
                {rev.user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: rev.userColor || C.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 9 }}>{rev.userInitial}</div>
                    <span style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>โดย {rev.user}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ProjectDetail({ projectId, navigate }) {
  const [tab, setTab] = useState(0)
  const { data: project, loading, error, reload } = useAsync(() => getProjectByCode(projectId), [projectId])

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex' }}><Loading /></div>
  }
  if (error) {
    return <div style={{ height: '100vh', display: 'flex' }}><ErrorState error={error} onRetry={reload} /></div>
  }
  if (!project) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <EmptyState title="ไม่พบงานนี้" sub={projectId} />
        <div style={{ textAlign: 'center', paddingBottom: 30 }}>
          <button onClick={() => navigate('projects')} className="btn" style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: '#fff', background: C.teal, border: 'none', borderRadius: 9, padding: '8px 18px', cursor: 'pointer' }}>← กลับไปงานทั้งหมด</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 28px 0', flexShrink: 0, background: C.white }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginBottom: 8 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('projects')}>งานทั้งหมด</span>
          <span>/</span>
          <span style={{ fontFamily: "'Space Grotesk'" }}>{project.id}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 19, color: C.ink, lineHeight: 1.1 }}>{project.name}</div>
            {project.client && <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayMed, marginTop: 3 }}>{project.client}{project.startDate ? ` · เริ่ม ${project.startDate}` : ''}</div>}
          </div>
          {tab === 0 && (
            <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
              <span style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: C.burgundy, background: C.burgundyLight, padding: '6px 14px', borderRadius: 20 }}>
                {project.status} · {baht(project.value)}
              </span>
              <button onClick={() => navigate('wizard', { projectId: project.id })} className="btn" style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: '#fff', background: C.teal, border: 'none', borderRadius: 9, padding: '8px 15px', cursor: 'pointer' }}>ทำขั้นต่อไป</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 26, marginTop: 14, overflowX: 'auto' }}>
          {TABS.map((t, i) => (
            <div key={t} onClick={() => setTab(i)} style={{
              fontFamily: "'Sarabun'", fontSize: 13, fontWeight: tab === i ? 600 : 500,
              color: tab === i ? C.teal : C.grayLight, paddingBottom: 11,
              borderBottom: `2px solid ${tab === i ? C.teal : 'transparent'}`, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 0 && <OverviewTab project={project} navigate={navigate} />}
        {tab === 1 && <DocumentsTab project={project} />}
        {tab === 2 && <FilesTab project={project} reload={reload} />}
        {tab === 3 && <RevisionsTab project={project} />}
      </div>
    </div>
  )
}
