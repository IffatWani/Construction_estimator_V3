
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { runLayoutEstimation, getRatesFromRepository } from '@/lib/transparentEngine'
import { BUILDING_TYPES, QUALITY_OPTIONS, STRUCTURE_TYPES, WALL_THICKNESSES, CURRENCIES } from '@/lib/constants'
import type { BuildingType, ConstructionQuality, StructureType, WallThickness, Currency, RoomShape, RoomDimensions } from '@/lib/types'
import { computeGeometry, shapeDiagramSVG } from '@/lib/geometry'
import { fmtNum } from '@/lib/utils'
import { Plus, Trash2, Calculator, Info, Upload, ChevronDown, ChevronUp } from 'lucide-react'

const SHAPES: RoomShape[] = ['Rectangle','Square','Circle','L-Shape']

export function LayoutForm() {
  const router = useRouter()
  const { rooms, addRoom, updateRoom, deleteRoom, settings, setCurrentResult, saveProject, repository, setCurrency, drivers } = useAppStore()
  const [meta, setMeta] = useState({ projectName:'Layout Project', clientName:'', location:'', buildingType:'Residential' as BuildingType, currency:'₹' as Currency, quality:'Standard' as ConstructionQuality, structureType:'RCC Framed' as StructureType, wallThickness:'9 inch' as WallThickness })
  const [loading, setLoading] = useState(false)
  const [errs, setErrs] = useState<Record<string,string>>({})
  const [expandedRoom, setExpandedRoom] = useState<string|null>(null)
  const [uploadedFile, setUploadedFile] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalArea = rooms.reduce((s,r)=>s+r.computed.floorArea,0)
  const totalWall = rooms.reduce((s,r)=>s+r.computed.wallArea,0)

  function validate() {
    const e: Record<string,string> = {}
    if (!meta.projectName.trim()) e.projectName='Required'
    if (rooms.length===0) e.rooms='Add at least one room'
    setErrs(e); return Object.keys(e).length===0
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault(); if (!validate()) return
    setLoading(true)
    try {
      setCurrency(meta.currency)
      const rates = getRatesFromRepository(repository.filter(m=>!m.archived))
      const result = runLayoutEstimation({...meta, rooms, settings}, rates, drivers)
      setCurrentResult(result)
      saveProject(result, { clientName:meta.clientName, location:meta.location, projectType:meta.buildingType })
      router.push('/reports')
    } finally { setLoading(false) }
  }

  function updateDim(id: string, key: string, val: number) {
    const room = rooms.find(r=>r.id===id); if (!room) return
    const g = room.geometry
    let newDims: RoomDimensions
    if (g.shape==='Rectangle') newDims={shape:'Rectangle',dims:{...g.dims,[key]:val}}
    else if (g.shape==='Square') newDims={shape:'Square',dims:{...g.dims,[key]:val}}
    else if (g.shape==='Circle') newDims={shape:'Circle',dims:{...g.dims,[key]:val}}
    else newDims={shape:'L-Shape',dims:{...(g.dims as {l1:number;w1:number;l2:number;w2:number;height:number}),[key]:val}}
    updateRoom(id, { geometry:newDims, computed:computeGeometry(newDims) })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="card-padded">
        <p className="section-label">Project information</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="label">Project name *</label>
            <input className={`input-field ${errs.projectName?'border-red-400':''}`} value={meta.projectName} onChange={e=>setMeta(m=>({...m,projectName:e.target.value}))}/></div>
          <div><label className="label">Client</label><input className="input-field" value={meta.clientName} onChange={e=>setMeta(m=>({...m,clientName:e.target.value}))} placeholder="Optional"/></div>
          <div><label className="label">Location</label><input className="input-field" value={meta.location} onChange={e=>setMeta(m=>({...m,location:e.target.value}))} placeholder="City"/></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div><label className="label">Building type</label>
            <select className="select-field" value={meta.buildingType} onChange={e=>setMeta(m=>({...m,buildingType:e.target.value as BuildingType}))}>
              {BUILDING_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Currency</label>
            <select className="select-field" value={meta.currency} onChange={e=>setMeta(m=>({...m,currency:e.target.value as Currency}))}>
              {CURRENCIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div><label className="label">Quality</label>
            <select className="select-field" value={meta.quality} onChange={e=>setMeta(m=>({...m,quality:e.target.value as ConstructionQuality}))}>
              {QUALITY_OPTIONS.map(q=><option key={q}>{q}</option>)}</select></div>
          <div><label className="label">Wall thickness</label>
            <select className="select-field" value={meta.wallThickness} onChange={e=>setMeta(m=>({...m,wallThickness:e.target.value as WallThickness}))}>
              {WALL_THICKNESSES.map(w=><option key={w}>{w}</option>)}</select></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="h3">Room geometry builder</p>
            <p className="text-xs text-gray-400 mt-0.5">Floor: <span className="numeric font-semibold text-gray-700">{fmtNum(totalArea,1)} sq ft</span> · Wall: <span className="numeric font-semibold text-gray-700">{fmtNum(totalWall,1)} sq ft</span></p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SHAPES.map(shape=>(
              <button key={shape} type="button" onClick={()=>addRoom(shape)} className="btn-secondary text-xs py-1.5 px-3">
                <Plus className="h-3.5 w-3.5"/>{shape}</button>
            ))}
          </div>
        </div>
        {errs.rooms&&<p className="px-5 py-2 text-xs text-red-600 bg-red-50">{errs.rooms}</p>}
        <div className="divide-y divide-gray-100">
          {rooms.map(room=>{
            const g=room.geometry; const expanded=expandedRoom===room.id
            return (
              <div key={room.id}>
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 flex-shrink-0" dangerouslySetInnerHTML={{__html:shapeDiagramSVG(g.shape)}}/>
                  <input className="input-field max-w-[160px] text-sm font-medium" value={room.name} onChange={e=>updateRoom(room.id,{name:e.target.value})}/>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:block">{g.shape}</span>
                  <div className="hidden sm:flex gap-4 text-xs text-gray-400 flex-1">
                    <span>Floor <span className="numeric font-medium text-gray-700">{room.computed.floorArea.toFixed(1)}</span></span>
                    <span>Wall <span className="numeric font-medium text-gray-700">{room.computed.wallArea.toFixed(1)}</span></span>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    <button type="button" onClick={()=>setExpandedRoom(expanded?null:room.id)} className="btn-ghost text-xs py-1 px-2">
                      Dims {expanded?<ChevronUp className="h-3.5 w-3.5"/>:<ChevronDown className="h-3.5 w-3.5"/>}
                    </button>
                    <button type="button" onClick={()=>deleteRoom(room.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                  </div>
                </div>
                {expanded&&(
                  <div className="px-5 pb-4 bg-gray-50/60 border-t border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                      {g.shape==='Rectangle'&&<>
                        <div><label className="label">Length (ft)</label><input type="number" className="input-field" value={g.dims.length} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'length',parseFloat(e.target.value)||0)}/></div>
                        <div><label className="label">Width (ft)</label><input type="number" className="input-field" value={g.dims.width} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'width',parseFloat(e.target.value)||0)}/></div>
                        <div><label className="label">Height (ft)</label><input type="number" className="input-field" value={g.dims.height} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'height',parseFloat(e.target.value)||0)}/></div>
                      </>}
                      {g.shape==='Square'&&<>
                        <div><label className="label">Side (ft)</label><input type="number" className="input-field" value={g.dims.side} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'side',parseFloat(e.target.value)||0)}/></div>
                        <div><label className="label">Height (ft)</label><input type="number" className="input-field" value={g.dims.height} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'height',parseFloat(e.target.value)||0)}/></div>
                      </>}
                      {g.shape==='Circle'&&<>
                        <div><label className="label">Radius (ft)</label><input type="number" className="input-field" value={g.dims.radius} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'radius',parseFloat(e.target.value)||0)}/></div>
                        <div><label className="label">Height (ft)</label><input type="number" className="input-field" value={g.dims.height} min="0.1" step="0.5" onChange={e=>updateDim(room.id,'height',parseFloat(e.target.value)||0)}/></div>
                      </>}
                      {g.shape==='L-Shape'&&(['l1','w1','l2','w2','height'] as const).map(k=>(
                        <div key={k}><label className="label">{k==='height'?'Height':k==='l1'?'Length 1':k==='w1'?'Width 1':k==='l2'?'Length 2':'Width 2'} (ft)</label>
                          <input type="number" className="input-field" value={(g.dims as unknown as Record<string,number>)[k]} min="0.1" step="0.5" onChange={e=>updateDim(room.id,k,parseFloat(e.target.value)||0)}/></div>
                      ))}
                      <div className="sm:col-span-4 grid grid-cols-5 gap-2 pt-2 border-t border-gray-200">
                        {[['Floor',room.computed.floorArea,'sq ft'],['Wall',room.computed.wallArea,'sq ft'],['Ceiling',room.computed.ceilingArea,'sq ft'],['Perimeter',room.computed.perimeter,'ft'],['Volume',room.computed.volume,'cu ft']].map(([l,v,u])=>(
                          <div key={String(l)} className="text-center bg-white rounded-lg p-2 border border-gray-100">
                            <p className="text-[10px] text-gray-400">{l}</p>
                            <p className="text-sm font-semibold text-gray-900 numeric">{Number(v).toFixed(1)}</p>
                            <p className="text-[10px] text-gray-400">{u}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {rooms.length===0&&<div className="text-center py-12 text-gray-400 text-sm">Click a shape above to add rooms.</div>}
      </div>

      <div className="card-padded">
        <p className="section-label">Drawing upload (optional)</p>
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0"/>
          <p className="text-xs text-blue-700">AI/CAD drawing interpretation can be integrated via processing pipeline. Uploads are stored for reference only.</p>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand hover:bg-orange-50/30 transition-colors" onClick={()=>fileRef.current?.click()}>
          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2"/>
          <p className="text-sm text-gray-600">Drop drawing or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF</p>
          {uploadedFile&&<p className="text-xs text-green-600 mt-2 font-medium">Uploaded: {uploadedFile}</p>}
        </div>
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={e=>e.target.files?.[0]&&setUploadedFile(e.target.files[0].name)}/>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading||rooms.length===0}>
          <Calculator className="h-4 w-4"/>{loading?'Calculating...':'Calculate from rooms'}
        </button>
      </div>
    </form>
  )
}
