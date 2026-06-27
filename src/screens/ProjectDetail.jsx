import { useState } from 'react'
import { C, DOC_COLORS } from '../theme'
import { StatusBadge } from '../components/StatusBadge'
import { IconCheck, IconPrint, IconSend, IconEdit, IconUpload } from '../components/Icons'
import { PROJECTS, DOCUMENTS, LINE_ITEMS, FILES, REVISIONS, PIPELINE_STEPS, OWNER } from '../data'

const TABS = ['ภาพรวม', 'เอกสาร', 'ไฟล์ & คอนเซป', 'ประวัติการแก้ไข']

function OverviewTab({ project }) {
  return (
    <div style={{ flex: 1, padding: '24px 28px', background: C.bg, overflow: 'auto', display: 'flex', gap: 20 }}>
      {/* Left: Pipeline steps */}
      <div style={{ flex: 1.5, minWidth: 0 }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 13 }}>ขั้นตอนงาน — ทำทีละ step</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '8px 20px' }}>
          {PIPELINE_STEPS.map((step, i) => {
            const isLast = i === PIPELINE_STEPS.length - 1
            const dotBg = step.done ? C.green : step.current ? step.docColor || C.burgundy : C.white
            const connBg = step.connColor || (step.done ? C.border : C.border)

            return (
              <div key={step.n} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: isLast ? 'none' : `1px solid ${C.borderLight}` }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: dotBg,
                    border: step.pending ? `2px solid ${C.border}` : step.current ? `3px solid ${step.tagBg}` : 'none',
                    boxShadow: step.current ? `0 0 0 1px ${dotBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {step.done
                      ? <IconCheck size={14} stroke="#fff" />
                      : <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, color: step.pending ? C.grayPale : '#fff' }}>{step.n}</span>
                    }
                  </div>
                  {!isLast && <div style={{ flex: 1, width: 2, background: connBg, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: step.current ? 700 : 600, color: step.pending ? C.grayLight : step.current ? dotBg : C.ink }}>
                    {step.label}
                  </div>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: step.pending ? C.grayPale : C.grayMed, marginTop: 2 }}>
                    {step.docId
                      ? <>{step.sub.split(step.docId)[0]}<span style={{ fontFamily: "'Space Grotesk'", color: step.docColor }}>{step.docId}</span>{step.sub.split(step.docId)[1]}</>
                      : step.sub
                    }
                  </div>
                  {step.current && (
                    <button style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: '#fff', background: dotBg, border: 'none', borderRadius: 8, padding: '6px 13px', marginTop: 9, cursor: 'pointer' }}>บันทึกรับเงิน →</button>
                  )}
                </div>
                <span style={{
                  fontFamily: "'Sarabun'", fontSize: 10.5, fontWeight: 600,
                  color: step.tagColor,
                  background: step.tagBg || 'transparent',
                  padding: step.tagBg ? '3px 9px' : 0,
                  borderRadius: step.tagBg ? 14 : 0,
                  alignSelf: 'flex-start', marginTop: 2,
                  flexShrink: 0,
                }}>{step.tag}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Info + docs */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Project info */}
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 13 }}>ข้อมูลงาน</div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '16px 18px' }}>
            {[
              { label: 'ลูกค้า', value: PROJECTS[0].client },
              { label: 'ผู้ติดต่อ', value: PROJECTS[0].contact },
              { label: 'มูลค่างาน', value: `฿${PROJECTS[0].value.toLocaleString()}`, mono: true },
              { label: 'เริ่ม / ส่งมอบ', value: `${PROJECTS[0].startDate} → ${PROJECTS[0].deliverDate}` },
              { label: 'ผู้ดูแล', value: PROJECTS[0].managers },
            ].map(({ label, value, mono }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight }}>{label}</span>
                <span style={{ fontFamily: mono ? "'Space Grotesk'" : "'Sarabun'", fontSize: mono ? 13 : 12.5, fontWeight: 600, color: C.ink }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents mini-list */}
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 13 }}>เอกสารในงานนี้</div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
            {DOCUMENTS.map((doc, i) => {
              const color = DOC_COLORS[doc.type] || C.grayPale
              const isPending = doc.pending
              return (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 16px', borderBottom: i < DOCUMENTS.length - 1 ? `1px solid ${C.borderLight}` : 'none', opacity: isPending ? 0.6 : 1 }}>
                  <span style={{ width: 8, height: 30, borderRadius: 4, background: isPending ? C.border : color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: isPending ? C.grayLight : C.ink }}>{doc.label}</div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: isPending ? C.grayPale : C.grayLight }}>{isPending ? 'ยังไม่ออก' : doc.id}</div>
                  </div>
                  <span style={{ fontFamily: "'Sarabun'", fontSize: 10.5, fontWeight: isPending ? 400 : 600, color: isPending ? C.grayPale : (doc.status === 'รอชำระ' ? C.burgundy : C.green) }}>
                    {doc.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceDoc({ project }) {
  const total = LINE_ITEMS.reduce((s, it) => s + it.amount, 0)
  return (
    <div style={{ width: 480, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,.1)', position: 'relative', borderRadius: 3 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: C.burgundy }} />
      <div style={{ padding: '30px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="2.4" stroke="#fff" strokeWidth="1.6"/><circle cx="18" cy="18" r="2.4" stroke="#fff" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="#fff" strokeWidth="1.6"/><path d="M8.2 6H17M6 8.2V14a3.8 3.8 0 0 0 3.8 3.8h5.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 11, color: C.ink }}>{OWNER.name}</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 8, color: C.grayMed }}>{OWNER.role}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color: C.burgundy }}>INVOICE</div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 9, color: C.ink }}>ใบแจ้งหนี้</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: C.grayLight, marginBottom: 3 }}>Bill to</div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 10, color: C.ink }}>{project.client}</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 8, color: C.grayMed, lineHeight: 1.5 }}>199/45 ถ.สุขุมวิท คลองเตย กทม.</div>
          </div>
          <div style={{ width: 170, background: C.burgundy, borderRadius: 8, padding: '11px 13px', color: '#fff' }}>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 8, color: 'rgba(255,255,255,.85)' }}>ยอดที่ต้องชำระ</div>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 23, lineHeight: 1.1 }}>฿{total.toLocaleString()}</div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.25)', margin: '7px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Sarabun'", fontSize: 8, color: 'rgba(255,255,255,.85)' }}>ครบกำหนด</span>
              <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 9 }}>15 มี.ค. 69</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.borderLight}` }}>
          <div style={{ display: 'flex', background: C.ink, padding: '6px 10px' }}>
            <span style={{ flex: 1, fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 7.5, color: '#fff' }}>รายละเอียด</span>
            <span style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 7.5, color: '#fff' }}>รวม</span>
          </div>
          {LINE_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', padding: '7px 10px', borderBottom: i < LINE_ITEMS.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
              <span style={{ flex: 1, fontFamily: "'Sarabun'", fontWeight: 500, fontSize: 8, color: C.ink }}>{item.desc}</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 8, color: C.ink }}>{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, background: C.burgundyLight, border: `1px solid ${C.burgundy}`, borderRadius: 8, padding: '9px 13px' }}>
          <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 9, color: C.burgundy }}>ยอดที่ต้องชำระ</span>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: C.burgundy }}>฿{total.toLocaleString()}</span>
        </div>

        <div style={{ marginTop: 12, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: '9px 12px' }}>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 8, color: C.ink }}>{OWNER.bank}</div>
          <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 12, color: C.ink }}>{OWNER.bankAccount}</div>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 7.5, color: C.grayMed }}>PromptPay {OWNER.promptPay}</div>
        </div>
      </div>
    </div>
  )
}

