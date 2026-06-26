'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppStore, Room, RoomShape, RepositoryMaterial, MaterialCategory, Project, ProjectMetadata, EstimationResult, AIInsight } from './types'
import { DEFAULT_SETTINGS, DEFAULT_REPOSITORY } from './constants'
import { computeGeometry, defaultGeometry } from './geometry'
import { genId, today } from './utils'
import { getDefaultDrivers, type QuantityDriverSet, type QuantityDriver } from './quantityDrivers'


const DEFAULT_ROOMS: Room[] = [
  { id:'r1', name:'Living Room', geometry:{shape:'Rectangle',dims:{length:20,width:15,height:10}}, computed:{floorArea:300,wallArea:700,ceilingArea:300,perimeter:70,volume:3000} },
  { id:'r2', name:'Bedroom 1',   geometry:{shape:'Rectangle',dims:{length:12,width:12,height:10}}, computed:{floorArea:144,wallArea:480,ceilingArea:144,perimeter:48,volume:1440} },
  { id:'r3', name:'Kitchen',     geometry:{shape:'Rectangle',dims:{length:10,width:8, height:10}}, computed:{floorArea:80, wallArea:360,ceilingArea:80, perimeter:36,volume:800}  },
]

function generateInsightsFromResult(result: EstimationResult): AIInsight[] {
  const insights: AIInsight[] = []
  const totalArea = result.area

  result.calculations.forEach(c => {
    const ratePer1k = (c.totalQuantity / totalArea) * 1000
    if (c.material === 'Steel' && ratePer1k > 5500) {
      insights.push({ id: genId(), severity: 'warning', material: 'Steel', message: 'Steel quantity appears higher than typical', detail: `Calculated ${fmtN(c.totalQuantity)} kg for ${totalArea} sqft. Typical range is 3500–5000 kg per 1000 sqft. Review structural assumptions.` })
    }
    if (c.material === 'Cement' && ratePer1k > 600) {
      insights.push({ id: genId(), severity: 'warning', material: 'Cement', message: 'Cement quantity above typical range', detail: `${fmtN(c.totalQuantity)} bags estimated. Check quality multiplier and structure type.` })
    }
    if (c.rate === 0) {
      insights.push({ id: genId(), severity: 'error', material: c.material, message: `Rate for ${c.material} is ₹0`, detail: 'No rate found in repository. Update the material rate to get accurate cost estimates.' })
    }
  })

  const grandTotal = result.summary.grandTotal
  const perSqft = totalArea > 0 ? grandTotal / totalArea : 0
  if (perSqft > 8000) {
    insights.push({ id: genId(), severity: 'info', material: 'Overall', message: 'Premium cost range detected', detail: `Cost per sq ft is ${fmtN(perSqft)} which is in the premium range (>₹8000/sqft). Verify rates and quality settings.` })
  }

  return insights
}

