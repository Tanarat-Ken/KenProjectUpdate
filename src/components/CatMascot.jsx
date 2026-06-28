import { useEffect, useRef } from 'react'

// A full-window, click-through overlay where the 3D cat roams around the
// screen like a little desktop pet. No panel / buttons — it just wanders.
// Other parts of the app can make it react:
//   window.dispatchEvent(new CustomEvent('agentoffice:cat-react', { detail: { action: 'happy' } }))
export function CatMascot() {
  const iframeRef = useRef(null)
  const readyRef = useRef(false)
  const queueRef = useRef([])

  useEffect(() => {
    const send = (action) => {
      const w = iframeRef.current?.contentWindow
      if (w && readyRef.current) w.postMessage({ type: 'cat', action }, '*')
      else queueRef.current.push(action)
    }
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

  return (
    <iframe
      ref={iframeRef}
      src="/cat3d/index.html?embed=1&roam=1"
      title="cat"
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        border: 'none', background: 'transparent',
        pointerEvents: 'none', // clicks pass through to the app
        zIndex: 40,
      }}
    />
  )
}
