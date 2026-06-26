import type { EstimationResult } from './types'

export async function exportToExcel(result: EstimationResult): Promise<void> {
  const XLSX = (await import('xlsx')).default
  const wb = XLSX.utils.book_new()
  const c = result.currency

  const fmt = (n: number) => `${c}${Math.round(n).toLocaleString('en-IN')}`
  const r = result

  // Sheet 1 – Project Summary
  const s1 = [
    ['CONSTRUCTION MATERIAL COST ESTIMATOR',''],
    ['',''],
    ['PROJECT SUMMARY',''],
    ['Project Name', r.projectName],
    ['Client', r.clientName ?? '—'],
    ['Location', r.location ?? '—'],
    ['Date', r.date],
    ['Method', r.method],
    ['Building Type', r.buildingType],
    ['Total Area', `${r.area.toFixed(0)} sq ft`],
    ['Floors', r.floors],
    ['',''],
    ['COST BREAKDOWN',''],
    ['Material Cost', fmt(r.summary.materialCost)],
    ['Labor Cost',    fmt(r.summary.laborCost)],
    ['Contingency',   fmt(r.summary.contingencyCost)],
    ['Tax',           fmt(r.summary.taxAmount)],
    ['GRAND TOTAL',   fmt(r.summary.grandTotal)],
    ['',''],
    ['Cost per sq ft', fmt(r.area > 0 ? r.summary.grandTotal / r.area : 0)],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(s1)
  ws1['!cols'] = [{ wch: 28 }, { wch: 24 }]
  XLSX.utils.book_append_sheet(wb, ws1, '1. Project Summary')

  // Sheet 2 – Room Summary (layout based)
  if (r.rooms && r.rooms.length > 0) {
    const hdr = ['Room Name', 'Shape', 'Floor Area (sq ft)', 'Wall Area (sq ft)', 'Ceiling Area (sq ft)', 'Volume (cu ft)', 'Perimeter (ft)']
    const rows = r.rooms.map(rm => [rm.name, rm.geometry.shape, rm.computed.floorArea.toFixed(1), rm.computed.wallArea.toFixed(1), rm.computed.ceilingArea.toFixed(1), rm.computed.volume.toFixed(1), rm.computed.perimeter.toFixed(1)])
    const totalRow = ['TOTAL','',r.rooms.reduce((s,rm)=>s+rm.computed.floorArea,0).toFixed(1),r.rooms.reduce((s,rm)=>s+rm.computed.wallArea,0).toFixed(1),'','','']
    const ws2 = XLSX.utils.aoa_to_sheet([hdr, ...rows, totalRow])
    ws2['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws2, '2. Room Summary')
  }

  // Sheet 3 – Material Quantities
  const hdr3 = ['Material', 'Category', 'Base Qty', 'Waste Qty', 'Total Qty', 'Unit']
  const rows3 = r.calculations.map(c => [c.material, c.category, c.baseQuantity, Math.round(c.wasteQuantity * 100)/100, Math.round(c.totalQuantity * 100)/100, c.unit])
  const ws3 = XLSX.utils.aoa_to_sheet([hdr3, ...rows3])
  ws3['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws3, '3. Material Quantities')

  // Sheet 4 – Material Rates & Costs
  const hdr4 = ['Material', 'Unit', 'Unit Rate', 'Base Cost', 'Waste Cost', 'Total Cost']
  const rows4 = r.calculations.map(c => [c.material, c.unit, `${c}${c.rate}`, fmt(c.baseCost), fmt(c.wasteCost), fmt(c.totalCost)])
  const rows4b = r.calculations.map(c => [c.material, c.unit, c.rate, Math.round(c.baseCost), Math.round(c.wasteCost), Math.round(c.totalCost)])
  const ws4 = XLSX.utils.aoa_to_sheet([hdr4, ...rows4b])
  ws4['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws4, '4. Material Rates')

  // Sheet 5 – Detailed Calculations
  const hdr5 = ['Material', 'Step', 'Formula', 'Value', 'Unit']
  const rows5: (string | number)[][] = []
  r.calculations.forEach(c => {
    c.steps.forEach((step, i) => {
      rows5.push([i === 0 ? c.material : '', step.label, step.formula, step.value, step.unit])
    })
    rows5.push(['', 'Waste added', `Base × ${r.settings.wasteFactor}%`, Math.round(c.wasteQuantity * 100)/100, c.unit])
    rows5.push(['', 'TOTAL QTY', '', Math.round(c.totalQuantity * 100)/100, c.unit])
    rows5.push(['', 'TOTAL COST', `${Math.round(c.totalQuantity * 100)/100} × ${c.rate}`, Math.round(c.totalCost), result.currency])
    rows5.push(['', '', '', '', ''])
  })
  const ws5 = XLSX.utils.aoa_to_sheet([hdr5, ...rows5])
  ws5['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 40 }, { wch: 14 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws5, '5. Detailed Calculations')

  // Sheet 6 – Assumptions
  const s = r.settings
  const ws6 = XLSX.utils.aoa_to_sheet([
    ['Assumption', 'Value', 'Notes'],
    ['Waste Factor', `${s.wasteFactor}%`, 'Applied to all material quantities'],
    ['Contingency', `${s.contingency}%`, 'Applied on material + labor subtotal'],
    ['Tax Rate', `${s.taxRate}%`, 'GST / applicable tax'],
    ['Labor – Structural', `${s.laborStructuralPct}%`, 'As % of material cost'],
    ['Labor – Finishing', `${s.laborFinishingPct}%`, 'As % of material cost'],
    ['Quality – Economy', s.qualityMultipliers.Economy, 'Quantity multiplier'],
    ['Quality – Standard', s.qualityMultipliers.Standard, 'Quantity multiplier'],
    ['Quality – Premium', s.qualityMultipliers.Premium, 'Quantity multiplier'],
    ['', '', ''],
    ['Standard Ratios (per 1000 sq ft)', '', ''],
    ['Cement', '400 bags', 'IS:456 reference'],
    ['Sand', '1800 cu ft', 'Standard mix ratio'],
    ['Aggregate', '2200 cu ft', 'Standard mix ratio'],
    ['Steel', '4000 kg', 'RCC framed structure'],
    ['Bricks', '8000 nos', '9-inch wall'],
    ['Concrete', '120 cu m', 'Including footings and slabs'],
  ])
  ws6['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 36 }]
  XLSX.utils.book_append_sheet(wb, ws6, '6. Assumptions')

  XLSX.writeFile(wb, `${r.projectName.replace(/\s+/g,'_')}_Estimate.xlsx`)
}

export function exportToCSV(result: EstimationResult): void {
  const c = result.currency
  const hdr = ['Material','Category','Base Qty','Waste Qty','Total Qty','Unit','Unit Rate','Total Cost']
  const rows = result.calculations.map(it => [
    it.material, it.category,
    it.baseQuantity, Math.round(it.wasteQuantity*100)/100, Math.round(it.totalQuantity*100)/100,
    it.unit, `${c}${it.rate}`, `${c}${Math.round(it.totalCost)}`,
  ])
  const csv = [hdr, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${result.projectName.replace(/\s+/g,'_')}_Estimate.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportDriversToExcel(drivers: Record<string, import('./quantityDrivers').QuantityDriver>): Promise<void> {
  const XLSX = (await import('xlsx')).default
  const wb = XLSX.utils.book_new()

  const hdr = ['Driver ID','Material','Parameter Name','Symbol','Value','Unit','Type','Modified','Min','Max','Description','Source']
  const rows = Object.values(drivers).map(d => [
    d.id, d.material, d.paramName, d.symbol, d.value, d.unit,
    d.valueType, d.isDefault ? 'Default' : 'Modified',
    d.min, d.max, d.description, d.source
  ])

  const ws = XLSX.utils.aoa_to_sheet([hdr, ...rows])
  ws['!cols'] = [
    {wch:30},{wch:15},{wch:28},{wch:10},{wch:10},{wch:18},
    {wch:12},{wch:10},{wch:8},{wch:8},{wch:50},{wch:60}
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Quantity Drivers')
  XLSX.writeFile(wb, 'quantity_drivers.xlsx')
}
