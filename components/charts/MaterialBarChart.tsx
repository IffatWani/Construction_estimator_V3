
'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MaterialCalculation } from '@/lib/types'
import { CHART_COLORS } from '@/lib/constants'
import { fmt } from '@/lib/utils'

export function MaterialBarChart({ items, currency, limit=8 }: { items: MaterialCalculation[]; currency: string; limit?: number }) {
  const data = [...items].sort((a,b)=>b.totalCost-a.totalCost).slice(0,limit).map(it=>({ name:it.material, value:Math.round(it.totalCost) }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top:4, right:8, left:8, bottom:55 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
        <XAxis dataKey="name" tick={{ fontSize:10, fill:'#808080', fontFamily:'Helvetica Neue,sans-serif' }} angle={-40} textAnchor="end" interval={0} height={60}/>
        <YAxis tick={{ fontSize:10, fill:'#808080', fontFamily:'Helvetica Neue,sans-serif' }} tickFormatter={v=>`${currency}${(v/1000).toFixed(0)}k`} width={52}/>
        <Tooltip formatter={(v:number) => [fmt(v, currency), 'Cost']}
          contentStyle={{ border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', fontFamily:'Helvetica Neue,sans-serif' }}/>
        <Bar dataKey="value" radius={[4,4,0,0]}>
          {data.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
