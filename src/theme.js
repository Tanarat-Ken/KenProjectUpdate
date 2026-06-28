export const C = {
  ink: '#1C1B17',
  grayMed: '#6B6A60',
  grayLight: '#9A998E',
  grayPale: '#C7C3B6',
  border: '#E7E3D8',
  borderLight: '#F0EDE3',
  borderDash: '#D8D2C2',
  panel: '#FAF8F2',
  panelAlt: '#F4F2EC',
  bg: '#FBFAF6',
  white: '#ffffff',
  teal: '#0E8F7A',
  tealDark: '#0E7062',
  tealLight: '#E7F2EF',
  tealMid: '#B8DDD5',
  blue: '#2B61CC',
  blueLight: '#E8EFFC',
  burgundy: '#9B2242',
  burgundyLight: '#F8E9ED',
  green: '#1E8A4B',
  greenLight: '#E7F4EC',
  amber: '#C98A12',
  amberLight: '#FBF1DC',
}

export const DOC_COLORS = {
  QT: C.teal,
  DN: C.blue,
  INV: C.burgundy,
  RC: C.green,
}

export const STATUS_COLOR = {
  'กำลังทำ':    { bg: C.tealLight,     text: C.teal },
  'รอลูกค้า':  { bg: C.amberLight,    text: C.amber },
  'รอตอบรับ':  { bg: C.amberLight,    text: C.amber },
  'รอตรวจรับ': { bg: C.blueLight,     text: C.blue },
  'รอชำระ':    { bg: C.burgundyLight, text: C.burgundy },
  'ปิดงาน':   { bg: C.greenLight,    text: C.green },
  'ตอบรับ':    { bg: C.greenLight,    text: C.green },
  'เซ็นรับ':   { bg: C.greenLight,    text: C.green },
  'ชำระแล้ว':  { bg: C.greenLight,    text: C.green },
  'ออกแล้ว':   { bg: C.greenLight,    text: C.green },
  'ส่งแล้ว':   { bg: C.blueLight,     text: C.blue },
  'เกินกำหนด': { bg: C.burgundyLight, text: C.burgundy },
  'ร่าง':      { bg: C.panelAlt,      text: C.grayMed },
  'รอ':        { bg: C.amberLight,    text: C.amber },
  'ปฏิเสธ':    { bg: C.burgundyLight, text: C.burgundy },
}

export const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 13,
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
}
