const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

// '2026-02-05' -> '5 ก.พ. 2569' (Buddhist year)
export function thaiDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

// relative label: วันนี้ / เมื่อวาน / N วันก่อน / short date
export function relativeThai(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000)
  if (days <= 0) return 'วันนี้'
  if (days === 1) return 'เมื่อวาน'
  if (days < 7) return `${days} วันก่อน`
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]}`
}

// '2026-02-05T09:14:00Z' -> 'วันนี้ 09:14' / '6 ก.พ. 11:02'
export function timeThai(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const rel = relativeThai(value)
  if (rel === 'วันนี้' || rel === 'เมื่อวาน') return `${rel} ${hh}:${mm}`
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${hh}:${mm}`
}

export const baht = (n) => `฿${Number(n || 0).toLocaleString()}`

export function itemsTotal(items) {
  if (!Array.isArray(items)) return 0
  return items.reduce((s, it) => s + Number(it.qty ?? 1) * Number(it.unit_price ?? it.amount ?? 0), 0)
}
