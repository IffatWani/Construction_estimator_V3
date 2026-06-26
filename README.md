# Construction Cost Estimator — Enterprise v2

A professional construction material cost estimation platform built with Next.js 15.

## Features

### Core Estimation
- **Area Based** — Input total sq ft, floors, quality, structure type
- **Layout Based** — Room-by-room geometry builder with 4 shapes (Rectangle, Square, Circle, L-Shape)
- **16 materials** — Cement, steel, sand, tiles, paint, MEP, fixtures and more
- **Transparent calculations** — Every formula shown step-by-step, expandable in reports

### Material Repository
- Add / edit / archive / delete materials
- Bulk import via Excel or CSV template
- Rate history tracking with sparkline trends
- Supplier and notes fields

### Reports & Export
- Sortable, searchable material table
- Expandable calculation tree per material
- 6-sheet Excel export: Summary, Rooms, Quantities, Rates, Detailed Calculations, Assumptions
- CSV export

### Projects
- Auto-save on every estimate run
- Revision / version history
- Duplicate, archive, delete projects
- Project metadata: client, location, type, status

### Dashboard
- Portfolio metrics (total projects, avg cost, active)
- AI insights (anomaly detection on quantities and rates)
- Cost distribution pie chart
- Top materials bar chart

### Settings
- Waste factor, contingency, tax rate
- Labor rates (structural + finishing)
- Quality multipliers (Economy / Standard / Premium)
- Currency selector

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Helvetica Neue |
| State | Zustand (localStorage persistence) |
| Charts | Recharts |
| Export | SheetJS (xlsx) |
| Icons | Lucide React |

## Brand

- Primary: `#C65911` (Brown)
- Secondary: `#808080` (Grey)
- Background: `#FFFFFF`
- Typography: Helvetica Neue (Bold/Medium/Regular) + Meta-Normal for numerics

## Quick Start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm run start
```

## Deploy to Vercel

Push to GitHub → vercel.com → New Project → Import → Deploy (no env vars needed).
