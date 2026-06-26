
'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { fmt, fmtNum, categoryBadge } from '@/lib/utils'
import { MetricCard } from '@/components/ui/MetricCard'
import { CostPieChart } from '@/components/charts/CostPieChart'
import { MaterialBarChart } from '@/components/charts/MaterialBarChart'
import { exportToExcel, exportToCSV } from '@/lib/excelExport'
import type { MaterialCalculation } from '@/lib/types'
import { FileText, Calculator, TrendingUp, Package, Layers, Search, ArrowUpDown, Download, FileSpreadsheet, AlertCircle, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortKey = 'material'|'category'|'totalQuantity'|'rate'|'totalCost'

export default function ReportsPage() {
  const { currentResult, saveProject } = useAppStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('totalCost')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [exporting, setExporting] = useState(false)
  const [expandedCalc, setExpandedCalc] = useState<string|null>(null)

  function handleSort(k: SortKey) {
    if (k===sortKey) setSortDir(d=>d==='asc'?'desc':'asc')
    else { setSortKey(k); setSortDir('desc') }
  }

  const filteredItems = useMemo(() => {
    if (!currentResult) return []
    let items = currentResult.calculations.filter(it =>
      it.material.toLowerCase().includes(search.toLowerCase()) ||
      it.category.toLowerCase().includes(search.toLowerCase())
    )
    items = [...items].sort((a,b) => {
      const av = a[sortKey] as string|number
      const bv = b[sortKey] as string|number
      const cmp = av<bv?-1:av>bv?1:0
      return sortDir==='asc'?cmp:-cmp
    })
    return items
  }, [currentResult, search, sortKey, sortDir])

  async function handleExcel() {
    if (!currentResult) return
    setExporting(true)
    try { await exportToExcel(currentResult) } finally { setExporting(false) }
  }

  if (!currentResult) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <FileText className="h-7 w-7 text-gray-400"/>
      </div>
      <h2 className="h2 mb-2">No report available</h2>
      <p className="body-text text-gray-500 max-w-sm mb-5">Run an estimate first to generate a detailed material cost report.</p>
      <Link href="/estimate" className="btn-primary"><Calculator className="h-4 w-4"/>Create estimate</Link>
    </div>
  )

  const r = currentResult
  const c = r.currency

  const SortTh = ({ label, field }: { label: string; field: SortKey }) => (
    <th className="table-header cursor-pointer select-none hover:text-gray-900 whitespace-nowrap" onClick={()=>handleSort(field)}>
      <span className="inline-flex items-center gap-1">{label}<ArrowUpDown className={cn('h-3 w-3',sortKey===field?'text-brand':'text-gray-300')}/></span>
    </th>
  )

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="h2">{r.projectName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{r.method} · {fmtNum(r.area,0)} sq ft · {r.floors} floor{r.floors>1?'s':''} · {r.buildingType} · {r.date}</p>
          {r.clientName && <p className="text-xs text-gray-400">Client: {r.clientName}{r.location?' · '+r.location:''}</p>}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Link href="/drivers" className="btn-ghost text-xs"><SlidersHorizontal className="h-3.5 w-3.5"/>View drivers</Link>
          <button className="btn-secondary" onClick={()=>exportToCSV(r)}><FileSpreadsheet className="h-4 w-4"/>CSV</button>
          <button className="btn-primary" onClick={handleExcel} disabled={exporting}><Download className="h-4 w-4"/>{exporting?'Exporting...':'Export Excel (6 sheets)'}</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Grand Total" value={fmt(r.summary.grandTotal,c)} valueColor="text-brand" icon={TrendingUp}/>
        <MetricCard label="Material Cost" value={fmt(r.summary.materialCost,c)} icon={Package}/>
        <MetricCard label="Labor Cost" value={fmt(r.summary.laborCost,c)} icon={Layers} iconBg="bg-gray-100" iconColor="text-gray-600"/>
        <MetricCard label="Contingency" value={fmt(r.summary.contingencyCost,c)} icon={AlertCircle} iconBg="bg-amber-50" iconColor="text-amber-600"/>
        <MetricCard label={`Tax (${r.settings.taxRate}%)`} value={fmt(r.summary.taxAmount,c)} icon={Calculator} iconBg="bg-gray-100" iconColor="text-gray-500"/>
      </div>

      {/* Material table with expandable calc tree */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <p className="h3 flex-1">Material quantities & costs</p>
          <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"/>
            <input className="input-field pl-8 text-xs w-48" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr>
              <SortTh label="Material" field="material"/>
              <SortTh label="Category" field="category"/>
              <SortTh label="Total Qty" field="totalQuantity"/>
              <th className="table-header">Unit</th>
              <SortTh label="Unit Rate" field="rate"/>
              <SortTh label="Total Cost" field="totalCost"/>
              <th className="table-header">Calculation</th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredItems.map(it=>(
                <>
                <tr key={it.material} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-semibold text-gray-900 whitespace-nowrap">{it.material}</td>
                  <td className="table-cell"><span className={cn('badge',categoryBadge(it.category))}>{it.category}</span></td>
                  <td className="table-cell-num">{fmtNum(it.totalQuantity,1)}</td>
                  <td className="table-cell text-xs text-gray-400">{it.unit}</td>
                  <td className="table-cell-num">{c}{fmtNum(it.rate)}</td>
                  <td className="table-cell-num font-semibold text-gray-900">{fmt(it.totalCost,c)}</td>
                  <td className="table-cell">
                    <button onClick={()=>setExpandedCalc(expandedCalc===it.material?null:it.material)}
                      className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                      {expandedCalc===it.material?<><ChevronUp className="h-3 w-3"/>Hide</>:<><ChevronDown className="h-3 w-3"/>Show</>}
                    </button>
                  </td>
                </tr>
                {expandedCalc===it.material&&(
                  <tr key={`${it.material}-calc`}>
                    <td colSpan={7} className="px-5 py-4 bg-orange-50/30 border-b border-orange-100">
                      <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-3">Calculation breakdown — {it.material}</p>
                      <div className="space-y-2">
                        {it.steps.map((step,i)=>(
                          <div key={i} className="flex items-start gap-4 text-xs">
                            <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                            <div className="flex-1">
                              <span className="font-medium text-gray-700">{step.label}</span>
                              <span className="text-gray-400 mx-2">—</span>
                              <span className="font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">{step.formula}</span>
                            </div>
                            <span className="numeric font-semibold text-gray-900 whitespace-nowrap">{fmtNum(step.value,2)} {step.unit}</span>
                          </div>
                        ))}
                        <div className="flex items-start gap-4 text-xs mt-1 pt-2 border-t border-orange-200">
                          <span className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[10px] flex-shrink-0">+</span>
                          <div className="flex-1"><span className="font-medium text-gray-700">Waste added</span><span className="text-gray-400 mx-2">—</span><span className="font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">Base qty × {r.settings.wasteFactor}%</span></div>
                          <span className="numeric font-semibold text-gray-900">+{fmtNum(it.wasteQuantity,2)} {it.unit}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs bg-white rounded-lg border border-gray-200 px-3 py-2 mt-1">
                          <span className="font-bold text-gray-900 flex-1">Total: {fmtNum(it.totalQuantity,2)} {it.unit} × {c}{fmtNum(it.rate)} = <span className="text-brand">{fmt(it.totalCost,c)}</span></span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={5} className="px-4 py-2.5 text-sm font-semibold text-gray-900 text-right">Material subtotal (incl. waste)</td>
                <td className="px-4 py-2.5 text-sm font-bold numeric" style={{color:'#C65911'}}>{fmt(r.summary.materialCost,c)}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-padded"><p className="section-label">Cost distribution</p><CostPieChart items={r.calculations} currency={c}/></div>
        <div className="card-padded"><p className="section-label">Top 8 materials by cost</p><MaterialBarChart items={r.calculations} currency={c}/></div>
      </div>

      {/* Cost breakdown */}
      <div className="card-padded">
        <p className="section-label">Full cost breakdown</p>
        <div className="space-y-3">
          {[
            { label:'Material cost (incl. waste)', value:r.summary.materialCost },
            { label:'Labor cost', value:r.summary.laborCost },
            { label:`Contingency (${r.settings.contingency}%)`, value:r.summary.contingencyCost },
            { label:`Tax (${r.settings.taxRate}%)`, value:r.summary.taxAmount },
          ].map(({ label, value }) => {
            const pct = r.summary.grandTotal>0?value/r.summary.grandTotal:0
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="w-40 text-xs text-gray-600 flex-shrink-0">{label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${(pct*100).toFixed(1)}%`,background:'#C65911'}}/>
                </div>
                <div className="w-28 text-right text-sm font-semibold numeric text-gray-900">{fmt(value,c)}</div>
                <div className="w-10 text-right text-xs text-gray-400 numeric">{(pct*100).toFixed(1)}%</div>
              </div>
            )
          })}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
            <div className="w-40 text-sm font-bold text-gray-900">Grand total</div>
            <div className="flex-1"/>
            <div className="w-28 text-right text-lg font-bold numeric" style={{color:'#C65911'}}>{fmt(r.summary.grandTotal,c)}</div>
            <div className="w-10 text-right text-xs font-medium text-gray-500">100%</div>
          </div>
        </div>
      </div>

      {/* Room breakdown */}
      {r.rooms && r.rooms.length>0 && (
        <div className="card overflow-hidden">
          <p className="px-5 py-4 section-label border-b border-gray-100">Room breakdown</p>
          <table className="min-w-full">
            <thead><tr>{['Room','Shape','Floor Area','Wall Area','Ceiling Area','Perimeter','Volume'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {r.rooms.map(room=>(
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-900">{room.name}</td>
                  <td className="table-cell"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{room.geometry.shape}</span></td>
                  <td className="table-cell-num">{fmtNum(room.computed.floorArea,1)} sq ft</td>
                  <td className="table-cell-num">{fmtNum(room.computed.wallArea,1)} sq ft</td>
                  <td className="table-cell-num">{fmtNum(room.computed.ceilingArea,1)} sq ft</td>
                  <td className="table-cell-num">{fmtNum(room.computed.perimeter,1)} ft</td>
                  <td className="table-cell-num">{fmtNum(room.computed.volume,1)} cu ft</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="table-cell" colSpan={2}>Total</td>
                <td className="table-cell-num font-bold">{fmtNum(r.rooms.reduce((s,rm)=>s+rm.computed.floorArea,0),1)} sq ft</td>
                <td className="table-cell-num font-bold">{fmtNum(r.rooms.reduce((s,rm)=>s+rm.computed.wallArea,0),1)} sq ft</td>
                <td colSpan={3}/>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
