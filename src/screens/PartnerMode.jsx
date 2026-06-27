import { C } from '../theme'
import { LogoIcon, IconFile, IconCreditCard, IconCheck } from '../components/Icons'
import { PARTNER } from '../data'

export function PartnerMode({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      {/* Teal header */}
      <div style={{
        height: 62, background: C.teal, padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoIcon size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: '#fff' }}>Agent Office</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11, color: 'rgba(255,255,255,.8)' }}>โหมดผู้ช่วย</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: '#fff' }}>สวัสดี {PARTNER.name} 💚</span>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.25)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 12,
          }}>{PARTNER.initial}</div>
          <button
            onClick={() => navigate('dashboard')}
            style={{ fontFamily: "'Sarabun'", fontSize: 11, fontWeight: 600, color: C.teal, background: C.white, border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', marginLeft: 4 }}
          >เจ้าของ</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 19, color: C.ink }}>วันนี้มีอะไรให้ช่วยบ้าง?</div>
        <div style={{ fontFamily: "'Sarabun'", fontSize: 13, color: C.grayLight, marginBottom: 22 }}>เลือกสิ่งที่ต้องทำ ระบบจะพาไปทีละขั้น ไม่ต้องคิดเยอะ</div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 26 }}>
          <div
            className="card-hover"
            onClick={() => navigate('wizard')}
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 13, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 13px' }}>
              <IconFile size={24} stroke={C.teal} />
            </div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>สร้างใบเสนอราคา</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 3 }}>เริ่มงานใหม่ให้ลูกค้า</div>
          </div>

          <div
            className="card-hover"
            onClick={() => navigate('wizard')}
            style={{ background: C.white, border: `2px solid ${C.burgundy}`, borderRadius: 14, padding: 20, textAlign: 'center', cursor: 'pointer', position: 'relative' }}
          >
            <span style={{
              position: 'absolute', top: 11, right: 11,
              fontFamily: "'Sarabun'", fontSize: 9.5, fontWeight: 600,
              color: '#fff', background: C.burgundy, padding: '2px 8px', borderRadius: 10,
            }}>มีงานรอ 1</span>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: C.burgundyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 13px' }}>
              <IconCreditCard size={24} stroke={C.burgundy} />
            </div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>ออกใบแจ้งหนี้</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 3 }}>จากงานที่ส่งมอบแล้ว</div>
          </div>

          <div
            className="card-hover"
            onClick={() => navigate('wizard')}
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 13, background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 13px' }}>
              <IconCheck size={24} stroke={C.blue} />
            </div>
            <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink }}>ออกใบส่งงาน</div>
            <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight, marginTop: 3 }}>เมื่องานเสร็จพร้อมส่ง</div>
          </div>
        </div>

        {/* Task list */}
        <div style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 12 }}>งานที่รอคุณช่วย</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.burgundyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.burgundy }}>1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13.5, color: C.ink }}>ออกใบแจ้งหนี้งาน "บันทึกใบแจ้งหนี้เข้า SAP"</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>บริษัท ตัวอย่าง จำกัด · ธนารัตน์ส่งมอบงานแล้ว รอวางบิล</div>
            </div>
            <button
              onClick={() => navigate('wizard')}
              style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: '#fff', background: C.burgundy, border: 'none', borderRadius: 9, padding: '9px 16px', cursor: 'pointer', flexShrink: 0 }}
              className="btn"
            >เริ่มทำ →</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 14, color: C.amber }}>2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Sarabun'", fontWeight: 600, fontSize: 13.5, color: C.ink }}>ตามใบเสนอราคาคลินิกฟันดี</div>
              <div style={{ fontFamily: "'Sarabun'", fontSize: 11.5, color: C.grayLight }}>ส่งไป 3 วันแล้ว · ลองโทรถามลูกค้า</div>
            </div>
            <button
              onClick={() => navigate('project', { projectId: 'P-2026-007' })}
              style={{ fontFamily: "'Sarabun'", fontSize: 12, fontWeight: 600, color: C.grayMed, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 16px', cursor: 'pointer', flexShrink: 0 }}
            >ดูรายละเอียด</button>
          </div>
        </div>

        {/* Info note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 18, background: C.panel, border: `1px dashed ${C.borderDash}`, borderRadius: 11, padding: '13px 16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.grayLight} strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: "'Sarabun'", fontSize: 12, color: C.grayMed }}>ข้อมูลบัญชี อีเมล และเลขผู้เสียภาษี ธนารัตน์ตั้งไว้แล้ว ระบบจะเติมให้อัตโนมัติ — คุณแค่ใส่รายการกับยอดเงิน</span>
        </div>
      </div>
    </div>
  )
}