function fmtN(n: number) { return Math.round(n).toLocaleString('en-IN') }

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ─── Repository ──────────────────────────────────────────────────────
      repository: [...DEFAULT_REPOSITORY],

      addMaterial: (m) => set(state => ({
        repository: [...state.repository, {
          ...m, id: genId(), dateUpdated: today(), archived: false,
          rateHistory: [{ rate: m.rate, date: today(), note: 'Initial' }],
        }],
      })),

      updateMaterial: (id, updates) => set(state => ({
        repository: state.repository.map(m => {
          if (m.id !== id) return m
          const rateChanged = updates.rate !== undefined && updates.rate !== m.rate
          return {
            ...m, ...updates, dateUpdated: today(),
            rateHistory: rateChanged
              ? [...m.rateHistory, { rate: updates.rate!, date: today(), note: updates.notes ?? 'Rate updated' }]
              : m.rateHistory,
          }
        }),
      })),

      deleteMaterial: (id) => set(state => ({ repository: state.repository.filter(m => m.id !== id) })),
      archiveMaterial: (id) => set(state => ({
        repository: state.repository.map(m => m.id === id ? { ...m, archived: !m.archived } : m),
      })),

      bulkImportMaterials: (items) => set(state => {
        const existing = new Map(state.repository.map(m => [m.name.toLowerCase(), m]))
        const updated = [...state.repository]
        items.forEach(item => {
          const key = item.name.toLowerCase()
          if (existing.has(key)) {
            const idx = updated.findIndex(m => m.name.toLowerCase() === key)
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx], rate: item.rate, unit: item.unit,
                category: item.category ?? updated[idx].category, dateUpdated: today(),
                rateHistory: [...updated[idx].rateHistory, { rate: item.rate, date: today(), note: 'Bulk import' }],
              }
            }
          } else {
            updated.push({
              id: genId(), name: item.name, unit: item.unit, rate: item.rate,
              category: item.category ?? 'Misc', dateUpdated: today(), archived: false,
              rateHistory: [{ rate: item.rate, date: today(), note: 'Bulk import' }],
            })
          }
        })
        return { repository: updated }
      }),

      getMaterialRate: (name) => {
        const m = get().repository.find(r => r.name.toLowerCase() === name.toLowerCase() && !r.archived)
        return m?.rate
      },

      // ─── Settings ────────────────────────────────────────────────────────
      settings: { ...DEFAULT_SETTINGS },
      updateSettings: (updates) => set(state => ({ settings: { ...state.settings, ...updates } })),

      // ─── Results ─────────────────────────────────────────────────────────
      currentResult: null,
      setCurrentResult: (r) => { set({ currentResult: r }); get().generateInsights(r) },
      clearCurrentResult: () => set({ currentResult: null }),

      // ─── Projects ────────────────────────────────────────────────────────
      projects: [],

      saveProject: (result, meta) => set(state => {
        const existing = state.projects.find(p => p.metadata.name === result.projectName)
        if (existing) {
          return { projects: state.projects.map(p => p.id === existing.id ? { ...p, updatedAt: today(), currentResult: result } : p) }
        }
        const project: Project = {
          id: genId(),
          metadata: { name: result.projectName, clientName: '', location: '', projectType: result.buildingType, notes: '', status: 'Active', ...meta },
          createdAt: today(), updatedAt: today(), revisions: [], currentResult: result,
        }
        return { projects: [project, ...state.projects] }
      }),

      deleteProject: (id) => set(state => ({ projects: state.projects.filter(p => p.id !== id) })),

      archiveProject: (id) => set(state => ({
        projects: state.projects.map(p => p.id === id ? { ...p, metadata: { ...p.metadata, status: p.metadata.status === 'Archived' ? 'Active' : 'Archived' } } : p),
      })),

      duplicateProject: (id) => set(state => {
        const original = state.projects.find(p => p.id === id)
        if (!original) return state
        const copy: Project = { ...original, id: genId(), metadata: { ...original.metadata, name: original.metadata.name + ' (Copy)' }, createdAt: today(), updatedAt: today(), revisions: [] }
        return { projects: [copy, ...state.projects] }
      }),

      addRevision: (projectId, label) => set(state => ({
        projects: state.projects.map(p => {
          if (p.id !== projectId || !p.currentResult) return p
          const rev = { id: genId(), label, date: today(), grandTotal: p.currentResult.summary.grandTotal, snapshot: p.currentResult }
          return { ...p, revisions: [...p.revisions, rev] }
        }),
      })),

      // ─── Rooms ───────────────────────────────────────────────────────────
      rooms: [...DEFAULT_ROOMS],

      addRoom: (shape: RoomShape = 'Rectangle') => set(state => {
        const geometry = defaultGeometry(shape)
        const computed = computeGeometry(geometry)
        return { rooms: [...state.rooms, { id: genId(), name: `Room ${state.rooms.length + 1}`, geometry, computed }] }
      }),

      updateRoom: (id, updates) => set(state => ({
        rooms: state.rooms.map(r => {
          if (r.id !== id) return r
          const merged = { ...r, ...updates }
          if (updates.geometry) merged.computed = computeGeometry(updates.geometry)
          return merged
        }),
      })),

      deleteRoom: (id) => set(state => ({ rooms: state.rooms.filter(r => r.id !== id) })),
      resetRooms: () => set({ rooms: [...DEFAULT_ROOMS] }),


      // ─── Quantity Drivers ────────────────────────────────────────────────
      drivers: getDefaultDrivers(),
      updateDriver: (id: string, value: number) => set(state => ({
        drivers: {
          ...state.drivers,
          [id]: { ...state.drivers[id], value, isDefault: false }
        }
      })),
      resetDriver: (id: string) => set(state => {
        const defaults = getDefaultDrivers()
        if (!defaults[id]) return state
        return { drivers: { ...state.drivers, [id]: { ...defaults[id], isDefault: true } } }
      }),
      resetAllDrivers: () => set({ drivers: getDefaultDrivers() }),

      // ─── Currency ────────────────────────────────────────────────────────
      currency: '₹',
      setCurrency: (currency) => set({ currency }),

      // ─── Insights ────────────────────────────────────────────────────────
      insights: [],
      generateInsights: (result) => set({ insights: generateInsightsFromResult(result) }),
      dismissInsight: (id) => set(state => ({ insights: state.insights.filter(i => i.id !== id) })),
    }),
    {
      name: 'ce-store-v2',
      partialize: (state) => ({
        repository: state.repository, settings: state.settings,
        projects: state.projects, currency: state.currency,
        drivers: state.drivers,
      }),
    }
  )
)
