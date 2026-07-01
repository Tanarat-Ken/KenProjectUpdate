import { C, DOC_COLORS } from '../theme'
import { baht, thaiDate } from '../lib/format'

export const DOC_EN = { QT: 'QUOTATION', DN: 'DELIVERY NOTE', INV: 'INVOICE', RC: 'RECEIPT' }
export const DOC_TH = { QT: 'ใบเสนอราคา', DN: 'ใบส่งงาน', INV: 'ใบแจ้งหนี้', RC: 'ใบเสร็จรับเงิน' }

// Pull the real items + meta of the document being previewed (falls back to
// the quotation line items for RC, which has no document row of its own).
function previewData(type, project) {
  const raw = project.raw?.[type.toLowerCase()] || null
  const src = raw?.items?.length ? raw.items : null
  const items = src
    ? src.map((it) => ({ desc: it.description || it.name || '', qty: Number(it.qty ?? 1), unit_price: Number(it.unit_price ?? it.amount ?? 0) }))
    : project.lineItems.map((it) => ({ desc: it.desc, qty: Number(it.qty ?? 1), unit_price: Number(it.unit_price ?? it.amount ?? 0) }))
  return {
    items,
    total: items.reduce((s, it) => s + it.qty * it.unit_price, 0),
    issueDate: raw?.issue_date || null,
    dueDate: raw?.due_date || null,
    note: raw?.note || null,
  }
}

