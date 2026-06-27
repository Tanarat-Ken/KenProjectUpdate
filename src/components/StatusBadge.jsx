import { STATUS_COLOR } from '../theme'

export function StatusBadge({ status, size = 'sm' }) {
  const colors = STATUS_COLOR[status] || { bg: '#F4F2EC', text: '#9A998E' }
  const px = size === 'sm' ? '11px' : '14px'
  const py = size === 'sm' ? '4px' : '6px'
  const fs = size === 'sm' ? 11 : 12
  return (
    <span style={{
      fontFamily: "'Sarabun', sans-serif",
      fontWeight: 600,
      fontSize: fs,
      color: colors.text,
      background: colors.bg,
      padding: `${py} ${px}`,
      borderRadius: 20,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}
