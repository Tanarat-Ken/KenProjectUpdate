export const OWNER = {
  name: 'ธนารัตน์ สหวิริยกุล',
  shortName: 'ธนารัตน์',
  initial: 'ธ',
  role: 'RPA Developer & Consultant',
  email: 'tanarat.sah@gmail.com',
  phone: '081-234-5678',
  taxId: '1 1037 01234 56 7',
  bank: 'กสิกรไทย (ออมทรัพย์)',
  bankAccount: '123-4-56789-0',
  bankName: 'ธนารัตน์ สหวิริยกุล',
  promptPay: '081-234-5678',
}

export const PARTNER = {
  name: 'มุก',
  initial: 'ม',
  role: 'ผู้ช่วย',
}

export const PROJECTS = [
  {
    id: 'P-2026-009',
    name: 'บันทึกใบแจ้งหนี้เข้า SAP อัตโนมัติ',
    client: 'บริษัท ตัวอย่าง จำกัด',
    contact: 'คุณสมหญิง รุ่งเรือง',
    value: 170000,
    status: 'รอชำระ',
    pipeline: { QT: true, DN: true, INV: true, RC: false },
    startDate: '5 ก.พ. 2569',
    deliverDate: '28 ก.พ. 2569',
    updatedAt: 'วันนี้',
    managers: 'ธนารัตน์ · มุก',
    currentStep: 5,
  },
  {
    id: 'P-2026-012',
    name: 'บอทดึงรายงานยอดขายรายวัน',
    client: 'ร้านกาแฟ มีสุข',
    value: 48000,
    status: 'กำลังทำ',
    pipeline: { QT: true, DN: false, INV: false, RC: false },
    updatedAt: 'เมื่อวาน',
    currentStep: 2,
  },
  {
    id: 'P-2026-013',
    name: 'RPA กระทบยอด statement ธนาคาร',
    client: 'หจก. รุ่งเรืองพาณิชย์',
    value: 92000,
    status: 'รอตรวจรับ',
    pipeline: { QT: true, DN: true, INV: false, RC: false },
    updatedAt: '2 วันก่อน',
    currentStep: 4,
  },
  {
    id: 'P-2026-007',
    name: 'บอทกรอกใบสมัครจาก Excel → เว็บ',
    client: 'คลินิกฟันดี',
    value: 35000,
    status: 'ปิดงาน',
    pipeline: { QT: true, DN: true, INV: true, RC: true },
    updatedAt: '24 ก.พ.',
    currentStep: 7,
  },
]

export const DOCUMENTS = [
  { id: 'QT-2026-009', type: 'QT', label: 'ใบเสนอราคา', status: 'ตอบรับ', rev: 'rev.1', projectId: 'P-2026-009' },
  { id: 'DN-2026-014', type: 'DN', label: 'ใบส่งงาน',   status: 'เซ็นรับ', rev: 'rev.1', projectId: 'P-2026-009' },
  { id: 'INV-2026-021', type: 'INV', label: 'ใบแจ้งหนี้', status: 'รอชำระ', rev: '', projectId: 'P-2026-009' },
  { id: 'RC', type: 'RC', label: 'ใบเสร็จรับเงิน', status: 'รอ', rev: '', projectId: 'P-2026-009', pending: true },
]

export const LINE_ITEMS = [
  { desc: 'พัฒนา RPA Bot อ่านใบแจ้งหนี้ → SAP', amount: 85000 },
  { desc: 'Workflow + เชื่อม API ธนาคาร', amount: 45000 },
  { desc: 'Orchestrator + Monitoring', amount: 28000 },
  { desc: 'อบรม + เอกสาร', amount: 12000 },
]

export const FILES = [
  { name: 'concept-solution.md', type: 'MD',   typeColor: '#2B61CC', size: '12 KB', active: true },
  { name: 'architecture-diagram.html', type: 'HTML', typeColor: '#C98A12', size: '48 KB' },
  { name: 'runbook.md', type: 'MD',   typeColor: '#2B61CC', size: '8 KB' },
  { name: 'requirement-เดิม.pdf', type: 'PDF',  typeColor: '#9B2242', size: '2.1 MB' },
  { name: 'test-cases.xlsx', type: 'XLSX', typeColor: '#6B6A60', size: '320 KB' },
]