function DocumentsTab({ project }) {
  const [activeDoc, setActiveDoc] = useState('INV-2026-021')
  const currentDoc = DOCUMENTS.find(d => d.id === activeDoc) || DOCUMENTS[2]
  const docColor = DOC_COLORS[currentDoc.type] || C.grayMed

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, background: C.bg }}>
      {/* Left: doc list */}
      <div style={{ width: 268, borderRight: `1px solid ${C.border}`, padding: '20px 18px', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 12 }}>เอกสารทั้งหมด ({DOCUMENTS.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {DOCUMENTS.map(doc => {
            const color = DOC_COLORS[doc.type] || C.grayPale
            const isActive = doc.id === activeDoc
            const isPending = doc.pending
            return (
              <div
                key={doc.id}
                onClick={() => !isPending && setActiveDoc(doc.id)}
                style={{
                  background: isPending ? C.panel : C.white,
                  border: isActive ? `2px solid ${color}` : `1px solid ${isPending ? C.borderDash : C.border}`,
                  borderStyle: isPending ? 'dashed' : 'solid',
                  borderRadius: 11, padding: '12px 13px',
                  cursor: isPending ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 7, height: 26, borderRadius: 4, background: isPending ? C.border : color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: isPending ? C.grayLight : C.ink }}>{doc.label}</div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10.5, color: isPending ? C.grayPale : (isActive ? color : C.grayLight) }}>
                      {isPending ? 'ยังไม่ออก' : `${doc.id}${doc.rev ? ` · ${doc.rev}` : ''}${isActive ? ' · กำลังดู' : ''}`}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: viewer */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ height: 52, borderBottom: `1px solid ${C.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 13, color: C.ink }}>{currentDoc.id}</span>
            <StatusBadge status={currentDoc.status} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              <IconEdit size={14} stroke="currentColor" />แก้ไข
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              <IconPrint size={14} stroke="currentColor" />พิมพ์ PDF
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: '#fff', background: docColor, border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              <IconSend size={14} stroke="#fff" />ส่งให้ลูกค้า
            </button>
          </div>
        </div>

        {/* Document preview */}
        <div style={{ flex: 1, overflow: 'auto', background: '#EFEDE5', display: 'flex', justifyContent: 'center', padding: '26px 20px' }}>
          <InvoiceDoc project={project} />
        </div>
      </div>
    </div>
  )
}

function FilesTab() {
  const [activeFile, setActiveFile] = useState(0)
  const [viewMode, setViewMode] = useState('read')
  const file = FILES[activeFile]

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, background: C.bg }}>
      {/* Left: file list */}
      <div style={{ width: 300, borderRight: `1px solid ${C.border}`, padding: '20px 18px', flexShrink: 0 }}>
        <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: C.teal, background: C.white, border: `1px dashed ${C.teal}`, borderRadius: 10, padding: 11, marginBottom: 16, cursor: 'pointer' }}>
          <IconUpload size={15} stroke={C.teal} />
          อัปโหลดไฟล์ (.md, .html, …)
        </button>
        <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: C.grayLight, marginBottom: 10 }}>ไฟล์ในงานนี้ · {FILES.length}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {FILES.map((f, i) => (
            <div
              key={f.name}
              onClick={() => setActiveFile(i)}
              style={{ background: C.white, border: activeFile === i ? `2px solid ${C.teal}` : `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 9, color: '#fff', background: f.typeColor, padding: '3px 6px', borderRadius: 5, flexShrink: 0 }}>{f.type}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayLight }}>{f.size}{activeFile === i ? ' · กำลังดู' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: viewer */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ height: 48, borderBottom: `1px solid ${C.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 8, color: '#fff', background: file.typeColor, padding: '3px 6px', borderRadius: 5 }}>{file.type}</span>
            <span style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink }}>{file.name}</span>
            <span style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>· เรนเดอร์เป็นเอกสารอ่านง่าย</span>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <span onClick={() => setViewMode('read')} style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 600, color: viewMode === 'read' ? C.teal : C.grayLight, background: viewMode === 'read' ? C.tealLight : 'transparent', padding: '5px 11px', borderRadius: 7, cursor: 'pointer' }}>อ่าน</span>
            <span onClick={() => setViewMode('code')} style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 500, color: viewMode === 'code' ? C.teal : C.grayLight, padding: '5px 11px', cursor: 'pointer' }}>โค้ด</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', background: C.white, padding: '30px 40px' }}>
          {viewMode === 'read' ? (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 22, color: C.ink, marginBottom: 4 }}>คอนเซปงาน: Invoice-to-SAP Automation</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.borderLight}` }}>เวอร์ชัน 1.2 · ปรับปรุงล่าสุด 26 ก.พ. 2569</div>

              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 9 }}>ปัญหาเดิมของลูกค้า</div>
              <p style={{ fontFamily: "'Sarabun'", fontSize: 13.5, color: '#3F3E37', lineHeight: 1.7, margin: '0 0 18px' }}>ทีมบัญชีต้องคีย์ใบแจ้งหนี้จากซัพพลายเออร์ ~200 ใบ/เดือนเข้าระบบ SAP ด้วยมือ ใช้เวลา 3–4 ชม./วัน และเกิดข้อผิดพลาดบ่อยในช่อง VAT กับเลขที่เอกสาร</p>

              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 9 }}>แนวทางที่เสนอ</div>
              <div style={{ background: C.panel, borderLeft: `3px solid ${C.teal}`, borderRadius: '0 8px 8px 0', padding: '13px 16px', marginBottom: 18 }}>
                {['บอทอ่านอีเมลขาเข้า ดึงไฟล์แนบ PDF/รูป แล้วทำ OCR', 'Validation เทียบกับ PO ก่อนบันทึก ลดข้อมูลผิด', 'บันทึกเข้า SAP ผ่าน UiPath + แจ้งเตือนเมื่อต้องตรวจสอบ'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, marginBottom: i < 2 ? 8 : 0 }}>
                    <span style={{ color: C.teal, fontWeight: 700 }}>{i + 1}.</span>
                    <span style={{ fontFamily: "'Sarabun'", fontSize: 13, color: '#3F3E37', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 9 }}>ผลที่คาดหวัง</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ v: '−85%', l: 'เวลาคีย์ข้อมูล' }, { v: '~200', l: 'ใบ/เดือน อัตโนมัติ' }, { v: '6 สัปดาห์', l: 'ระยะส่งมอบ' }].map(({ v, l }) => (
                  <div key={v} style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: C.teal }}>{v}</div>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayMed, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <pre style={{ fontFamily: 'monospace', fontSize: 12, color: C.ink, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
{`# คอนเซปงาน: Invoice-to-SAP Automation

เวอร์ชัน 1.2 · ปรับปรุงล่าสุด 26 ก.พ. 2569

## ปัญหาเดิมของลูกค้า

ทีมบัญชีต้องคีย์ใบแจ้งหนี้จากซัพพลายเออร์ ~200 ใบ/เดือน...

## แนวทางที่เสนอ

1. บอทอ่านอีเมลขาเข้า ดึงไฟล์แนบ PDF/รูป แล้วทำ OCR
2. Validation เทียบกับ PO ก่อนบันทึก ลดข้อมูลผิด
3. บันทึกเข้า SAP ผ่าน UiPath + แจ้งเตือนเมื่อต้องตรวจสอบ

## ผลที่คาดหวัง

- เวลาคีย์ข้อมูลลด 85%
- ประมวลผลอัตโนมัติ ~200 ใบ/เดือน
- ระยะส่งมอบ 6 สัปดาห์`}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

function RevisionsTab() {
  return (
    <div style={{ flex: 1, padding: '22px 26px', background: C.bg, overflow: 'auto' }}>
      <div style={{ position: 'relative' }}>
        {REVISIONS.map((rev, i) => {
          const isLast = i === REVISIONS.length - 1
          const iconBg = rev.color

          return (
            <div key={rev.id} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {rev.icon === 'check'
                    ? <IconCheck size={16} stroke="#fff" />
                    : rev.icon === 'file'
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
                    : <IconEdit size={15} stroke="#fff" />
                  }
                </div>
                {!isLast && <div style={{ flex: 1, width: 2, background: C.border, marginTop: 5 }} />}
              </div>

              <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink }}>
                    {rev.title}{' '}
                    {rev.docId && <span style={{ fontFamily: "'Space Grotesk'", color: rev.docColor }}>{rev.docId}</span>}
                    {rev.rev && <span style={{ fontFamily: "'Sarabun'", fontSize: 10.5, fontWeight: 500, color: C.amber, background: C.amberLight, padding: '2px 7px', borderRadius: 10, marginLeft: 6 }}>{rev.rev}</span>}
                  </div>
                  <span style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight, flexShrink: 0 }}>{rev.time}</span>
                </div>

                {rev.detail && (
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed, lineHeight: 1.5 }}>{rev.detail}</div>
                )}

                {rev.diff && (
                  <div style={{ background: C.panel, borderRadius: 8, padding: '9px 12px', marginTop: 4 }}>
                    {rev.diff.map((d, j) => (
                      <div key={j} style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: d.type === 'remove' ? C.burgundy : C.green, lineHeight: 1.6 }}>{d.text}</div>
                    ))}
                  </div>
                )}

                {rev.user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: rev.userColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 9 }}>{rev.userInitial}</div>
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
  const project = PROJECTS.find(p => p.id === projectId) || PROJECTS[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Shared header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 28px 0', flexShrink: 0, background: C.white }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginBottom: 8 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('projects')}>งานทั้งหมด</span>
          <span>/</span>
          <span style={{ fontFamily: "'Space Grotesk'" }}>{project.id}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 19, color: C.ink, lineHeight: 1.1 }}>{project.name}</div>
            {project.client && <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayMed, marginTop: 3 }}>{project.client}{project.startDate ? ` · เริ่ม ${project.startDate}` : ''}</div>}
          </div>
          {tab === 0 && (
            <div style={{ display: 'flex', gap: 9 }}>
              <span style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: C.burgundy, background: C.burgundyLight, padding: '6px 14px', borderRadius: 20 }}>
                {project.status} ฿{project.value.toLocaleString()}
              </span>
              <button
                onClick={() => navigate('wizard')}
                style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: '#fff', background: C.teal, border: 'none', borderRadius: 9, padding: '8px 15px', cursor: 'pointer' }}
                className="btn"
              >ทำขั้นต่อไป</button>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 26, marginTop: 14 }}>
          {TABS.map((t, i) => (
            <div
              key={t}
              onClick={() => setTab(i)}
              style={{
                fontFamily: "'Sarabun'", fontSize: 13,
                fontWeight: tab === i ? 600 : 500,
                color: tab === i ? C.teal : C.grayLight,
                paddingBottom: 11,
                borderBottom: `2px solid ${tab === i ? C.teal : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 0 && <OverviewTab project={project} />}
        {tab === 1 && <DocumentsTab project={project} />}
        {tab === 2 && <FilesTab />}
        {tab === 3 && <RevisionsTab />}
      </div>
    </div>
  )
}
