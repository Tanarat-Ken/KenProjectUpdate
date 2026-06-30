# Agent Office

ระบบจัดการเอกสารธุรกิจสำหรับฟรีแลนซ์สาย RPA — จัดการงาน (โปรเจกต์) และเอกสารเป็นสายเดียวกัน:

> ใบเสนอราคา (QT) → ใบส่งงาน (DN) → ใบแจ้งหนี้ (INV) → รับเงิน / ใบเสร็จ (RC)

เว็บแอป React (Vite) เชื่อมต่อกับ **Supabase** เป็นฐานข้อมูลจริง

---

## Tech stack

- **React 18 + Vite 6** — single-page app, inline-style design system (ดู `src/theme.js`)
- **Supabase** (Postgres + Storage) — ข้อมูลทั้งหมด: งาน, ลูกค้า, เอกสาร, ไฟล์แนบ, ประวัติแก้ไข, การตั้งค่า
- ฟอนต์: Sarabun (ไทย/เนื้อหา) + Space Grotesk (ตัวเลข/เลขเอกสาร)

## เริ่มใช้งาน (local)

```bash
npm install
cp .env.example .env   # ใส่ค่า Supabase URL + publishable key
npm run dev            # http://localhost:5173
npm run build          # production build → dist/
```

### Environment variables

| ตัวแปร | ความหมาย |
| --- | --- |
| `VITE_SUPABASE_URL` | URL ของ Supabase project |
| `VITE_SUPABASE_ANON_KEY` | publishable / anon key (ปลอดภัยที่จะเปิดเผยฝั่ง client) |

ถ้าไม่ตั้ง env ไว้ โค้ดมี fallback เป็นค่าของ project `glbndfloqirjjoqfjdlw` ใน `src/lib/supabase.js`

## โครงสร้างโค้ด

```
src/
  App.jsx              Router อย่างง่าย (state-based) + SettingsProvider
  theme.js             ระบบสี / การ์ด / สถานะ
  lib/
    supabase.js        Supabase client
    api.js             Data-access layer ทั้งหมด (map DB ↔ UI)
    format.js          ฟอร์แมตวันที่ไทย (พ.ศ.) / เงินบาท
    settings.jsx       Context ของการตั้งค่า + useOwner()
    useAsync.js        hook โหลดข้อมูล (loading/error/reload)
  components/          Sidebar, Pipeline, StatusBadge, FileViewer, Markdown, States…
  screens/
    Dashboard.jsx      ภาพรวม: งานค้าง/รอ/รีวิว + เงินรอเก็บ + กิจกรรมล่าสุด
    ProjectsList.jsx   ตารางงานทั้งหมด + pipeline ย่อ + ค้นหา/กรอง
    ProjectDetail.jsx  4 แท็บ: ภาพรวม+ขั้นตอน / เอกสาร / ไฟล์&คอนเซป / ประวัติแก้ไข
    DocumentsList.jsx  เอกสารทุกใบข้ามงาน
    FlowDiagram.jsx    แผนผังโฟลว์ 7 ขั้น — งานอยู่ขั้นไหน + ต้องไปทำที่เมนูไหน
    FilesList.jsx      คลังไฟล์ .md/.html + viewer + อัปโหลด
    ClientsList.jsx    ลูกค้า (เพิ่ม/แก้ไข/ลบ)
    DocumentWizard.jsx สร้างเอกสารจริง (เลือกงาน→รายการ→เงื่อนไข→ออก)
    Settings.jsx       แก้ config ผู้ออกเอกสาร/บัญชี/เลขรัน — บันทึกลง DB
    PartnerMode.jsx    โหมดผู้ช่วย (แฟน) — งานที่รอช่วยแบบง่าย
```

## โครงฐานข้อมูล (Supabase, prefix `agentoffice_`)

| ตาราง | หน้าที่ |
| --- | --- |
| `agentoffice_projects` | **แกนกลาง** — งาน/ดีล (ลูกค้า, ชื่องาน, มูลค่า, สถานะ, step) |
| `agentoffice_customers` | ลูกค้า (ใช้ซ้ำข้ามงาน) |
| `agentoffice_quotations` / `_delivery_notes` / `_invoices` | เอกสารในสายโซ่ ผูกกับ `project_id` |
| `agentoffice_payments` | การรับเงิน (= ใบเสร็จ RC) |
| `agentoffice_revisions` | ประวัติแก้ไข / กิจกรรมต่อโปรเจกต์ |
| `agentoffice_attachments` | ไฟล์แนบ (`deal_id` = project id) เก็บไฟล์จริงใน Storage bucket `agentoffice-files` |
| `agentoffice_settings` | การตั้งค่าผู้ออกเอกสาร (singleton row id=1) + เลขรันร่วม `next_no` |
| `agentoffice_item_catalog` | คลังรายการที่เคยใช้ (ชื่อ + ราคา) ไว้กดเลือกซ้ำตอนสร้างเอกสาร |

> RLS เปิดให้ `anon` เข้าถึงได้ (ออกแบบสำหรับผู้ใช้คนเดียว — เจ้าของ + ผู้ช่วย ไม่มีระบบ login)

## หมายเหตุการพัฒนา

- **เลขเอกสาร = เลขรันนิ่งเดียวต่อ 1 งาน** เก็บที่ `agentoffice_projects.doc_no` — เปลี่ยนเฉพาะ prefix ตามชนิดเอกสาร (เช่น งาน 009 → `QT-009` / `DN-009` / `INV-009` / `RC-009`). เลขถัดไปของงานใหม่อยู่ที่ `agentoffice_settings.next_no` (แก้ได้ในหน้า “ตั้งค่า”)
- รายการในเอกสารมี `qty` (จำนวน, ดีฟอลต์ 1) × `unit_price` (ราคา/หน่วย) = ยอดต่อรายการ; รายการที่เคยใช้ถูกจำไว้ใน `agentoffice_item_catalog` เพื่อกดเลือกซ้ำได้
- การสร้างเอกสารผ่าน Wizard จะบันทึกจริง, อัปเดตสถานะ/step ของงาน และเพิ่มรายการใน `agentoffice_revisions`
- ฟอร์แมตวันที่ใช้ปี พ.ศ. (ดู `src/lib/format.js`)
- ดีไซน์อ้างอิงจาก prototype เดิมใน `project/` และ transcript ใน `chats/`
