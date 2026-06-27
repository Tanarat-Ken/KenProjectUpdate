import { C, DOC_COLORS } from '../theme'

const STEPS = ['Q', 'D', 'I', 'R']
const KEYS = ['QT', 'DN', 'INV', 'RC']

export function Pipeline({ pipeline }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {STEPS.map((s, i) => {
        const done = pipeline[KEYS[i]]
        const color = done ? DOC_COLORS[KEYS[i]] : null
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: done ? color : C.white,
              border: done ? 'none' : `1.5px solid ${C.border}`,
              color: done ? C.white : C.grayPale,
              fontSize: 10, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Space Grotesk', sans-serif",
              flexShrink: 0,
            }}>
              {s}
            </div>
            {i < 3 && (
              <div style={{
                width: 14, height: 2,
                background: done && pipeline[KEYS[i + 1]] ? DOC_COLORS[KEYS[i + 1]] : C.border,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
