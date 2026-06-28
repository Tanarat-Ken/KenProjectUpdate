import { useEffect, useRef, useState } from 'react'
import { C } from '../theme'

// Quick pokes the user can give the mascot. Each maps to a reaction in the
// embedded 3D cat (public/cat3d/index.html) via postMessage.
const ACTIONS = [
  { act: 'meow', label: 'เหมียว' },
  { act: 'happy', label: 'ดีใจ' },
  { act: 'jump', label: 'กระโดด' },
  { act: 'sit', label: 'นั่ง' },
  { act: 'sleep', label: 'นอน' },
  { act: 'walk', label: 'เดิน' },
]

// Other parts of the app can make the cat react:
//   window.dispatchEvent(new CustomEvent('agentoffice:cat-react', { detail: { action: 'happy' } }))
export function CatMascot() {
  const [open, setOpen] = useState(true)
  const iframeRef = useRef(null)
  const queueRef = useRef([])
  const readyRef = useRef(false)

  const send = (action) => {
    const w = iframeRef.current?.contentWindow
    if (w && readyRef.current) w.postMessage({ type: 'cat', action }, '*')
    else queueRef.current.push(action)
  }

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === 'cat-ready') {
        readyRef.current = true
        const w = iframeRef.current?.contentWindow
        queueRef.current.forEach((a) => w?.postMessage({ type: 'cat', action: a }, '*'))
        queueRef.current = []
      }
    }
    const onReact = (e) => send(e.detail?.action || 'happy')
    window.addEventListener('message', onMsg)
    window.addEventListener('agentoffice:cat-react', onReact)
    return () => {
      window.removeEventListener('message', onMsg)
      window.removeEventListener('agentoffice:cat-react', onReact)
    }
  }, [])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="เรียกน้องเหมียว"
        style={{
          position: 'fixed', right: 18, bottom: 18, zIndex: 60,
          width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: C.teal, color: '#fff', fontSize: 26, lineHeight: 1,
          boxShadow: '0 8px 24px rgba(0,0,0,.28)',
        }}
        className="btn"
      >🐱</button>
    )
  }

  return (
    <div style={{
      position: 'fixed', right: 18, bottom: 18, zIndex: 60, width: 214,
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 18,
      boxShadow: '0 14px 40px rgba(0,0,0,.22)', overflow: 'hidden',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 8px 13px', borderBottom: `1px solid ${C.borderLight}` }}>
        <span style={{ fontFamily: "'Sarabun'", fontWeight: 700, fontSize: 12.5, color: C.ink }}>น้องเหมียว 🐈</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <a href="/cat3d/index.html" target="_blank" rel="noreferrer" title="เปิดเต็มจอ" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, color: C.grayMed, textDecoration: 'none', fontSize: 13 }}>⤢</a>
          <button onClick={() => setOpen(false)} title="ย่อ" style={{ width: 24, height: 24, borderRadius: 7, border: 'none', background: C.panelAlt, color: C.grayMed, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>—</button>
        </div>
      </div>

      {/* 3D cat (transparent embed) */}
      <div style={{ height: 168, background: `radial-gradient(circle at 50% 35%, ${C.tealLight}, ${C.panel})` }}>
        <iframe
          ref={iframeRef}
          src="/cat3d/index.html?embed=1"
          title="3D cat mascot"
          style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
          allowtransparency="true"
        />
      </div>

      {/* action buttons — every one triggers a reaction */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, padding: 8 }}>
        {ACTIONS.map((a) => (
          <button
            key={a.act}
            onClick={() => send(a.act)}
            className="btn"
            style={{ fontFamily: "'Sarabun'", fontSize: 11.5, fontWeight: 600, color: C.ink, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, padding: '7px 4px', cursor: 'pointer' }}
          >{a.label}</button>
        ))}
      </div>
    </div>
  )
}
