
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { runAreaEstimation, getRatesFromRepository } from '@/lib/transparentEngine'
import { BUILDING_TYPES, QUALITY_OPTIONS, STRUCTURE_TYPES, WALL_THICKNESSES, CURRENCIES } from '@/lib/constants'
import type { BuildingType, ConstructionQuality, StructureType, WallThickness, Currency } from '@/lib/types'
import { Calculator, RefreshCw } from 'lucide-react'

export function AreaForm() {
  const router = useRouter()
  const { settings, updateSettings, setCurrentResult, saveProject, repository, setCurrency, drivers } = useAppStore()
  const [form, setForm] = useState({
    projectName:'2BHK Residential House', clientName:'', location:'',
    buildingType:'Residential' as BuildingType, currency:'₹' as Currency,
    area:'1200', floors:'1', quality:'Standard' as ConstructionQuality,
    structureType:'RCC Framed' as StructureType, wallThickness:'9 inch' as WallThickness, ceilingHeight:'10',
  })
  const [errs, setErrs] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)

  function setF<K extends keyof typeof form>(k:K,v:typeof form[K]){ setForm(f=>({...f,[k]:v})); setErrs(e=>{const n={...e};delete n[k as string];return n}) }

  function validate() {
    const e: Record<string,string> = {}
    if (!form.projectName.trim()) e.projectName='Required'
    if (!form.area||parseFloat(form.area)<=0) e.area='Must be greater than zero'
    setErrs(e); return Object.keys(e).length===0
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault(); if (!validate()) return
    setLoading(true)
    try {
      setCurrency(form.currency)
      const rates = getRatesFromRepository(repository.filter(m=>!m.archived))
      const result = runAreaEstimation({
        projectName:form.projectName, buildingType:form.buildingType, currency:form.currency,
        area:parseFloat(form.area), floors:parseInt(form.floors), quality:form.quality,
        structureType:form.structureType, wallThickness:form.wallThickness,
        ceilingHeight:parseFloat(form.ceilingHeight)||10, settings,
      }, rates, drivers)
      setCurrentResult(result)
      saveProject(result, { clientName:form.clientName, location:form.location, projectType:form.buildingType })
      router.push('/reports')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="card-padded">
        <p className="section-label">Project information</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="label">Project name *</label>
            <input className={`input-field ${errs.projectName?'border-red-400':''}`} value={form.projectName} onChange={e=>setF('projectName',e.target.value)}/>
            {errs.projectName&&<p className="mt-1 text-xs text-red-500">{errs.projectName}</p>}</div>
          <div><label className="label">Client name</label><input className="input-field" value={form.clientName} onChange={e=>setF('clientName',e.target.value)} placeholder="Optional"/></div>
          <div><label className="label">Location</label><input className="input-field" value={form.location} onChange={e=>setF('location',e.target.value)} placeholder="City / Site"/></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <div><label className="label">Building type</label>
            <select className="select-field" value={form.buildingType} onChange={e=>setF('buildingType',e.target.value as BuildingType)}>
              {BUILDING_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Currency</label>
            <select className="select-field" value={form.currency} onChange={e=>setF('currency',e.target.value as Currency)}>
              {CURRENCIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div><label className="label">Quality</label>
            <select className="select-field" value={form.quality} onChange={e=>setF('quality',e.target.value as ConstructionQuality)}>
              {QUALITY_OPTIONS.map(q=><option key={q}>{q}</option>)}</select></div>
        </div>
      </div>
      <div className="card-padded">
        <p className="section-label">Building specifications</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><label className="label">Total area (sq ft) *</label>
            <input type="number" className={`input-field ${errs.area?'border-red-400':''}`} value={form.area} min="1" onChange={e=>setF('area',e.target.value)}/>
            {errs.area&&<p className="mt-1 text-xs text-red-500">{errs.area}</p>}</div>
          <div><label className="label">Floors</label>
            <select className="select-field" value={form.floors} onChange={e=>setF('floors',e.target.value)}>
              {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}{n===5?'+':''}</option>)}</select></div>
          <div><label className="label">Quality</label>
            <select className="select-field" value={form.quality} onChange={e=>setF('quality',e.target.value as ConstructionQuality)}>
              {QUALITY_OPTIONS.map(q=><option key={q}>{q}</option>)}</select></div>
          <div><label className="label">Structure type</label>
            <select className="select-field" value={form.structureType} onChange={e=>setF('structureType',e.target.value as StructureType)}>
              {STRUCTURE_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className="label">Wall thickness</label>
            <select className="select-field" value={form.wallThickness} onChange={e=>setF('wallThickness',e.target.value as WallThickness)}>
              {WALL_THICKNESSES.map(w=><option key={w}>{w}</option>)}</select></div>
          <div><label className="label">Ceiling height (ft)</label>
            <input type="number" className="input-field" value={form.ceilingHeight} min="7" max="25" onChange={e=>setF('ceilingHeight',e.target.value)}/></div>
        </div>
      </div>
      <div className="card-padded">
        <p className="section-label">Cost factors</p>
        <div className="grid grid-cols-3 gap-4">
          {[{label:'Waste factor (%)',key:'wasteFactor' as const},{label:'Contingency (%)',key:'contingency' as const},{label:'Tax rate (%)',key:'taxRate' as const}].map(({label,key})=>(
            <div key={key}><label className="label">{label}</label>
              <input type="number" className="input-field" value={settings[key]} min="0" onChange={e=>updateSettings({[key]:parseFloat(e.target.value)||0})}/></div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}><Calculator className="h-4 w-4"/>{loading?'Calculating...':'Calculate estimate'}</button>
        <button type="button" className="btn-secondary" onClick={()=>setForm(f=>({...f,projectName:'2BHK Residential House',area:'1200',floors:'1',quality:'Standard',structureType:'RCC Framed',wallThickness:'9 inch',ceilingHeight:'10'}))}><RefreshCw className="h-4 w-4"/>Load sample</button>
      </div>
    </form>
  )
}
