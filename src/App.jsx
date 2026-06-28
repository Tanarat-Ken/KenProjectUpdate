import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './screens/Dashboard'
import { ProjectsList } from './screens/ProjectsList'
import { ProjectDetail } from './screens/ProjectDetail'
import { DocumentWizard } from './screens/DocumentWizard'
import { Settings } from './screens/Settings'
import { PartnerMode } from './screens/PartnerMode'
import { DocumentsList } from './screens/DocumentsList'
import { FilesList } from './screens/FilesList'
import { ClientsList } from './screens/ClientsList'
import { CatMascot } from './components/CatMascot'
import { SettingsProvider } from './lib/settings'

export default function App() {
  const [nav, setNav] = useState({ page: 'dashboard' })

  const navigate = (page, params = {}) => {
    setNav({ page, ...params })
  }

  return (
    <SettingsProvider>
      <AppShell nav={nav} navigate={navigate} />
      <CatMascot />
    </SettingsProvider>
  )
}

function AppShell({ nav, navigate }) {
  if (nav.page === 'partner') return <PartnerMode navigate={navigate} />
  if (nav.page === 'wizard') return <DocumentWizard navigate={navigate} initial={nav} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar nav={nav} navigate={navigate} />
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {nav.page === 'dashboard' && <Dashboard navigate={navigate} />}
        {nav.page === 'projects' && <ProjectsList navigate={navigate} />}
        {nav.page === 'project' && <ProjectDetail projectId={nav.projectId} navigate={navigate} />}
        {nav.page === 'documents' && <DocumentsList navigate={navigate} />}
        {nav.page === 'files' && <FilesList navigate={navigate} />}
        {nav.page === 'clients' && <ClientsList navigate={navigate} />}
        {nav.page === 'settings' && <Settings navigate={navigate} />}
      </div>
    </div>
  )
}
