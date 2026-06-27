import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './screens/Dashboard'
import { ProjectsList } from './screens/ProjectsList'
import { ProjectDetail } from './screens/ProjectDetail'
import { DocumentWizard } from './screens/DocumentWizard'
import { Settings } from './screens/Settings'
import { PartnerMode } from './screens/PartnerMode'
import { C } from './theme'

function PlaceholderScreen({ title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ height: 64, borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', background: C.white, flexShrink: 0 }}>
        <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 17, color: C.ink }}>{title}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Sarabun'", fontSize: 16, color: C.grayLight, marginBottom: 4 }}>หน้านี้กำลังพัฒนา</div>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: C.grayPale }}>Coming soon</div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [nav, setNav] = useState({ page: 'dashboard' })

  const navigate = (page, params = {}) => {
    setNav({ page, ...params })
  }

  if (nav.page === 'partner') return <PartnerMode navigate={navigate} />
  if (nav.page === 'wizard') return <DocumentWizard navigate={navigate} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar nav={nav} navigate={navigate} />
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {nav.page === 'dashboard' && <Dashboard navigate={navigate} />}
        {nav.page === 'projects' && <ProjectsList navigate={navigate} />}
        {nav.page === 'project' && <ProjectDetail projectId={nav.projectId} navigate={navigate} />}
        {nav.page === 'documents' && <PlaceholderScreen title="เอกสารทั้งหมด" />}
        {nav.page === 'files' && <PlaceholderScreen title="ไฟล์ & คอนเซป" />}
        {nav.page === 'clients' && <PlaceholderScreen title="ลูกค้า" />}
        {nav.page === 'settings' && <Settings navigate={navigate} />}
      </div>
    </div>
  )
}
