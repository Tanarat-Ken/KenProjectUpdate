import { supabase } from './supabase'
import { thaiDate, relativeThai, itemsTotal } from './format'

/* ---------------------------------------------------------------- mapping */

export const DOC_META = {
  QT: { label: 'ใบเสนอราคา', color: '#0E8F7A' },
  DN: { label: 'ใบส่งงาน', color: '#2B61CC' },
  INV: { label: 'ใบแจ้งหนี้', color: '#9B2242' },
  RC: { label: 'ใบเสร็จรับเงิน', color: '#1E8A4B' },
}

// Map raw DB document status -> Thai badge label
const DOC_STATUS_TH = {
  draft: 'ร่าง', sent: 'ส่งแล้ว', accepted: 'ตอบรับ', rejected: 'ปฏิเสธ',
  pending: 'รอตรวจรับ', delivered: 'เซ็นรับ', signed: 'เซ็นรับ',
  issued: 'รอชำระ', billed: 'วางบิล', paid: 'ชำระแล้ว', overdue: 'เกินกำหนด',
  unpaid: 'รอชำระ', open: 'รอชำระ',
}
export const docStatusTh = (s) => DOC_STATUS_TH[s] || s || '—'

// agentoffice_attachments.kind has a CHECK constraint — only these values allowed.
// We keep the real extension in `title`; `kind` is just the broad category.
function kindOf(ext) {
  const e = (ext || '').toLowerCase()
  if (e === 'pdf') return 'pdf'
  if (['xls', 'xlsx', 'csv'].includes(e)) return 'excel'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(e)) return 'image'
  if (['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v'].includes(e)) return 'video'
  return 'file'
}

/* ---------------------------------------------------------------- settings */

const DEFAULT_SETTINGS = {
  id: 1,
  name: 'ธนารัตน์ สหวิริยกุล',
  short_name: 'ธนารัตน์',
  role: 'RPA Developer & Consultant',
  email: 'tanarat.sah@gmail.com',
  phone: '',
  tax_id: '',
  bank: '',
  bank_account: '',
  bank_name: '',
  promptpay: '',
  partner_name: 'ปาน',
  partner_initial: 'ป',
  logo_text: 'Agent Office',
  prefix_qt: 'QT', prefix_dn: 'DN', prefix_inv: 'INV', prefix_rc: 'RC',
  // Single shared running number for the whole document chain of a job.
  // เลขรันนิ่งเดียวต่อ 1 งาน — เปลี่ยนเฉพาะ prefix ตามชนิดเอกสาร (QT/DN/INV/RC)
  next_no: 9,
  // legacy per-type counters (ไม่ใช้แล้ว เก็บไว้กันพัง ถ้ามีข้อมูลเก่า)
  next_qt: 1, next_dn: 1, next_inv: 1, next_rc: 1,
}