// Sized at 650px (≈172mm) — comfortably fills an A4 page at the default
// 12mm @page margin (186mm printable) with real slack left over for a
// printer's own unprintable hardware margin, without relying on any
// print-only `zoom`/`transform: scale` (both proved unreliable on a real
// printer — see index.css). The screen preview and the printed page render
// the exact same markup at the exact same size, so there's nothing left to
// go wrong between the two.
export function DocPreview({ type, project, owner, doc }) {
  const color = DOC_COLORS[type] || C.ink
  const c = project.customer
  const { items, total, issueDate, dueDate, note } = previewData(type, project)
  const amountLabel = type === 'INV' ? 'ยอดที่ต้องชำระ' : type === 'RC' ? 'ยอดที่ชำระแล้ว' : 'ยอดรวมสุทธิ'
  const ownerLines = [owner.email, owner.phone, owner.taxId ? `เลขผู้เสียภาษี ${owner.taxId}` : ''].filter(Boolean)

  const th = { fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 10, color: '#fff' }
  const td = { fontFamily: "'Sarabun'", fontSize: 10.5, color: C.ink }
  const num = { fontFamily: "'Space Grotesk'", fontSize: 10.5, color: C.ink }
  // column widths (rest flexes to รายละเอียด)
  const wNo = 28, wQty = 58, wPrice = 88, wAmt = 98

  return (
    <div className="ao-doc" style={{ width: 650, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,.1)', position: 'relative', borderRadius: 3 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: color }} />
      <div style={{ padding: '40px 42px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ display: 'flex', gap: 13 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="2.4" stroke="#fff" strokeWidth="1.6"/><circle cx="18" cy="18" r="2.4" stroke="#fff" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="#fff" strokeWidth="1.6"/><path d="M8.2 6H17M6 8.2V14a3.8 3.8 0 0 0 3.8 3.8h5.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14.5, color: C.ink }}>{owner.name}</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed }}>{owner.role}</div>
              {ownerLines.map((l, i) => (
                <div key={i} style={{ fontFamily: "'Sarabun'", fontSize: 9.5, color: C.grayLight, lineHeight: 1.5 }}>{l}</div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 24, color, letterSpacing: '.02em' }}>{DOC_EN[type]}</div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 11, color: C.ink }}>{DOC_TH[type]}</div>
            {doc?.id && <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 14, color: C.ink, marginTop: 8 }}>{doc.id}</div>}
            {issueDate && <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed, marginTop: 3 }}>วันที่ {thaiDate(issueDate)}</div>}
            {type === 'INV' && dueDate && <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.burgundy }}>ครบกำหนด {thaiDate(dueDate)}</div>}
          </div>
        </div>

        {/* Bill-to + amount */}
        <div style={{ display: 'flex', gap: 15, marginTop: 22 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.grayLight, marginBottom: 5 }}>{type === 'INV' ? 'Bill to' : 'ลูกค้า'}</div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 13, color: C.ink }}>{project.client}</div>
            {c?.contact_name && <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed }}>ผู้ติดต่อ: {c.contact_name}</div>}
            {c?.address && <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed, lineHeight: 1.5 }}>{c.address}</div>}
            {c?.tax_id && <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed }}>เลขผู้เสียภาษี {c.tax_id}</div>}
          </div>
          <div style={{ width: 225, background: color, borderRadius: 10, padding: '15px 18px', color: '#fff', alignSelf: 'flex-start' }}>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: 'rgba(255,255,255,.85)' }}>{amountLabel}</div>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 30, lineHeight: 1.1 }}>{baht(total)}</div>
          </div>
        </div>

        {/* Items table */}
        <div className="ao-doc-table" style={{ marginTop: 20, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.borderLight}` }}>
          <div className="ao-doc-thead" style={{ display: 'flex', background: C.ink, padding: '9px 14px' }}>
            <span style={{ ...th, width: wNo }}>#</span>
            <span style={{ ...th, flex: 1 }}>รายละเอียด</span>
            <span style={{ ...th, width: wQty, textAlign: 'center' }}>จำนวน</span>
            <span style={{ ...th, width: wPrice, textAlign: 'right' }}>ราคา/หน่วย</span>
            <span style={{ ...th, width: wAmt, textAlign: 'right' }}>จำนวนเงิน</span>
          </div>
          {items.length === 0 && <div style={{ padding: '13px 14px', fontFamily: "'Sarabun'", fontSize: 10, color: C.grayLight }}>— ไม่มีรายการ —</div>}
          {items.map((item, i) => (
            <div key={i} className="ao-doc-row" style={{ display: 'flex', alignItems: 'flex-start', padding: '10px 14px', borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none', background: i % 2 ? C.panel : '#fff' }}>
              <span style={{ ...num, width: wNo, color: C.grayLight }}>{i + 1}</span>
              <span style={{ ...td, flex: 1, fontWeight: 500, paddingRight: 10 }}>{item.desc}</span>
              <span style={{ ...num, width: wQty, textAlign: 'center' }}>{item.qty}</span>
              <span style={{ ...num, width: wPrice, textAlign: 'right' }}>{item.unit_price.toLocaleString()}</span>
              <span style={{ ...num, width: wAmt, textAlign: 'right', fontWeight: 600 }}>{(item.qty * item.unit_price).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Grand total */}
        <div className="ao-doc-total" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
          <div style={{ width: 325, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: type === 'INV' ? C.burgundyLight : C.panel, border: `1px solid ${type === 'INV' ? C.burgundy : C.borderLight}`, borderRadius: 10, padding: '13px 18px' }}>
            <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 12, color: type === 'INV' ? C.burgundy : C.ink }}>{type === 'INV' ? 'ยอดที่ต้องชำระ' : 'ยอดรวมทั้งสิ้น'}</span>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, color: type === 'INV' ? C.burgundy : C.ink }}>{baht(total)}</span>
          </div>
        </div>

        {/* Note */}
        {note && (
          <div style={{ marginTop: 15, fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: C.ink }}>หมายเหตุ: </span>{note}
          </div>
        )}

        {/* Payment info on invoices */}
        {type === 'INV' && (owner.bank || owner.promptPay) && (
          <div style={{ marginTop: 15, border: `1px solid ${C.borderLight}`, borderRadius: 10, padding: '13px 16px' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.grayLight, marginBottom: 5 }}>ช่องทางชำระเงิน</div>
            {owner.bank && <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 10.5, color: C.ink }}>{owner.bank}{owner.bankName ? ` · ${owner.bankName}` : ''}</div>}
            {owner.bankAccount && <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 15, color: C.ink }}>{owner.bankAccount}</div>}
            {owner.promptPay && <div style={{ fontFamily: "'Sarabun'", fontSize: 10, color: C.grayMed }}>PromptPay {owner.promptPay}</div>}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 20, paddingTop: 13, borderTop: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', fontFamily: "'Sarabun'", fontSize: 9.5, color: C.grayLight }}>
          <span>ออกโดย {owner.name}</span>
          <span>{owner.logoText}</span>
        </div>
      </div>
    </div>
  )
}
