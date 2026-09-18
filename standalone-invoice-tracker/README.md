# Invoice Track Pro (Standalone Application)

A dedicated, enterprise-grade Gate-to-Ledger Invoice Tracking application decoupled from the Virtual CFO Suite.

## Overview

Invoice Track Pro manages the entire life cycle of physical and digital vendor invoices across manufacturing and corporate setups. It enforces a strict **48-hour (2-day) maximum dwell SLA** per department stage and supports all 4 enterprise expenditure categories:
- **Fabric** (Raw material textile consignments)
- **Job Work External** (Outside processing, dyeing, printing, sub-contracting)
- **Job Work Internal** (In-house assembly, machinery overhaul, internal engineering)
- **Admin / Utility** (Freight, security, logistics, IT, factory power)

## The 6-Stage Pipeline

1. **Gate Receipt (Security Guard)**
   - Live camera photo capture & physical barcode/gate-pass registration
   - AI OCR data extraction (Vendor Name, Invoice No, GSTIN, PO No, Taxable & Total Amount)
   - Gate Entry Number stamping
2. **GRN & Quality Check Dept**
   - Goods Received Note (GRN) logging
   - QC status (Approved / Partially Accepted / Rejected)
3. **ERP Person Entry**
   - SAP / Tally ERP voucher creation
   - 3-Way matching verification (PO vs. GRN vs. Invoice)
4. **Account Head Approval**
   - Finance head sign-off
   - MSME priority & payment terms tagging
5. **In Accounts for Booking**
   - Financial ledger allocation
   - Booking voucher generation
6. **Booked & Scheduled in Ledger**
   - Final posting & bank payment disbursement scheduling

## Quick Start (How to Run Standalone)

```bash
# Navigate to this folder
cd standalone-invoice-tracker

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be live at `http://localhost:3001` (or your assigned Vite port).

## Project Structure

```
standalone-invoice-tracker/
├── package.json
├── vite.config.ts
├── index.html
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── context/
    │   └── InvoiceContext.tsx
    ├── data/
    │   └── mockInvoices.ts
    └── components/
        ├── InvoiceTrackingTab.tsx
        ├── GuardInvoiceScannerModal.tsx
        ├── StageTransitionModal.tsx
        └── InvoiceDetailModal.tsx
```
