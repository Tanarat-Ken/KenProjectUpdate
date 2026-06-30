import { useCallback, useEffect, useState } from 'react'

// Tiny data-loading helper: runs an async fn, tracks loading/error/data,
// and exposes reload(). `deps` re-runs the fetch when they change.
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  const run = useCallback(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.resolve(fn())
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        alive && setState({ loading: false, error, data: null })
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(run, [run])

  const reload = useCallback(() => run(), [run])
  return { ...state, reload }
}
