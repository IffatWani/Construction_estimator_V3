
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { fmt, fmtNum, cn } from '@/lib/utils'
import { FolderOpen, Trash2, Archive, Copy, Plus, Search, GitBranch } from 'lucide-react'

export default function ProjectsPage() {
  const { projects, deleteProject, archiveProject, duplicateProject, addRevision, currentResult, saveProject } = useAppStore()
  const [search, setSearch] = useState('')
  const [revLabel, setRevLabel] = useState('')
  const [revProjectId, setRevProjectId] = useState<string|null>(null)

  const filtered = projects.filter(p =>
    p.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
    p.metadata.clientName.toLowerCase().includes(search.toLowerCase())
  )

  function handleSaveCurrent() {
    if (currentResult) saveProject(currentResult)
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{projects.length} projects total</p>
        <div className="flex gap-2">
          {currentResult && (
            <button className="btn-secondary text-xs" onClick={handleSaveCurrent}>
              <Plus className="h-3.5 w-3.5"/>Save current estimate
            </button>
          )}
          <Link href="/estimate" className="btn-primary text-xs"><Plus className="h-3.5 w-3.5"/>New estimate</Link>
        </div>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
        <input className="input-field pl-9" placeholder="Search projects or client..." value={search} onChange={e=>setSearch(e.target.value)}/></div>

      {revProjectId && (
        <div className="card-padded bg-orange-50/30 border border-orange-200">
          <p className="h3 mb-3">Save revision</p>
          <div className="flex gap-3">
            <input className="input-field flex-1" placeholder="e.g. Rev 1 - Client review" value={revLabel} onChange={e=>setRevLabel(e.target.value)}/>
            <button className="btn-primary" onClick={()=>{if(revLabel.trim()){addRevision(revProjectId,revLabel);setRevLabel('');setRevProjectId(null)}}}>Save</button>
            <button className="btn-secondary" onClick={()=>setRevProjectId(null)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length===0 ? (
        <div className="card-padded text-center py-16">
          <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3"/>
          <p className="h3 text-gray-500 mb-2">No projects yet</p>
          <p className="text-sm text-gray-400 mb-5">Projects are saved automatically when you run an estimate.</p>
          <Link href="/estimate" className="btn-primary">Create estimate</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p=>(
            <div key={p.id} className="card overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="h-10 w-10 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-5 w-5 text-brand"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="h3">{p.metadata.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.metadata.clientName||'No client'} · {p.metadata.location||'No location'} · {p.metadata.projectType}
                      </p>
                    </div>
                    <span className={`status-${p.metadata.status.toLowerCase()}`}>{p.metadata.status}</span>
                  </div>
                  <div className="flex items-center gap-6 mt-3 flex-wrap">
                    {p.currentResult && (<>
                      <div><p className="text-xs text-gray-400">Grand total</p><p className="text-base font-bold numeric" style={{color:'#C65911'}}>{fmt(p.currentResult.summary.grandTotal, p.currentResult.currency)}</p></div>
                      <div><p className="text-xs text-gray-400">Area</p><p className="text-sm font-semibold numeric text-gray-900">{fmtNum(p.currentResult.area,0)} sq ft</p></div>
                      <div><p className="text-xs text-gray-400">Method</p><p className="text-sm text-gray-600">{p.currentResult.method}</p></div>
                    </>)}
                    <div><p className="text-xs text-gray-400">Revisions</p><p className="text-sm font-semibold text-gray-900">{p.revisions.length}</p></div>
                    <div><p className="text-xs text-gray-400">Updated</p><p className="text-sm text-gray-600">{p.updatedAt}</p></div>
                  </div>

                  {/* Revisions */}
                  {p.revisions.length>0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Version history</p>
                      <div className="flex gap-2 flex-wrap">
                        {p.revisions.map(rev=>(
                          <div key={rev.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {rev.label} — <span className="numeric font-semibold">{fmt(rev.grandTotal, p.currentResult?.currency??'')}</span> <span className="text-gray-400">({rev.date})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2 flex-wrap">
                <button onClick={()=>{setRevProjectId(p.id);setRevLabel('')}} className="btn-ghost text-xs"><GitBranch className="h-3.5 w-3.5"/>Save revision</button>
                <button onClick={()=>duplicateProject(p.id)} className="btn-ghost text-xs"><Copy className="h-3.5 w-3.5"/>Duplicate</button>
                <button onClick={()=>archiveProject(p.id)} className="btn-ghost text-xs"><Archive className="h-3.5 w-3.5"/>{p.metadata.status==='Archived'?'Unarchive':'Archive'}</button>
                <button onClick={()=>{if(confirm(`Delete "${p.metadata.name}"?`))deleteProject(p.id)}} className="btn-ghost text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5"/>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
