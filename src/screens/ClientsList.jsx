import { useState, useEffect } from 'react'
import { C } from '../theme'
import { IconPlus, IconUsers } from '../components/Icons'
import { Loading, ErrorState } from '../components/States'
import { useAsync } from '../lib/useAsync'
import { getCustomers, saveCustomer, deleteCustomer } from '../lib/api'

const FIELDS = [
  { key: 'name', label: 'ชื่อบริษัท / ลูกค้า', required: true },
  { key: 'contact_name', label: 'ผู้ติดต่อ' },
  { key: 'position', label: 'ตำแหน่ง' },
  { key: 'email', label: 'อีเมล' },
  { key: 'phone', label: 'เบอร์โทร' },
  { key: 'tax_id', label: 'เลขประจำตัวผู้เสียภาษี', mono: true },
  { key: 'address', label: 'ที่อยู่', textarea: true },
]

const empty = { name: '', contact_name: '', position: '', email: '', phone: '', tax_id: '', address: '' }

function avatarColor(name) {
  const colors = [C.teal, C.blue, C.burgundy, C.amber, C.green]
  let h = 0
  for (const ch of name || '') h = (h + ch.charCodeAt(0)) % colors.length
  return colors[h]
}

export function ClientsList() {
  const { data, loading, error, reload } = useAsync(getCustomers, [])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const customers = data || []

  useEffect(() => {
    if (selectedId === 'new') { setForm(empty); return }
    const c = customers.find((x) => x.id === selectedId)
    if (c) setForm({ ...empty, ...c })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, data])

  const editing = selectedId != null
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    if (!form.name?.trim()) { alert('กรุณากรอกชื่อลูกค้า'); return }
    setSaving(true)
    try {
      const payload = selectedId === 'new' ? { ...form } : { ...form }
      const saved = await saveCustomer(payload)
      await reload()
      setSelectedId(saved.id)
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (selectedId === 'new' || !selectedId) return
    if (!confirm(`ลบลูกค้า "${form.name}"?`)) return
    try {
      await deleteCustomer(selectedId)
      setSelectedId(null)
      await reload()
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err.message || err))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="ao-topbar" style={{ height: 64, borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink }}>ลูกค้า</div>
        <button onClick={() => setSelectedId('new')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.white, background: C.teal, border: 'none', borderRadius: 9, padding: '9px 15px', cursor: 'pointer' }}>
          <IconPlus size={15} stroke={C.white} />เพิ่มลูกค้า
        </button>
      </div>

      <div className="ao-twopane" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <>
            {/* List */}
            <div className="ao-pane-list" style={{ width: 340, borderRight: `1px solid ${C.border}`, overflow: 'auto', background: C.bg, padding: '18px 16px' }}>
              {customers.length === 0 && (
                <div style={{ fontFamily: "'Sarabun'", fontSize: 12.5, color: C.grayLight, padding: 8 }}>ยังไม่มีลูกค้า — กด “เพิ่มลูกค้า” เพื่อเริ่ม</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customers.map((c) => (
                  <div key={c.id} onClick={() => setSelectedId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.white, border: selectedId === c.id ? `2px solid ${C.teal}` : `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px', cursor: 'pointer' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColor(c.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{(c.name || '?').charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Sarabun'", fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>{c.contact_name || c.email || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail / form */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'auto', background: C.bg, padding: '26px 30px' }}>
              {!editing ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <IconUsers size={26} stroke={C.teal} />
                    </div>
                    <div style={{ fontFamily: "'Sarabun'", fontSize: 14, color: C.grayMed }}>เลือกลูกค้าจากรายการ หรือเพิ่มลูกค้าใหม่</div>
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: 560 }}>
                  <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 18 }}>
                    {selectedId === 'new' ? 'เพิ่มลูกค้าใหม่' : 'แก้ไขข้อมูลลูกค้า'}
                  </div>
                  <div className="ao-grid-2" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {FIELDS.map((f) => (
                      <div key={f.key} style={f.textarea || f.key === 'name' ? { gridColumn: 'span 2' } : {}}>
                        <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 500, color: C.grayMed, marginBottom: 6 }}>{f.label}{f.required ? ' *' : ''}</div>
                        {f.textarea ? (
                          <textarea value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} rows={2} style={inputStyle(f)} />
                        ) : (
                          <input value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} style={inputStyle(f)} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <button onClick={onSave} disabled={saving} className="btn" style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: '#fff', background: C.teal, border: 'none', borderRadius: 9, padding: '10px 22px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                      {saving ? 'กำลังบันทึก…' : 'บันทึก'}
                    </button>
                    <button onClick={() => setSelectedId(null)} style={{ fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 18px', cursor: 'pointer' }}>ยกเลิก</button>
                    {selectedId !== 'new' && (
                      <button onClick={onDelete} style={{ marginLeft: 'auto', fontFamily: "'Sarabun'", fontSize: 13, fontWeight: 600, color: C.burgundy, background: C.burgundyLight, border: 'none', borderRadius: 9, padding: '10px 18px', cursor: 'pointer' }}>ลบ</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function inputStyle(f) {
  return {
    width: '100%', boxSizing: 'border-box', background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 9, padding: '10px 13px', fontFamily: f.mono ? "'Space Grotesk'" : "'Sarabun'",
    fontSize: 13, color: C.ink, outline: 'none', resize: 'vertical',
  }
}
