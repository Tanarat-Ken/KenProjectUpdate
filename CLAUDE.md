# CLAUDE.md

## อ่าน README ก่อนเสมอ (READ THIS FIRST)

ก่อนเริ่มงานใด ๆ ในโปรเจกต์นี้ **ให้อ่าน [`README.md`](./README.md) ทั้งไฟล์ก่อนเสมอ**
README คือแหล่งความจริงเรื่อง tech stack, โครงสร้างโค้ด, โครงฐานข้อมูล Supabase และวิธีรัน
อย่าเดาโครงสร้างจากความจำ — เปิด README ทุกครั้งที่เริ่ม session ใหม่

## ภาพรวมโปรเจกต์

Agent Office — เว็บแอป React + Vite เชื่อม Supabase สำหรับจัดการงานและเอกสารธุรกิจ
(ใบเสนอราคา → ใบส่งงาน → ใบแจ้งหนี้ → รับเงิน) ของฟรีแลนซ์สาย RPA

## กฎการทำงาน

- **ข้อมูลทั้งหมดอยู่ใน Supabase** — ห้ามใส่ mock data กลับเข้ามาในโค้ด ทุกหน้าโหลดผ่าน `src/lib/api.js`
- เพิ่ม data-access ใหม่ ให้ไปไว้ใน `src/lib/api.js` (map DB ↔ UI ที่นี่ที่เดียว)
- ตาราง Supabase ใช้ prefix `agentoffice_` เสมอ (มีตารางอื่นในโปรเจกต์เดียวกัน อย่าไปยุ่ง)
- ใช้ดีไซน์/สีจาก `src/theme.js` และฟอนต์ Sarabun + Space Grotesk ให้สอดคล้องของเดิม
- วันที่แสดงเป็นปี พ.ศ. ผ่าน helper ใน `src/lib/format.js`
- หลังแก้โค้ด ให้รัน `npm run build` ตรวจว่า build ผ่าน
- หลังแก้ schema ให้เรียก Supabase advisors ตรวจ security/performance

## คำสั่งที่ใช้บ่อย

```bash
npm run dev      # dev server
npm run build    # production build (ใช้ตรวจ error)
```
