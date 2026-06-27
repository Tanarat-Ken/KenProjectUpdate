import { useState } from 'react'
import { C } from '../theme'
import { OWNER } from '../data'

const SECTIONS = [
  'ข้อมูลผู้ออกเอกสาร',
  'บัญชี & การชำระเงิน',
  'เลขรันเอกสาร',
  'ผู้ใช้ & สิทธิ์',
  'โลโก้ & แบรนด์',
]

function Field({ label, value, active, mono }) {
  return (
    <div>
      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>{label}</div>
      <div style={{
        background: C.white,
        border: active ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
        borderRadius: 9, padding: '10px 13px',
        fontFamily: mono ? "'Space Grotesk'" : "'Sarabun'",
        fontSize: 13, color: C.ink,
      }}>{value}</div>
    </div>
  )
}

export function Settings() {
  const [section, setSection] = useState(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        height: 58, borderBottom: `1px solid ${C.border}`,
        padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.white, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 16, color: C.ink }}>ตั้งค่าระบบ</div>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>เฉพาะเจ้าของแก้ไขได้ · ไหลขึ้นทุกเอกสารอัตโนมัติ</div>
        </div>
        <button style={{
          fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600,
          color: C.white, background: C.teal, border: 'none',
          borderRadius: 9, padding: '9px 18px', cursor: 'pointer',
        }}>บันทึก</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', background: C.bg, overflow: 'hidden' }}>
        {/* Left nav */}
        <div style={{ width: 190, borderRight: `1px solid ${C.border}`, padding: '16px 12px', flexShrink: 0, background: C.bg }}>
          {SECTIONS.map((s, i) => (
            <div
              key={s}
              onClick={() => setSection(i)}
              style={{
                fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: section === i ? 600 : 500,
                color: section === i ? C.white : C.grayMed,
                background: section === i ? C.ink : 'transparent',
                borderRadius: 8, padding: '8px 12px', marginBottom: 5, cursor: 'pointer',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, minWidth: 0, padding: '22px 26px', overflow: 'auto' }}>
          {section === 0 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>ข้อมูลผู้ออกเอกสาร</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="ชื่อ-นามสกุล" value={OWNER.name} />
                <Field label="ตำแหน่ง / บริการ" value={OWNER.role} />
                <Field label="อีเมล (แสดงบนเอกสาร)" value={OWNER.email} active />
                <Field label="เบอร์โทร" value={OWNER.phone} />
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="เลขประจำตัวผู้เสียภาษี" value={OWNER.taxId} mono />
                </div>
              </div>

              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, margin: '22px 0 16px' }}>บัญชี & การชำระเงิน</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="ธนาคาร" value={OWNER.bank} />
                <Field label="เลขบัญชี" value={OWNER.bankAccount} mono />
                <Field label="ชื่อบัญชี" value={OWNER.bankName} />
                <Field label="PromptPay" value={OWNER.promptPay} mono />
              </div>
            </>
          )}

          {section === 1 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>บัญชี & การชำระเงิน</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="ธนาคาร" value={OWNER.bank} />
                <Field label="เลขบัญชี" value={OWNER.bankAccount} mono />
                <Field label="ชื่อบัญชี" value={OWNER.bankName} />
                <Field label="PromptPay" value={OWNER.promptPay} mono />
              </div>
            </>
          )}

          {section === 2 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>เลขรันเอกสาร</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="เลขถัดไป — ใบเสนอราคา (QT)" value="QT-2026-014" mono />
                <Field label="เลขถัดไป — ใบส่งงาน (DN)" value="DN-2026-015" mono />
                <Field label="เลขถัดไป — ใบแจ้งหนี้ (INV)" value="INV-2026-022" mono />
                <Field label="เลขถัดไป — ใบเสร็จ (RC)" value="RC-2026-010" mono />
              </div>
            </>
          )}

          {section === 3 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>ผู้ใช้ & สิทธิ์</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
                {[
                  { name: 'ธนารัตน์ สหวิริยกุล', email: OWNER.email, role: 'เจ้าของ', initial: 'ธ', color: C.teal },
                  { name: 'มุก', email: 'muk@example.com', role: 'ผู้ช่วย', initial: 'ม', color: C.amber },
                ].map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i === 0 ? `1px solid ${C.borderLight}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 14 }}>{u.initial}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13, color: C.ink }}>{u.name}</div>
                      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{u.email}</div>
                    </div>
                    <span style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: C.grayMed, background: C.panelAlt, padding: '4px 11px', borderRadius: 20 }}>{u.role}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 4 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>โลโก้ & แบรนด์</div>
              <div style={{ background: C.white, border: `1px dashed ${C.borderDash}`, borderRadius: 13, padding: 28, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sarabun'", fontSize: 13, color: C.grayLight }}>ลากไฟล์โลโก้มาวาง หรือ</div>
                <button style={{ marginTop: 10, fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.teal, background: C.tealLight, border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer' }}>เลือกไฟล์</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
