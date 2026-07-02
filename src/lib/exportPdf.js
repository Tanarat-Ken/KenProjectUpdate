import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Renders the on-screen document node to a canvas and saves it as a real,
// standard-A4 PDF.
//
// We used to rely on the browser's native print dialog (window.print() +
// @media print CSS) to produce the PDF. That path is fragile in a way we
// can't fully control from code: Chrome/Edge/Firefox all default their
// print dialog's "background graphics" option to OFF, and skip printing
// every CSS background-color when it's off — which silently drops every
// colored element in the document (the accent stripe, the colored amount
// box, the dark table header, the invoice highlight box) along with the
// white text sitting on top of them. Every user has to remember to flip
// that checkbox on every single export, and there is no CSS or JS we can
// ship that forces a browser to ignore that setting.
//
// Rasterizing the exact DOM the user already sees (which always has full
// color, since it's just a normal on-screen React render) sidesteps the
// browser print pipeline entirely: what you see in the app is pixel-for-
// pixel what ends up in the PDF, with no dialog and no checkbox to miss.
//
// The page itself is a fixed A4 sheet (210×297mm) with a 12mm margin on
// every side — same margin the old @media print `@page` rule used — so the
// footer always sits with breathing room above the page edge instead of
// touching it, and the file matches real A4 paper if printed. Documents
// taller than one page split across multiple A4 pages, and the split point
// is nudged to the nearest row boundary (using the same .ao-doc-row /
// .ao-doc-total / .ao-doc-thead markers the old print CSS used for
// break-inside: avoid) so a table row is never cut in half across pages.
const PAGE_W_MM = 210
const PAGE_H_MM = 297
const MARGIN_MM = 12
const CONTENT_W_MM = PAGE_W_MM - 2 * MARGIN_MM
const CONTENT_H_MM = PAGE_H_MM - 2 * MARGIN_MM

function rowBoundariesPx(node, scale) {
  const nodeTop = node.getBoundingClientRect().top
  return Array.from(node.querySelectorAll('.ao-doc-row, .ao-doc-total, .ao-doc-thead')).map((el) => {
    const r = el.getBoundingClientRect()
    return { top: (r.top - nodeTop) * scale, bottom: (r.bottom - nodeTop) * scale }
  })
}

// Push a proposed page-break point back to the top of any row it would cut through.
function snapToRowBoundary(idealEnd, sliceStart, rows) {
  const cutting = rows.find((r) => idealEnd > r.top + 1 && idealEnd < r.bottom - 1)
  if (!cutting) return idealEnd
  // If the row itself doesn't fit in a page from sliceStart, just cut it — nothing else to do.
  if (cutting.top <= sliceStart) return idealEnd
  return cutting.top
}

function cropCanvas(source, topPx, heightPx) {
  const slice = document.createElement('canvas')
  slice.width = source.width
  slice.height = heightPx
  slice.getContext('2d').drawImage(source, 0, topPx, source.width, heightPx, 0, 0, source.width, heightPx)
  return slice
}

export async function downloadDocAsPdf(node, filename) {
  const scale = 2
  const canvas = await html2canvas(node, { scale, backgroundColor: '#ffffff', useCORS: true })

  const pxPerMm = canvas.width / CONTENT_W_MM
  const pageHeightPx = CONTENT_H_MM * pxPerMm
  const rows = rowBoundariesPx(node, scale)

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  let sliceTop = 0
  let firstPage = true
  while (sliceTop < canvas.height) {
    const idealEnd = Math.min(sliceTop + pageHeightPx, canvas.height)
    const end = idealEnd >= canvas.height ? idealEnd : snapToRowBoundary(idealEnd, sliceTop, rows)
    const sliceHeightPx = Math.max(1, end - sliceTop)

    const sliceCanvas = cropCanvas(canvas, sliceTop, sliceHeightPx)
    const sliceHeightMm = sliceHeightPx / pxPerMm

    if (!firstPage) pdf.addPage()
    pdf.addImage(sliceCanvas.toDataURL('image/png', 1.0), 'PNG', MARGIN_MM, MARGIN_MM, CONTENT_W_MM, sliceHeightMm)

    sliceTop = end
    firstPage = false
  }

  pdf.save(filename)
}
