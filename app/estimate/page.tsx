'use client'
import { useState } from 'react'
import { AreaForm } from '@/components/forms/AreaForm'
import { LayoutForm } from '@/components/forms/LayoutForm'
import { cn } from '@/lib/utils'

export default function EstimatePage() {
  const [tab, setTab] = useState<'area'|'layout'>('area')
  return (
    <div className="max-w-4xl space-y-5">
      <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1">
        {([['area','Area Based Estimation'],['layout','Drawing Layout Estimation']] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={cn('rounded-lg px-5 py-2 text-sm transition-all', tab===id?'bg-white text-gray-900 shadow-sm font-bold':'text-gray-500 hover:text-gray-700 font-medium')}
            style={{fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif'}}>
            {label}
          </button>
        ))}
      </div>
      {tab==='area'?<AreaForm/>:<LayoutForm/>}
    </div>
  )
}
