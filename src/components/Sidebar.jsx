import { C } from '../theme'
import { LogoIcon, IconGrid, IconBriefcase, IconFile, IconPaperclip, IconUsers, IconSettings } from './Icons'
import { useOwner } from '../lib/settings'

const NAV = [
  { key: 'dashboard', label: 'ภาพรวม',      Icon: IconGrid },
  { key: 'projects',  label: 'งานทั้งหมด',   Icon: IconBriefcase },
  { key: 'documents', label: 'เอกสาร',        Icon: IconFile },
  { key: 'files',     label: 'ไฟล์ & คอนเซป', Icon: IconPaperclip },
  { key: 'clients',   label: 'ลูกค้า',        Icon: IconUsers },
]

export function Sidebar({ nav, navigate }) {
  const activePage = nav.page
  const owner = useOwner()

  const navItemStyle = (key) => {
    const active = activePage === key || (key === 'projects' && activePage === 'project')
    return {
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '9px 12px', borderRadius: 9, marginBottom: 3, cursor: 'pointer',
      background: active ? C.tealLight : 'transparent',
      color: active ? C.teal : C.grayMed,
      fontFamily: "'Sarabun', sans-serif",
      fontSize: 13.5,
      fontWeight: active ? 600 : 500,
      transition: 'background 0.15s, color 0.15s',
      userSelect: 'none',
    }
  }

  return (
    <aside style={{
      width: 230, minWidth: 230,
      background: C.panel,
      borderRight: `1px solid ${C.border}`,
      padding: '22px 16px',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 22px' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: C.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LogoIcon size={18} />
        </div>
        <div style={{ fontFamily: "'Sarabun', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink }}>
          {owner.logoText}
        </div>
      </div>

      {/* Nav items */}
      {NAV.map(({ key, label, Icon }) => (
        <div key={key} style={navItemStyle(key)} onClick={() => navigate(key)} className="nav-item">
          <Icon size={17} stroke="currentColor" />
          {label}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <div
        style={{ ...navItemStyle('settings'), marginBottom: 10 }}
        onClick={() => navigate('settings')}
        className="nav-item"
      >
        <IconSettings size={17} stroke="currentColor" />
        ตั้งค่า
      </div>

      {/* User card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: 10, borderRadius: 11,
        background: C.white, border: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: C.teal,
          color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{owner.initial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "'Sarabun', sans-serif", fontWeight: 600, fontSize: 12.5, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {owner.shortName}
          </div>
          <div style={{ fontFamily: "'Sarabun', sans-serif", fontSize: 10.5, color: C.grayLight }}>เจ้าของ · Owner</div>
        </div>
        <button
          onClick={() => navigate('partner')}
          style={{
            fontFamily: "'Sarabun', sans-serif", fontSize: 10, fontWeight: 600,
            color: C.teal, background: C.tealLight, border: 'none',
            borderRadius: 7, padding: '3px 7px', cursor: 'pointer', flexShrink: 0,
          }}
          title="สลับเป็นโหมดผู้ช่วย"
        >ผู้ช่วย</button>
      </div>
    </aside>
  )
}