export const REVISIONS = [
  {
    id: 1,
    icon: 'file',
    color: '#9B2242',
    title: 'ออกใบแจ้งหนี้',
    docId: 'INV-2026-021',
    docColor: '#9B2242',
    detail: 'สร้างจาก QT-2026-009 · ยอด ฿170,000 · ครบกำหนด 15 มี.ค.',
    time: 'วันนี้ 09:14',
    user: 'ธนารัตน์ (เจ้าของ)',
    userInitial: 'ธ',
    userColor: '#0E8F7A',
  },
  {
    id: 2,
    icon: 'edit',
    color: '#C98A12',
    title: 'แก้ไขใบส่งงาน',
    docId: 'DN-2026-014',
    docColor: '#2B61CC',
    rev: 'rev.1 → rev.2',
    diff: [
      { type: 'remove', text: '− วันส่งมอบ 27 ก.พ.' },
      { type: 'add', text: '+ วันส่งมอบ 28 ก.พ. (เลื่อนตามลูกค้า)' },
    ],
    time: 'เมื่อวาน 16:40',
    user: 'มุก (ผู้ช่วย)',
    userInitial: 'ม',
    userColor: '#C98A12',
  },
  {
    id: 3,
    icon: 'edit',
    color: '#0E8F7A',
    title: 'แก้ไขใบเสนอราคา',
    docId: 'QT-2026-009',
    docColor: '#0E8F7A',
    rev: 'rev.1 → rev.2',
    diff: [
      { type: 'remove', text: '− รายการ Orchestrator ฿32,000' },
      { type: 'add', text: '+ รายการ Orchestrator ฿28,000 (ปรับตามที่ตกลง)' },
    ],
    time: '6 ก.พ. 11:02',
    user: 'ธนารัตน์ (เจ้าของ)',
    userInitial: 'ธ',
    userColor: '#0E8F7A',
  },
  {
    id: 4,
    icon: 'check',
    color: '#1E8A4B',
    title: 'สร้างงาน + ใบเสนอราคาแรก',
    detail: 'เปิดงาน P-2026-009 · แนบไฟล์ concept-solution.md',
    time: '5 ก.พ. 10:20',
  },
]

export const PIPELINE_STEPS = [
  { n: 1, label: 'สร้างงาน + เสนอราคา',       sub: 'ออก QT-2026-009 · ฿170,000 · 5 ก.พ. 2569', docId: 'QT-2026-009', docColor: '#0E8F7A', done: true, tag: '✓ บันทึกแล้ว', tagColor: '#1E8A4B' },
  { n: 2, label: 'ลูกค้าตอบรับข้อเสนอ',        sub: 'ยืนยันจ้างงาน · มัดจำ 50% รับแล้ว · 8 ก.พ. 2569', done: true, tag: '✓ บันทึกแล้ว', tagColor: '#1E8A4B' },
  { n: 3, label: 'พัฒนางาน',                   sub: 'พัฒนาเสร็จ · ทดสอบผ่าน · 27 ก.พ. 2569', done: true, tag: '✓ เสร็จ', tagColor: '#1E8A4B' },
  { n: 4, label: 'ส่งมอบงาน',                  sub: 'ออก DN-2026-014 · ลูกค้าเซ็นตรวจรับแล้ว · 28 ก.พ.', docId: 'DN-2026-014', docColor: '#2B61CC', done: true, connColor: '#9B2242', tag: '✓ บันทึกแล้ว', tagColor: '#1E8A4B' },
  { n: 5, label: 'วางบิล / แจ้งหนี้ — ขั้นปัจจุบัน', sub: 'ออก INV-2026-021 · ส่งแล้ว 1 มี.ค. · ครบกำหนด 15 มี.ค.', docId: 'INV-2026-021', docColor: '#9B2242', current: true, tag: 'รอชำระ', tagBg: '#F8E9ED', tagColor: '#9B2242' },
  { n: 6, label: 'รับเงิน + ออกใบเสร็จ',       sub: 'ระบบจะสร้าง RC อัตโนมัติเมื่อบันทึกรับเงิน', pending: true },
  { n: 7, label: 'ปิดงาน',                     sub: 'เก็บเข้าคลังงานที่เสร็จสมบูรณ์', pending: true },
]

export const ACTIVITY = [
  { color: '#9B2242', text: 'ส่งใบแจ้งหนี้', code: 'INV-2026-021', codeColor: '#9B2242', codeSuffix: ' ให้ บ.ตัวอย่าง', time: 'วันนี้ 09:14 · โดยคุณ' },
  { color: '#2B61CC', text: 'ออกใบส่งงาน ',  code: 'DN-2026-014',  codeColor: '#2B61CC', codeSuffix: '', time: 'เมื่อวาน 16:40 · โดยมุก (ผู้ช่วย)' },
  { color: '#0E8F7A', text: 'แก้ไขใบเสนอราคา ', code: 'QT-2026-013', codeColor: '#0E8F7A', codeSuffix: ' (rev.2)', time: '25 ก.พ. 11:02 · โดยคุณ' },
  { color: '#1E8A4B', text: 'รับเงิน ', code: '฿35,000', codeColor: '#1E8A4B', codeSuffix: ' งานคลินิกฟันดี', time: '24 ก.พ. 14:32 · ปิดงานแล้ว' },
]