export async function getSettings() {
  const { data, error } = await supabase.from('agentoffice_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return { ...DEFAULT_SETTINGS, ...(data || {}) }
}

export async function saveSettings(patch) {
  const { data, error } = await supabase
    .from('agentoffice_settings')
    .upsert({ id: 1, ...patch, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

/* ---------------------------------------------------------------- item catalog */
// คลังรายการที่เคยใช้ — กดเลือกซ้ำได้พร้อมราคาเดิมในครั้งถัดไป

export async function getItemCatalog() {
  const { data, error } = await supabase
    .from('agentoffice_item_catalog')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data || []).map((r) => ({ id: r.id, name: r.name, unit_price: Number(r.unit_price || 0) }))
}

// Remember every distinct line item (name + latest price) for quick re-pick later.
async function rememberItems(rows) {
  const seen = new Set()
  const payload = []
  for (const r of rows || []) {
    const name = (r.desc || r.name || r.description || '').trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    payload.push({ name, unit_price: Number(r.unit_price ?? r.amount ?? 0) || 0, updated_at: new Date().toISOString() })
  }
  if (!payload.length) return
  // Best-effort — never block document creation if the catalog write fails.
  try {
    await supabase.from('agentoffice_item_catalog').upsert(payload, { onConflict: 'name' })
  } catch (e) {
    console.warn('catalog upsert skipped:', e?.message || e)
  }
}

/* ---------------------------------------------------------------- customers */

export async function getCustomers() {
  const { data, error } = await supabase
    .from('agentoffice_customers')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function saveCustomer(customer) {
  const { data, error } = await supabase
    .from('agentoffice_customers')
    .upsert(customer)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('agentoffice_customers').delete().eq('id', id)
  if (error) throw error
}

/* ---------------------------------------------------------------- documents */

// Pull every document in the chain at once (small single-user dataset).
async function fetchAllDocs() {
  const [qt, dn, inv, pay] = await Promise.all([
    supabase.from('agentoffice_quotations').select('*'),
    supabase.from('agentoffice_delivery_notes').select('*'),
    supabase.from('agentoffice_invoices').select('*'),
    supabase.from('agentoffice_payments').select('*'),
  ])
  for (const r of [qt, dn, inv, pay]) if (r.error) throw r.error
  return { qt: qt.data || [], dn: dn.data || [], inv: inv.data || [], pay: pay.data || [] }
}

function valueOf(project, docs) {
  if (project.value) return Number(project.value)
  const q = docs.qt.find((d) => d.project_id === project.id)
  return q ? itemsTotal(q.items) : 0
}

function pipelineFor(projectId, docs) {
  const qt = docs.qt.some((d) => d.project_id === projectId)
  const dn = docs.dn.some((d) => d.project_id === projectId)
  const inv = docs.inv.filter((d) => d.project_id === projectId)
  const hasInv = inv.length > 0
  const invIds = inv.map((d) => d.id)
  const rc =
    inv.some((d) => d.status === 'paid') || docs.pay.some((p) => invIds.includes(p.invoice_id))
  return { QT: qt, DN: dn, INV: hasInv, RC: rc }
}

/* ---------------------------------------------------------------- projects */

export async function getProjects() {
  const [{ data: projects, error }, customers, docs] = await Promise.all([
    supabase.from('agentoffice_projects').select('*').order('created_at', { ascending: false }),
    getCustomers(),
    fetchAllDocs(),
  ])
  if (error) throw error
  const custName = (id) => customers.find((c) => c.id === id)?.name || '—'

  return (projects || []).map((p) => ({
    id: p.code || p.id,
    uuid: p.id,
    name: p.name,
    client: custName(p.customer_id),
    customerId: p.customer_id,
    value: valueOf(p, docs),
    status: p.status,
    pipeline: pipelineFor(p.id, docs),
    startDate: thaiDate(p.start_date),
    deliverDate: thaiDate(p.deliver_date),
    updatedAt: relativeThai(p.updated_at || p.created_at),
    managers: p.managers || '',
    currentStep: p.current_step || 1,
    description: p.description || '',
  }))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getProjectByCode(code) {
  const column = UUID_RE.test(code) ? 'id' : 'code'
  const { data: project, error } = await supabase
    .from('agentoffice_projects')
    .select('*')
    .eq(column, code)
    .maybeSingle()
  if (error) throw error
  if (!project) return null

  const [customers, docs, revisions, files] = await Promise.all([
    getCustomers(),
    fetchAllDocs(),
    getRevisions(project.id),
    getFiles(project.id),
  ])
  const customer = customers.find((c) => c.id === project.customer_id) || null

  const qt = docs.qt.find((d) => d.project_id === project.id) || null
  const dn = docs.dn.find((d) => d.project_id === project.id) || null
  const inv = docs.inv.find((d) => d.project_id === project.id) || null
  const invIds = docs.inv.filter((d) => d.project_id === project.id).map((d) => d.id)
  const paid = inv?.status === 'paid' || docs.pay.some((p) => invIds.includes(p.invoice_id))

  const documents = []
  if (qt) documents.push(docCard('QT', qt))
  if (dn) documents.push(docCard('DN', dn))
  if (inv) documents.push(docCard('INV', inv))
  documents.push(
    paid
      ? { id: 'RC', type: 'RC', label: DOC_META.RC.label, status: 'ออกแล้ว', rev: '' }
      : { id: 'RC', type: 'RC', label: DOC_META.RC.label, status: 'รอ', rev: '', pending: true }
  )

  return {
    id: project.code || project.id,
    uuid: project.id,
    name: project.name,
    client: customer?.name || '—',
    customer,
    value: valueOf(project, docs),
    status: project.status,
    currentStep: project.current_step || 1,
    description: project.description || '',
    startDate: thaiDate(project.start_date),
    deliverDate: thaiDate(project.deliver_date),
    managers: project.managers || '',
    pipeline: pipelineFor(project.id, docs),
    documents,
    lineItems: (qt?.items || []).map((it) => ({
      desc: it.description || it.name,
      qty: Number(it.qty ?? 1),
      unit_price: Number(it.unit_price ?? it.amount ?? 0),
      // amount = ยอดรวมต่อบรรทัด (qty × ราคา/หน่วย) — เผื่อจุดที่ยังอ่าน .amount เดิม
      amount: Number(it.qty ?? 1) * Number(it.unit_price ?? it.amount ?? 0),
    })),
    revisions,
    files,
    raw: { qt, dn, inv },
  }
}

function docCard(type, row) {
  return {
    id: row.number,
    type,
    label: DOC_META[type].label,
    status: docStatusTh(row.status),
    rev: '',
  }
}

// All documents across projects (for the Documents page)
export async function getAllDocuments() {
  const [docs, projects, customers] = await Promise.all([
    fetchAllDocs(),
    supabase.from('agentoffice_projects').select('id,code,name'),
    getCustomers(),
  ])
  const projById = Object.fromEntries((projects.data || []).map((p) => [p.id, p]))
  const custById = Object.fromEntries(customers.map((c) => [c.id, c]))

  const rows = []
  const push = (type, list) =>
    list.forEach((d) =>
      rows.push({
        id: d.number,
        type,
        label: DOC_META[type].label,
        status: docStatusTh(d.status),
        date: d.issue_date,
        amount: itemsTotal(d.items),
        projectCode: projById[d.project_id]?.code || '',
        client: custById[d.customer_id]?.name || '—',
      })
    )
  push('QT', docs.qt)
  push('DN', docs.dn)
  push('INV', docs.inv)
  return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

/* ---------------------------------------------------------------- files */

export async function getFiles(projectId) {
  const { data, error } = await supabase
    .from('agentoffice_attachments')
    .select('*')
    .eq('deal_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapFile)
}

export async function getAllFiles() {
  const { data, error } = await supabase
    .from('agentoffice_attachments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapFile)
}

function mapFile(a) {
  const ext = (a.title.split('.').pop() || '').toUpperCase()
  const colors = { MD: '#2B61CC', HTML: '#C98A12', PDF: '#9B2242', XLSX: '#6B6A60', PNG: '#0E8F7A' }
  return {
    id: a.id,
    name: a.title,
    type: ext || a.kind?.toUpperCase() || 'FILE',
    typeColor: colors[ext] || '#6B6A60',
    size: a.size ? `${Math.round(a.size / 1024)} KB` : '',
    url: a.url,
    storagePath: a.storage_path,
    note: a.note,
    kind: a.kind,
    dealId: a.deal_id,
  }
}

const FILE_BUCKET = 'agentoffice-files'

export async function uploadFile(dealId, file, note = '') {
  const safe = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${dealId || 'unsorted'}/${Date.now()}-${safe}`
  const up = await supabase.storage.from(FILE_BUCKET).upload(path, file, { upsert: false })
  if (up.error) throw up.error
  const { data: pub } = supabase.storage.from(FILE_BUCKET).getPublicUrl(path)
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const { data, error } = await supabase
    .from('agentoffice_attachments')
    .insert({
      deal_id: dealId || 'unsorted',
      kind: kindOf(ext),
      title: file.name,
      url: pub.publicUrl,
      storage_path: path,
      size: file.size,
      note,
    })
    .select()
    .single()
  if (error) throw error
  return mapFile(data)
}

export async function deleteFile(file) {
  if (file.storagePath) {
    await supabase.storage.from(FILE_BUCKET).remove([file.storagePath])
  }
  const { error } = await supabase.from('agentoffice_attachments').delete().eq('id', file.id)
  if (error) throw error
}

// Fetch the text content of a .md / .html / text attachment for the viewer.
export async function getFileText(file) {
  if (!file?.url) return ''
  const res = await fetch(file.url)
  if (!res.ok) throw new Error('โหลดไฟล์ไม่สำเร็จ')
  return res.text()
}

/* ---------------------------------------------------------------- revisions */

export async function getRevisions(projectId) {
  const { data, error } = await supabase
    .from('agentoffice_revisions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((r) => ({
    id: r.id,
    icon: r.icon,
    color: r.color,
    title: r.title,
    docId: r.doc_id,
    docColor: r.doc_color,
    detail: r.detail,
    rev: r.rev,
    diff: r.diff || [],
    time: r.created_at,
    user: r.user_name,
    userInitial: r.user_initial,
    userColor: r.user_color,
  }))
}

// Recent activity across all projects (dashboard)
export async function getRecentActivity(limit = 6) {
  const { data, error } = await supabase
    .from('agentoffice_revisions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((r) => ({
    color: r.color || '#0E8F7A',
    text: r.title,
    code: r.doc_id || '',
    codeColor: r.doc_color || r.color || '#0E8F7A',
    codeSuffix: r.detail ? ` ${r.detail}` : '',
    time: r.created_at,
    user: r.user_name,
  }))
}

export async function addRevision(rev) {
  const { data, error } = await supabase.from('agentoffice_revisions').insert(rev).select().single()
  if (error) throw error
  return data
}

/* ---------------------------------------------------------------- create doc */

const TABLE_OF = {
  QT: 'agentoffice_quotations',
  DN: 'agentoffice_delivery_notes',
  INV: 'agentoffice_invoices',
}
const PREFIX_KEY = { QT: 'prefix_qt', DN: 'prefix_dn', INV: 'prefix_inv', RC: 'prefix_rc' }
// Project status + the NEXT pending step after each document type is issued
const AFTER = {
  QT: { status: 'รอตอบรับ', step: 2 },   // waiting for the customer to accept
  DN: { status: 'รอตรวจรับ', step: 5 },  // delivered → ready to bill
  INV: { status: 'รอชำระ', step: 6 },    // billed → waiting for payment
  RC: { status: 'ปิดงาน', step: 7 },
}

const pad3 = (n) => String(n || 0).padStart(3, '0')

// One running number per job; only the prefix changes by document type.
// ปีในเลขเอกสาร = ปีที่ออกเอกสารใบนั้นจริง (ค.ศ.) เช่น งาน #009 ออกปี 2026
// → QT-2026-009 / DN-2026-009 / INV-2026-009 / RC-2026-009
function docNumber(settings, type, no, year) {
  return `${settings[PREFIX_KEY[type]] || type}-${year}-${pad3(no)}`
}

// Resolve the job's running number (doc_no). Assign one lazily if missing
// (e.g. legacy projects created before shared numbering existed).
async function runningNumberFor(projectUuid, settings) {
  const { data: proj } = await supabase
    .from('agentoffice_projects').select('doc_no').eq('id', projectUuid).maybeSingle()
  if (proj?.doc_no) return proj.doc_no
  const no = settings.next_no || 9
  await supabase.from('agentoffice_projects').update({ doc_no: no }).eq('id', projectUuid)
  await supabase.from('agentoffice_settings').update({ next_no: no + 1 }).eq('id', 1)
  return no
}

// Convert wizard rows {desc, qty, unit_price} -> stored item shape.
// Accepts legacy {amount} rows too (amount treated as unit price, qty defaults 1).
function toItems(rows) {
  return rows.map((r) => ({
    id: crypto.randomUUID(),
    qty: Number(r.qty ?? 1) || 1,
    name: r.desc,
    description: r.desc,
    unit_price: Number(r.unit_price ?? r.amount ?? 0) || 0,
  }))
}

export async function createDocument({ type, project, items, issueDate, dueDate, note }) {
  const settings = await getSettings()
  const no = await runningNumberFor(project.uuid, settings)
  const today = issueDate || new Date().toISOString().slice(0, 10)
  const number = docNumber(settings, type, no, today.slice(0, 4))
  const storedItems = toItems(items || [])
  const total = itemsTotal(storedItems)

  let created
  if (type === 'RC') {
    // Receipt = record a payment against the project's invoice
    const { data: inv } = await supabase
      .from('agentoffice_invoices')
      .select('id')
      .eq('project_id', project.uuid)
      .limit(1)
      .maybeSingle()
    if (!inv) throw new Error('ยังไม่มีใบแจ้งหนี้สำหรับงานนี้ — ออกใบแจ้งหนี้ก่อน')
    const { data, error } = await supabase
      .from('agentoffice_payments')
      .insert({ invoice_id: inv.id, amount: total || project.value, paid_date: today, method: 'transfer', ref: number })
      .select()
      .single()
    if (error) throw error
    await supabase.from('agentoffice_invoices').update({ status: 'paid' }).eq('id', inv.id)
    created = data
  } else {
    const row = {
      number,
      customer_id: project.customerId || project.customer?.id || null,
      project_id: project.uuid,
      issue_date: today,
      // statuses must satisfy each table's CHECK constraint:
      // QT: draft|sent|accepted|rejected · DN: pending|delivered|accepted · INV: issued|billed|paid|overdue
      status: type === 'QT' ? 'sent' : type === 'DN' ? 'delivered' : 'issued',
      note: note || null,
      items: storedItems,
    }
    if (type === 'DN' || type === 'INV') {
      const { data: q } = await supabase
        .from('agentoffice_quotations')
        .select('id')
        .eq('project_id', project.uuid)
        .limit(1)
        .maybeSingle()
      if (q) row.quotation_id = q.id
    }
    if (type === 'INV') row.due_date = dueDate || null
    const { data, error } = await supabase.from(TABLE_OF[type]).insert(row).select().single()
    if (error) throw error
    created = data
  }

  // Remember the line items for quick re-pick next time
  if (storedItems.length) await rememberItems(storedItems)

  // Advance the project status / step (never go backwards)
  const after = AFTER[type]
  await supabase
    .from('agentoffice_projects')
    .update({ status: after.status, current_step: Math.max(after.step, 1), updated_at: new Date().toISOString() })
    .eq('id', project.uuid)

  // Log a revision
  await addRevision({
    project_id: project.uuid,
    icon: type === 'RC' ? 'check' : 'file',
    color: DOC_META[type].color,
    title: `ออก${DOC_META[type].label}`,
    doc_id: number,
    doc_color: DOC_META[type].color,
    detail: `${project.client} · ${number}`,
    user_name: settings.short_name || 'เจ้าของ',
    user_initial: (settings.short_name || 'ธ').charAt(0),
    user_color: DOC_META[type].color,
  })

  return { number, created }
}

/* ---------------------------------------------------------------- update doc */

// Edit an already-issued document (line items, note, and INV due date).
// Does NOT change status (respects each table's CHECK constraint).
// For QT, also keeps the parent project's `value` in sync with the new total.
export async function updateDocument({ type, id, items, note, dueDate }) {
  if (!TABLE_OF[type]) throw new Error('ชนิดเอกสารไม่ถูกต้อง')
  if (!id) throw new Error('ไม่พบเลขอ้างอิงเอกสาร')

  const storedItems = toItems((items || []).filter((r) => r.desc))
  const total = itemsTotal(storedItems)
  if (storedItems.length) await rememberItems(storedItems)

  const patch = { items: storedItems, note: note || null }
  if (type === 'INV') patch.due_date = dueDate || null

  const { data: updated, error } = await supabase
    .from(TABLE_OF[type])
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  // Keep the project value aligned with the quotation total
  if (type === 'QT' && updated?.project_id) {
    await supabase
      .from('agentoffice_projects')
      .update({ value: total, updated_at: new Date().toISOString() })
      .eq('id', updated.project_id)
  }

  // Log the edit as a revision
  if (updated?.project_id) {
    const settings = await getSettings()
    await addRevision({
      project_id: updated.project_id,
      icon: 'edit',
      color: DOC_META[type].color,
      title: `แก้ไข${DOC_META[type].label}`,
      doc_id: updated.number || null,
      doc_color: DOC_META[type].color,
      detail: updated.number ? `${updated.number}` : null,
      user_name: settings.short_name || 'เจ้าของ',
      user_initial: (settings.short_name || 'ธ').charAt(0),
      user_color: DOC_META[type].color,
    })
  }

  return { total, updated }
}

/* ---------------------------------------------------------------- create project */

async function nextProjectCode() {
  const year = new Date().getFullYear()
  const { data, error } = await supabase
    .from('agentoffice_projects')
    .select('code')
    .like('code', `P-${year}-%`)
  if (error) throw error
  const max = (data || []).reduce((m, r) => {
    const n = parseInt(String(r.code).split('-')[2], 10)
    return Math.max(m, Number.isNaN(n) ? 0 : n)
  }, 0)
  return `P-${year}-${String(max + 1).padStart(3, '0')}`
}

// Create a brand-new job: resolve/create the customer, insert the project,
// then issue its first quotation (QT) from the line items.
export async function createProject({ customer, name, description, items }) {
  let customerId = customer?.id || null
  let customerName = customer?.name || ''
  if (!customerId && customer?.name) {
    const c = await saveCustomer({
      name: customer.name,
      contact_name: customer.contact_name || null,
      phone: customer.phone || null,
      email: customer.email || null,
    })
    customerId = c.id
    customerName = c.name
  }

  const settings = await getSettings()
  const code = await nextProjectCode()
  const cleanItems = (items || []).filter((it) => it.desc)
  const total = itemsTotal(toItems(cleanItems))

  // Claim this job's running number now and store it on the project so every
  // document in the chain (QT/DN/INV/RC) reuses the same number.
  const no = settings.next_no || 9

  const { data: project, error } = await supabase
    .from('agentoffice_projects')
    .insert({
      code,
      name: name || 'งานใหม่',
      customer_id: customerId,
      value: total,
      status: 'กำลังทำ',
      description: description || null,
      current_step: 1,
      doc_no: no,
      start_date: new Date().toISOString().slice(0, 10),
      managers: settings.short_name || null,
    })
    .select()
    .single()
  if (error) throw error

  await supabase.from('agentoffice_settings').update({ next_no: no + 1 }).eq('id', 1)

  let quotation = null
  if (cleanItems.length) {
    const res = await createDocument({
      type: 'QT',
      project: { uuid: project.id, customerId, client: customerName, value: total, id: code },
      items: cleanItems,
    })
    quotation = res.number
  }
  return { code, uuid: project.id, quotation }
}

/* ---------------------------------------------------------------- lifecycle actions */

async function ownerStamp() {
  const s = await getSettings()
  return { user_name: s.short_name || 'เจ้าของ', user_initial: (s.short_name || 'ธ').charAt(0), user_color: '#0E8F7A' }
}

export async function advanceProject(uuid, { status, step }) {
  const { error } = await supabase
    .from('agentoffice_projects')
    .update({ status, current_step: step, updated_at: new Date().toISOString() })
    .eq('id', uuid)
  if (error) throw error
}

// Customer accepted the quotation → work begins
export async function acceptQuotation(project) {
  const { data: q } = await supabase
    .from('agentoffice_quotations').select('id').eq('project_id', project.uuid).limit(1).maybeSingle()
  if (q) await supabase.from('agentoffice_quotations').update({ status: 'accepted' }).eq('id', q.id)
  await advanceProject(project.uuid, { status: 'กำลังทำ', step: 3 })
  await addRevision({ project_id: project.uuid, icon: 'check', color: '#1E8A4B', title: 'ลูกค้าตอบรับข้อเสนอ', detail: project.client, ...(await ownerStamp()) })
}

// Development finished, ready to deliver
export async function markDeveloped(project) {
  await advanceProject(project.uuid, { status: 'กำลังทำ', step: 4 })
  await addRevision({ project_id: project.uuid, icon: 'check', color: '#0E8F7A', title: 'พัฒนางานเสร็จ พร้อมส่งมอบ', detail: project.name, ...(await ownerStamp()) })
}

// Record money received → closes the job
export async function recordPayment(project, { amount, date, method = 'transfer', ref = '' }) {
  const { data: inv } = await supabase
    .from('agentoffice_invoices').select('id').eq('project_id', project.uuid).limit(1).maybeSingle()
  if (!inv) throw new Error('ยังไม่มีใบแจ้งหนี้สำหรับงานนี้ — ออกใบแจ้งหนี้ก่อน')
  const { error } = await supabase.from('agentoffice_payments').insert({
    invoice_id: inv.id, amount: Number(amount) || 0,
    paid_date: date || new Date().toISOString().slice(0, 10), method, ref: ref || null,
  })
  if (error) throw error
  await supabase.from('agentoffice_invoices').update({ status: 'paid' }).eq('id', inv.id)
  await advanceProject(project.uuid, { status: 'ปิดงาน', step: 7 })
  await addRevision({
    project_id: project.uuid, icon: 'check', color: '#1E8A4B', title: 'รับเงิน',
    doc_id: `฿${(Number(amount) || 0).toLocaleString()}`, doc_color: '#1E8A4B',
    detail: `งาน ${project.name}`, ...(await ownerStamp()),
  })
}

// Update basic project fields (rename, value, dates)
export async function updateProject(uuid, patch) {
  const { error } = await supabase
    .from('agentoffice_projects')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', uuid)
  if (error) throw error
}

// Delete a project and everything attached to it
export async function deleteProject(uuid) {
  const { data: invs } = await supabase.from('agentoffice_invoices').select('id').eq('project_id', uuid)
  const invIds = (invs || []).map((i) => i.id)
  if (invIds.length) await supabase.from('agentoffice_payments').delete().in('invoice_id', invIds)
  await supabase.from('agentoffice_invoices').delete().eq('project_id', uuid)
  await supabase.from('agentoffice_delivery_notes').delete().eq('project_id', uuid)
  await supabase.from('agentoffice_quotations').delete().eq('project_id', uuid)
  await supabase.from('agentoffice_revisions').delete().eq('project_id', uuid)
  await supabase.from('agentoffice_attachments').delete().eq('deal_id', uuid)
  const { error } = await supabase.from('agentoffice_projects').delete().eq('id', uuid)
  if (error) throw error
}

/* ---------------------------------------------------------------- dashboard */

export async function getDashboard() {
  const [projects, docs] = await Promise.all([getProjects(), fetchAllDocs()])
  const isOpen = (p) => p.status !== 'ปิดงาน'

  // Counts / open projects stay derived from project status
  const waiting = projects.filter((p) => ['รอชำระ', 'รอตอบรับ'].includes(p.status))
  const review = projects.filter((p) => p.status === 'รอตรวจรับ')
  const active = projects.filter((p) => p.status === 'กำลังทำ')

  // Real money figures from the actual documents / payments
  const quoted = docs.qt.reduce((s, d) => s + itemsTotal(d.items), 0)
  const receivable = docs.inv
    .filter((d) => d.status !== 'paid')
    .reduce((s, d) => s + itemsTotal(d.items), 0)
  const collected = docs.pay.reduce((s, p) => s + Number(p.amount || 0), 0)

  return {
    projects,
    openProjects: projects.filter(isOpen),
    counts: { active: active.length, waiting: waiting.length, review: review.length },
    receivable,
    revenue: { quoted, receivable, collected },
  }
}
