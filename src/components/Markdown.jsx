import { C } from '../theme'

// Minimal, dependency-free Markdown renderer tuned for concept docs
// (headings, lists, blockquotes, code fences, bold/italic/code spans, hr).
function inline(text, keyBase) {
  const nodes = []
  let rest = text
  let k = 0
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/
  let m
  while ((m = re.exec(rest))) {
    if (m.index > 0) nodes.push(rest.slice(0, m.index))
    if (m[2] !== undefined) nodes.push(<strong key={`${keyBase}-${k++}`}>{m[2]}</strong>)
    else if (m[3] !== undefined) nodes.push(<code key={`${keyBase}-${k++}`} style={codeSpan}>{m[3]}</code>)
    else if (m[4] !== undefined) nodes.push(<em key={`${keyBase}-${k++}`}>{m[4]}</em>)
    else if (m[5] !== undefined) nodes.push(<a key={`${keyBase}-${k++}`} href={m[6]} target="_blank" rel="noreferrer" style={{ color: C.teal }}>{m[5]}</a>)
    rest = rest.slice(m.index + m[1].length)
  }
  if (rest) nodes.push(rest)
  return nodes
}

const codeSpan = { fontFamily: 'monospace', fontSize: '0.9em', background: C.panel, padding: '1px 5px', borderRadius: 4, color: C.burgundy }

export function Markdown({ text }) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let list = null
  let code = null

  const flushList = () => { if (list) { blocks.push({ type: 'list', ordered: list.ordered, items: list.items }); list = null } }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (code !== null) {
      if (line.trim().startsWith('```')) { blocks.push({ type: 'code', text: code.join('\n') }); code = null }
      else code.push(line)
      continue
    }
    if (line.trim().startsWith('```')) { flushList(); code = []; continue }
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) { flushList(); blocks.push({ type: 'h', level: h[1].length, text: h[2] }); continue }
    if (/^\s*[-*]\s+/.test(line)) { if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] } } list.items.push(line.replace(/^\s*[-*]\s+/, '')); continue }
    if (/^\s*\d+\.\s+/.test(line)) { if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] } } list.items.push(line.replace(/^\s*\d+\.\s+/, '')); continue }
    if (/^\s*>\s?/.test(line)) { flushList(); blocks.push({ type: 'quote', text: line.replace(/^\s*>\s?/, '') }); continue }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushList(); blocks.push({ type: 'hr' }); continue }
    if (line.trim() === '') { flushList(); continue }
    flushList(); blocks.push({ type: 'p', text: line })
  }
  flushList()
  if (code !== null) blocks.push({ type: 'code', text: code.join('\n') })

  const hSize = { 1: 24, 2: 18, 3: 15, 4: 13.5 }
  return (
    <div style={{ fontFamily: "'Sarabun'", color: '#3F3E37', lineHeight: 1.7 }}>
      {blocks.map((b, i) => {
        if (b.type === 'h') return <div key={i} style={{ fontWeight: 700, fontSize: hSize[b.level] || 13, color: C.ink, margin: b.level <= 1 ? '0 0 10px' : '18px 0 8px' }}>{inline(b.text, `h${i}`)}</div>
        if (b.type === 'p') return <p key={i} style={{ fontSize: 13.5, margin: '0 0 12px' }}>{inline(b.text, `p${i}`)}</p>
        if (b.type === 'quote') return <div key={i} style={{ background: C.panel, borderLeft: `3px solid ${C.teal}`, borderRadius: '0 8px 8px 0', padding: '10px 14px', margin: '0 0 12px', fontSize: 13 }}>{inline(b.text, `q${i}`)}</div>
        if (b.type === 'hr') return <hr key={i} style={{ border: 'none', borderTop: `1px solid ${C.borderLight}`, margin: '16px 0' }} />
        if (b.type === 'code') return <pre key={i} style={{ fontFamily: 'monospace', fontSize: 12, background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: '12px 14px', overflow: 'auto', margin: '0 0 14px', lineHeight: 1.6 }}>{b.text}</pre>
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul'
          return <Tag key={i} style={{ margin: '0 0 14px', paddingLeft: 22, fontSize: 13.5 }}>{b.items.map((it, j) => <li key={j} style={{ marginBottom: 5 }}>{inline(it, `l${i}-${j}`)}</li>)}</Tag>
        }
        return null
      })}
    </div>
  )
}
