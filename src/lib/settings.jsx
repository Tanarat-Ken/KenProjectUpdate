import { createContext, useContext } from 'react'
import { useAsync } from './useAsync'
import { getSettings, saveSettings } from './api'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const { data, loading, reload } = useAsync(getSettings, [])

  const update = async (patch) => {
    await saveSettings(patch)
    reload()
  }

  return (
    <SettingsContext.Provider value={{ settings: data, loading, reload, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  return ctx || { settings: null, loading: true, reload: () => {}, update: async () => {} }
}

// Owner profile derived from settings, with safe fallbacks.
export function useOwner() {
  const { settings } = useSettings()
  const s = settings || {}
  return {
    name: s.name || 'ธนารัตน์ สหวิริยกุล',
    shortName: s.short_name || 'ธนารัตน์',
    initial: (s.short_name || 'ธ').charAt(0),
    role: s.role || '',
    email: s.email || '',
    phone: s.phone || '',
    taxId: s.tax_id || '',
    bank: s.bank || '',
    bankAccount: s.bank_account || '',
    bankName: s.bank_name || '',
    promptPay: s.promptpay || '',
    partnerName: s.partner_name || 'มุก',
    partnerInitial: s.partner_initial || 'ม',
    logoText: s.logo_text || 'Agent Office',
  }
}
