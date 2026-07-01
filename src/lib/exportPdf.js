import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Renders the on-screen document node to a canvas and saves it as a PDF.
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
export async function downloadDocAsPdf(node, filename) {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  })

  const imgWidthMm = 210 // A4 width
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width

  // jsPDF silently swaps a custom [width, height] format's dimensions
  // whenever they disagree with the given `orientation` (e.g. a short
  // document, wider than it is tall, passed with orientation: 'portrait').
  // The image is then drawn at the pre-swap size onto the post-swap page,
  // cutting off its right edge. Deriving orientation from the same
  // width/height we hand to `format` keeps the two in agreement so jsPDF
  // never needs to swap anything.
  const orientation = imgWidthMm > imgHeightMm ? 'landscape' : 'portrait'

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [imgWidthMm, imgHeightMm],
  })
  pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, imgWidthMm, imgHeightMm)
  pdf.save(filename)
}
