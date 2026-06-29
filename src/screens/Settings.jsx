import { useState, useEffect } from 'react'
import { C } from '../theme'
import { useSettings } from '../lib/settings'
import { Loading } from '../components/States'

const SECTIONS = ['ข้อมูลผู้ออกเอกสาร', 'บัญชี & การชำระเงิน', 'เลขรันเอกสาร', 'ผู้ใช้ & สิทธิ์', 'โลโก้ & แบรนด์']

function Input({ label, k, form, set, mono, span }) {
  return (
    <div style={span ? { gridColumn: 'span 2' } : {}}>
      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>{label}</div>
      <input
        value={form[k] ?? ''}
        onChange={(e) => set(k, e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 9, padding: '10px 13px', fontFamily: mono ? "'Space Grotesk'" : "'Sarabun'",
          fontSize: 13, color: C.ink, outline: 'none',
        }}
        onFocus={(e) => (e.target.style.border = `2px solid ${C.teal}`)}
        onBlur={(e) => (e.target.style.border = `1px solid ${C.border}`)}
      />
    </div>
  )
}

function NumInput({ label, k, form, set }) {
  return (
    <div>
      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>{label}</div>
      <input
        type="number"
        value={form[k] ?? 1}
        onChange={(e) => set(k, Number(e.target.value))}
        style={{ width: '100%', boxSizing: 'border-box', background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', fontFamily: "'Space Grotesk'", fontSize: 13, color: C.ink, outline: 'none' }}
      />
    </div>
  )
}

export function Settings() {
  const { settings, loading, update } = useSettings()
  const [section, setSection] = useState(0)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    setSaving(true)
    try {
      const { id, updated_at, ...patch } = form
      await update(patch)
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 2500)
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return <div style={{ height: '100vh', display: 'flex' }}><Loading /></div>
  }

  const year = new Date().getFullYear() + 543
  const preview = (prefix, n) => `${form[prefix] || ''}-${year - 543}-${String(n || 1).padStart(3, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="ao-topbar" style={{ height: 58, borderBottom: `1px solid ${C.border}`, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 16, color: C.ink }}>ตั้งค่าระบบ</div>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: C.grayLight }}>เฉพาะเจ้าของแก้ไขได้ · ไหลขึ้นทุกเอกสารอัตโนมัติ</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {savedAt && <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.green }}>✓ บันทึกแล้ว</span>}
          <button onClick={onSave} disabled={saving} className="btn" style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: 600, color: C.white, background: C.teal, border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div className="ao-settings-body" style={{ flex: 1, display: 'flex', background: C.bg, overflow: 'hidden' }}>
        <div className="ao-settings-nav" style={{ width: 190, borderRight: `1px solid ${C.border}`, padding: '16px 12px', flexShrink: 0, background: C.bg }}>
          {SECTIONS.map((s, i) => (
            <div key={s} onClick={() => setSection(i)} style={{ fontFamily: "'Sarabun'", fontSize: 12.5, fontWeight: section === i ? 600 : 500, color: section === i ? C.white : C.grayMed, background: section === i ? C.ink : 'transparent', borderRadius: 8, padding: '8px 12px', marginBottom: 5, cursor: 'pointer' }}>{s}</div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: '22px 26px', overflow: 'auto' }}>
          {section === 0 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>ข้อมูลผู้ออกเอกสาร</div>
              <div className="ao-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 620 }}>
                <Input label="ชื่อ-นามสกุล" k="name" form={form} set={set} />
                <Input label="ชื่อเรียกสั้น" k="short_name" form={form} set={set} />
                <Input label="ตำแหน่ง / บริการ" k="role" form={form} set={set} span />
                <Input label="อีเมล (แสดงบนเอกสาร)" k="email" form={form} set={set} />
                <Input label="เบอร์โทร" k="phone" form={form} set={set} mono />
                <Input label="เลขประจำตัวผู้เสียภาษี" k="tax_id" form={form} set={set} mono span />
              </div>
            </>
          )}

          {section === 1 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>บัญชี & การชำระเงิน</div>
              <div className="ao-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 620 }}>
                <Input label="ธนาคาร" k="bank" form={form} set={set} />
                <Input label="เลขบัญชี" k="bank_account" form={form} set={set} mono />
                <Input label="ชื่อบัญชี" k="bank_name" form={form} set={set} />
                <Input label="PromptPay" k="promptpay" form={form} set={set} mono />
              </div>
            </>
          )}

          {section === 2 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>เลขรันเอกสาร</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayLight, marginBottom: 14 }}>กำหนดอักษรนำหน้าและเลขถัดไปของแต่ละชนิดเอกสาร</div>
              <div className="ao-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, maxWidth: 720 }}>
                {[['prefix_qt', 'next_qt', 'ใบเสนอราคา'], ['prefix_dn', 'next_dn', 'ใบส่งงาน'], ['prefix_inv', 'next_inv', 'ใบแจ้งหนี้'], ['prefix_rc', 'next_rc', 'ใบเสร็จ']].map(([pk, nk, label]) => (
                  <div key={pk} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 12.5, color: C.ink, marginBottom: 10 }}>{label}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 70 }}><Input label="prefix" k={pk} form={form} set={set} mono /></div>
                      <div style={{ flex: 1 }}><NumInput label="เลขถัดไป" k={nk} form={form} set={set} /></div>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: C.teal, marginTop: 10 }}>→ {preview(pk, form[nk])}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 3 && (
            <>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 16 }}>ผู้ใช้ & สิทธิ์</div>
              <div className="ao-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 620, marginBottom: 18 }}>
                <Input label="ชื่อผู้ช่วย (แฟน)" k="partner_name" form={form} set={set} />
                <Input label="อักษรย่อผู้ช่วย" k="partner_initial" form={form} set={set} />
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden', maxWidth: 620 }}>
                {[
                  { name: form.name, email: form.email, role: 'เจ้าของ', initial: (form.short_name || 'ธ').charAt(0), color: C.teal },
                  { name: form.partner_name, email: 'โหมดผู้ช่วย', role: 'ผู้ช่วย', initial: form.partner_initial || 'ม', color: C.amber },
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
              <div style={{ maxWidth: 620 }}>
                <Input label="ชื่อแบรนด์ / ข้อความโลโก้" k="logo_text" form={form} set={set} span />
                <div style={{ background: C.white, border: `1px dashed ${C.borderDash}`, borderRadius: 13, padding: 28, textAlign: 'center', marginTop: 16 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontSize: 13, color: C.grayLight }}>อัปโหลดไฟล์โลโก้ (จะรองรับในเวอร์ชันถัดไป)</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
