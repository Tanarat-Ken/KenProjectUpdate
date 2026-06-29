import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { LogoIcon, IconMenu } from './components/Icons'
import { Dashboard } from './screens/Dashboard'
import { ProjectsList } from './screens/ProjectsList'
import { ProjectDetail } from './screens/ProjectDetail'
import { DocumentWizard } from './screens/DocumentWizard'
import { Settings } from './screens/Settings'
import { PartnerMode } from './screens/PartnerMode'
import { DocumentsList } from './screens/DocumentsList'
import { FilesList } from './screens/FilesList'
import { ClientsList } from './screens/ClientsList'
import { SettingsProvider, useOwner } from './lib/settings'
import { C } from './theme'

function useIsNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 760)
  useEffect(() => {
    const f = () => setNarrow(window.innerWidth < 760)
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return narrow
}

export default function App() {
  const [nav, setNav] = useState({ page: 'dashboard' })
  const navigate = (page, params = {}) => setNav({ page, ...params })
  return (
    <SettingsProvider>
      <AppShell nav={nav} navigate={navigate} />
    </SettingsProvider>
  )
}

function AppShell({ nav, navigate }) {
  const narrow = useIsNarrow()
  const [drawer, setDrawer] = useState(false)
  const owner = useOwner()
  const go = (page, params = {}) => { navigate(page, params); setDrawer(false) }

  // full-screen flows (no sidebar)
  if (nav.page === 'partner') return <PartnerMode navigate={navigate} />
  if (nav.page === 'wizard') return <DocumentWizard navigate={navigate} initial={nav} />

  const screens = (
    <>
      {nav.page === 'dashboard' && <Dashboard navigate={navigate} />}
      {nav.page === 'projects' && <ProjectsList navigate={navigate} query={nav.q} />}
      {nav.page === 'project' && <ProjectDetail projectId={nav.projectId} navigate={navigate} />}
      {nav.page === 'documents' && <DocumentsList navigate={navigate} />}
      {nav.page === 'files' && <FilesList navigate={navigate} />}
      {nav.page === 'clients' && <ClientsList navigate={navigate} />}
      {nav.page === 'settings' && <Settings navigate={navigate} />}
    </>
  )

  if (narrow) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* mobile top bar */}
        <div style={{ height: 52, flexShrink: 0, background: C.ink, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', zIndex: 30 }}>
          <button onClick={() => setDrawer(true)} aria-label="เมนู" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <IconMenu size={22} stroke="#fff" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogoIcon size={18} />
            <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 15, color: '#fff' }}>{owner.logoText}</span>
          </div>
        </div>
        {/* drawer + backdrop */}
        {drawer && <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 40 }} />}
        <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 41, transform: drawer ? 'none' : 'translateX(-100%)', transition: 'transform .22s ease', boxShadow: drawer ? '4px 0 24px rgba(0,0,0,.25)' : 'none' }}>
          <Sidebar nav={nav} navigate={go} />
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{screens}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar nav={nav} navigate={navigate} />
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{screens}</div>
    </div>
  )
}
