'use client'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { fmt, fmtNum } from '@/lib/utils'
import { MetricCard } from '@/components/ui/MetricCard'
import { CostPieChart } from '@/components/charts/CostPieChart'
import { MaterialBarChart } from '@/components/charts/MaterialBarChart'
import { Calculator, TrendingUp, Package, Layers, ArrowRight, FolderOpen, AlertTriangle, Info, X, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { currentResult, projects, insights, dismissInsight, currency, repository } = useAppStore()
  const totalProjects = projects.length
  const avgCost = projects.length > 0
    ? projects.reduce((s,p) => s + (p.currentResult?.summary.grandTotal ?? 0), 0) / projects.length
    : 0
  const activeProjects = projects.filter(p => p.metadata.status === 'Active').length

  return (
    <div className="max-w-7xl space-y-6">
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.slice(0,3).map(ins => (
            <div key={ins.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${ins.severity==='error'?'bg-red-50 border-red-200':ins.severity==='warning'?'bg-amber-50 border-amber-200':'bg-blue-50 border-blue-100'}`}>
              {ins.severity==='error'?<AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5"/>:ins.severity==='warning'?<AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5"/>:<Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5"/>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{ins.material} — {ins.message}</p>
                <p className="text-xs text-gray-600 mt-0.5">{ins.detail}</p>
              </div>
              <button onClick={() => dismissInsight(ins.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="h-4 w-4"/></button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="section-label">Portfolio overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Projects" value={fmtNum(totalProjects)} icon={FolderOpen}/>
          <MetricCard label="Active Projects" value={fmtNum(activeProjects)} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50"/>
          <MetricCard label="Avg Project Cost" value={avgCost>0?fmt(avgCost,currency):'—'} icon={Package}/>
          <MetricCard label="Materials in Repo" value={fmtNum(repository.filter(m=>!m.archived).length)} icon={Layers}/>
        </div>
      </div>

      {!currentResult ? (
        <div className="card-padded flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-light flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-brand"/>
          </div>
          <h2 className="h2 mb-2">No estimate loaded</h2>
          <p className="body-text text-gray-500 max-w-sm mb-6">Create an estimate to see cost analytics and AI insights on this dashboard.</p>
          <Link href="/estimate" className="btn-primary">Create first estimate <ArrowRight className="h-4 w-4"/></Link>
        </div>
      ) : (
        <>
          <div>
            <p className="section-label">Current estimate</p>
            <div className="card-padded flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="h3">{currentResult.projectName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{currentResult.method} · {fmtNum(currentResult.area,0)} sq ft · {currentResult.buildingType} · {currentResult.date}</p>
                {currentResult.clientName&&<p className="text-xs text-gray-400">Client: {currentResult.clientName}</p>}
              </div>
              <div className="flex gap-2">
                <Link href="/estimate" className="btn-secondary text-xs"><Calculator className="h-3.5 w-3.5"/>New estimate</Link>
                <Link href="/reports" className="btn-primary text-xs">View report <ArrowRight className="h-3.5 w-3.5"/></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Grand Total" value={fmt(currentResult.summary.grandTotal,currentResult.currency)} valueColor="text-brand" icon={TrendingUp}/>
              <MetricCard label="Material Cost" value={fmt(currentResult.summary.materialCost,currentResult.currency)} icon={Package}/>
              <MetricCard label="Labor Cost" value={fmt(currentResult.summary.laborCost,currentResult.currency)} icon={Layers} iconBg="bg-gray-100" iconColor="text-gray-600"/>
              <MetricCard label="Tax + Contingency" value={fmt(currentResult.summary.taxAmount+currentResult.summary.contingencyCost,currentResult.currency)} iconBg="bg-gray-100" iconColor="text-gray-500"/>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card-padded"><p className="section-label">Cost distribution</p><CostPieChart items={currentResult.calculations} currency={currentResult.currency}/></div>
            <div className="card-padded"><p className="section-label">Top materials by cost</p><MaterialBarChart items={currentResult.calculations} currency={currentResult.currency}/></div>
          </div>
        </>
      )}

      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label mb-0">Recent projects</p>
            <Link href="/projects" className="text-xs font-medium hover:underline" style={{color:'#C65911'}}>View all →</Link>
          </div>
          <div className="card overflow-hidden">
            <table className="min-w-full">
              <thead><tr>{['Project','Type','Area','Grand Total','Status','Date'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody>
                {projects.slice(0,5).map(p=>(
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900">{p.metadata.name}</td>
                    <td className="table-cell">{p.metadata.projectType}</td>
                    <td className="table-cell-num">{p.currentResult?fmtNum(p.currentResult.area,0)+' sq ft':'—'}</td>
                    <td className="table-cell-num font-semibold" style={{color:'#C65911'}}>{p.currentResult?fmt(p.currentResult.summary.grandTotal,p.currentResult.currency):'—'}</td>
                    <td className="table-cell"><span className={`status-${p.metadata.status.toLowerCase()}`}>{p.metadata.status}</span></td>
                    <td className="table-cell text-gray-400">{p.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
