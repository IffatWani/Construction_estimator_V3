
'use client'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import { Save, RotateCcw } from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings, currency, setCurrency } = useAppStore()
  const [saved, setSaved] = useState(false)

  function handleSave() { setSaved(true); setTimeout(()=>setSaved(false),2000) }
  function handleReset() { if(confirm('Reset all settings to defaults?')) updateSettings(DEFAULT_SETTINGS) }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="card-padded">
        <p className="section-label">Cost factors</p>
        <div className="grid grid-cols-3 gap-4">
          {[{label:'Waste factor (%)',key:'wasteFactor' as const,hint:'5–10% typical'},{label:'Contingency (%)',key:'contingency' as const,hint:'3–5% typical'},{label:'Tax rate (%)',key:'taxRate' as const,hint:'GST 18%'}].map(({label,key,hint})=>(
            <div key={key}>
              <label className="label">{label}</label>
              <input type="number" className="input-field" value={settings[key]} min="0"
                onChange={e=>updateSettings({[key]:parseFloat(e.target.value)||0})}/>
              <p className="mt-1 text-xs text-gray-400">{hint}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card-padded">
        <p className="section-label">Labor rates (% of material cost)</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Structural labor (%)</label>
            <input type="number" className="input-field" value={settings.laborStructuralPct} min="0"
              onChange={e=>updateSettings({laborStructuralPct:parseFloat(e.target.value)||0})}/></div>
          <div><label className="label">Finishing labor (%)</label>
            <input type="number" className="input-field" value={settings.laborFinishingPct} min="0"
              onChange={e=>updateSettings({laborFinishingPct:parseFloat(e.target.value)||0})}/></div>
        </div>
      </div>
      <div className="card-padded">
        <p className="section-label">Quality multipliers</p>
        <div className="grid grid-cols-3 gap-4">
          {(['Economy','Standard','Premium'] as const).map(q=>(
            <div key={q}><label className="label">{q}</label>
              <input type="number" className="input-field" value={settings.qualityMultipliers[q]} step="0.01" min="0.1"
                onChange={e=>updateSettings({qualityMultipliers:{...settings.qualityMultipliers,[q]:parseFloat(e.target.value)||1}})}/></div>
          ))}
        </div>
      </div>
      <div className="card-padded">
        <p className="section-label">Display currency</p>
        <div className="grid grid-cols-4 gap-3">
          {(['₹','$','£','€'] as const).map(c=>(
            <button key={c} onClick={()=>setCurrency(c)}
              className={`rounded-xl border-2 p-3 text-lg font-bold transition-colors ${currency===c?'border-brand bg-brand-light text-brand':'border-gray-200 text-gray-500 hover:border-brand'}`}>
              {c}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={handleSave}><Save className="h-4 w-4"/>{saved?'Saved!':'Save settings'}</button>
        <button className="btn-secondary" onClick={handleReset}><RotateCcw className="h-4 w-4"/>Reset defaults</button>
      </div>
    </div>
  )
}
