'use client'
import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { groupDriversByMaterial, countModifiedDrivers } from '@/lib/quantityDrivers'
import type { QuantityDriver } from '@/lib/quantityDrivers'
import { cn } from '@/lib/utils'
import {
  ChevronDown, ChevronUp, RotateCcw, AlertTriangle,
  CheckCircle, Info, Edit3, BookOpen, Download,
} from 'lucide-react'
import { exportDriversToExcel } from '@/lib/excelExport'

const TYPE_COLORS: Record<string, string> = {
  ratio:       'bg-blue-50 text-blue-700 ring-blue-600/20',
  factor:      'bg-orange-50 text-orange-700 ring-orange-600/20',
  percentage:  'bg-purple-50 text-purple-700 ring-purple-600/20',
  count_rule:  'bg-green-50 text-green-700 ring-green-600/20',
}

function DriverRow({ driver, onUpdate, onReset }: {
  driver: QuantityDriver
  onUpdate: (id: string, val: number) => void
  onReset:  (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [tempVal, setTempVal]   = useState(String(driver.value))

  function commitEdit() {
    const parsed = parseFloat(tempVal)
    if (!isNaN(parsed) && parsed >= driver.min && parsed <= driver.max) {
      onUpdate(driver.id, parsed)
    } else {
      setTempVal(String(driver.value))
    }
    setEditing(false)
  }

  return (
    <div className={cn('border-b border-gray-100 last:border-0', !driver.isDefault && 'bg-orange-50/20')}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-5 py-3">
        {/* Modified indicator */}
        <div className="flex-shrink-0 w-1.5 h-8 rounded-full" style={{background: driver.isDefault ? '#e5e7eb' : '#C65911'}} />

        {/* Name + symbol */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{driver.paramName}</span>
            <code className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{driver.symbol}</code>
            <span className={cn('badge text-[10px]', TYPE_COLORS[driver.valueType] ?? TYPE_COLORS.ratio)}>
              {driver.valueType.replace('_',' ')}
            </span>
            {driver.isDefault && (
              <span className="badge text-[10px] bg-gray-100 text-gray-500 ring-gray-400/20">default</span>
            )}
            {!driver.isDefault && (
              <span className="badge text-[10px] bg-orange-100 text-orange-700 ring-orange-400/20">modified</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{driver.formulaRole}</p>
        </div>

        {/* Value editor */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-24 text-sm font-semibold text-right input-field py-1 px-2"
                value={tempVal}
                min={driver.min}
                max={driver.max}
                step={driver.valueType === 'ratio' ? 10 : 0.01}
                onChange={e => setTempVal(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key==='Enter') commitEdit(); if (e.key==='Escape') { setTempVal(String(driver.value)); setEditing(false) } }}
                autoFocus
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">{driver.unit}</span>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 group hover:bg-orange-50 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="text-sm font-bold numeric" style={{color: driver.isDefault ? '#374151' : '#C65911'}}>
                {driver.value}
              </span>
              <span className="text-xs text-gray-400">{driver.unit}</span>
              <Edit3 className="h-3 w-3 text-gray-300 group-hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Reset */}
          {!driver.isDefault && (
            <button
              onClick={() => { onReset(driver.id); setTempVal(String(driver.value)) }}
              className="p-1 rounded text-gray-400 hover:text-brand hover:bg-orange-50 transition-colors"
              title="Reset to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Expand */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-xs text-gray-700 leading-relaxed">{driver.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <BookOpen className="inline h-3 w-3 mr-1" />Source / Standard
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">{driver.source}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Formula role</p>
              <p className="text-xs text-gray-700 mt-1">{driver.formulaRole}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Allowed range</p>
              <p className="text-xs font-semibold text-gray-900 mt-1 numeric">{driver.min} – {driver.max} {driver.unit}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Current value</p>
              <p className="text-xs font-bold mt-1 numeric" style={{color: driver.isDefault ? '#374151' : '#C65911'}}>
                {driver.value} {driver.unit}
                {!driver.isDefault && <span className="ml-1 text-[10px] text-orange-500">(modified)</span>}
              </p>
            </div>
          </div>
          {/* Range slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>{driver.min}</span>
              <span className="text-gray-600 font-medium">Drag to adjust: {driver.value} {driver.unit}</span>
              <span>{driver.max}</span>
            </div>
            <input
              type="range"
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{accentColor:'#C65911'}}
              min={driver.min}
              max={driver.max}
              step={driver.valueType === 'ratio' ? 10 : driver.valueType === 'percentage' ? 0.5 : 0.01}
              value={driver.value}
              onChange={e => onUpdate(driver.id, parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function DriversPage() {
  const { drivers, updateDriver, resetDriver, resetAllDrivers } = useAppStore()
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState<Record<string,boolean>>({})

  const grouped  = useMemo(() => groupDriversByMaterial(drivers), [drivers])
  const modified = useMemo(() => countModifiedDrivers(drivers), [drivers])

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return grouped
    const q = search.toLowerCase()
    const result: typeof grouped = {}
    for (const [mat, list] of Object.entries(grouped)) {
      const hits = list.filter(d =>
        d.paramName.toLowerCase().includes(q) ||
        d.symbol.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q)
      )
      if (hits.length || mat.toLowerCase().includes(q)) result[mat] = hits.length ? hits : list
    }
    return result
  }, [grouped, search])

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="card-padded border-l-4" style={{borderLeftColor:'#C65911'}}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{color:'#C65911'}} />
          <div>
            <p className="text-sm font-bold text-gray-900">Every quantity is derived from these drivers — nothing is hidden</p>
            <p className="text-xs text-gray-500 mt-1">
              All {Object.keys(drivers).length} parameters are visible and editable below. Every driver shows its source standard, formula role, and allowed range.
              Modified values are highlighted in <span style={{color:'#C65911'}}>orange</span>. Click any value to edit inline or use the slider.
            </p>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {modified > 0
              ? <AlertTriangle className="h-4 w-4 text-orange-500" />
              : <CheckCircle  className="h-4 w-4 text-green-500" />}
            <span className="text-sm text-gray-600">
              {modified > 0
                ? <><span className="font-semibold text-orange-600">{modified} driver{modified>1?'s':''} modified</span> from defaults</>
                : <span className="font-semibold text-green-600">All drivers at default values</span>}
            </span>
          </div>
          <span className="text-sm text-gray-400">{Object.keys(drivers).length} total drivers</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs" onClick={() => exportDriversToExcel(drivers)}>
            <Download className="h-3.5 w-3.5"/>Export drivers
          </button>
          {modified > 0 && (
            <button
              className="btn-secondary text-xs"
              onClick={() => { if (confirm('Reset ALL drivers to defaults?')) resetAllDrivers() }}
            >
              <RotateCcw className="h-3.5 w-3.5"/>Reset all to defaults
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input className="input-field pl-9" placeholder="Search drivers by name, symbol, or source standard…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Driver groups */}
      {Object.entries(filteredGroups).map(([material, list]) => {
        const isExpanded = expanded[material] !== false // default open
        const modifiedInGroup = list.filter(d => !d.isDefault).length
        return (
          <div key={material} className="card overflow-hidden">
            {/* Group header */}
            <button
              className="w-full flex items-center justify-between px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
              onClick={() => setExpanded(e => ({ ...e, [material]: !isExpanded }))}
            >
              <div className="flex items-center gap-3">
                <span className="h3">{material}</span>
                <span className="text-xs text-gray-400">{list.length} driver{list.length>1?'s':''}</span>
                {modifiedInGroup > 0 && (
                  <span className="badge text-[10px] bg-orange-100 text-orange-700 ring-orange-400/20">
                    {modifiedInGroup} modified
                  </span>
                )}
              </div>
              {isExpanded
                ? <ChevronUp className="h-4 w-4 text-gray-400" />
                : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {/* Drivers list */}
            {isExpanded && (
              <div>
                {list.map(driver => (
                  <DriverRow
                    key={driver.id}
                    driver={driver}
                    onUpdate={updateDriver}
                    onReset={resetDriver}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {Object.keys(filteredGroups).length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No drivers match your search.</div>
      )}
    </div>
  )
}
