
'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { MaterialCalculation } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/constants'
import { fmt } from '@/lib/utils'

export function CostPieChart({ items, currency }: { items: MaterialCalculation[]; currency: string }) {
  const cats = items.reduce<Record<string,number>>((a,it) => { a[it.category]=(a[it.category]??0)+it.totalCost; return a }, {})
  const data = Object.entries(cats).map(([name,value]) => ({ name, value: Math.round(value) }))
  const total = data.reduce((s,d) => s+d.value, 0)
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map(e => <Cell key={e.name} fill={CATEGORY_COLORS[e.name as keyof typeof CATEGORY_COLORS] ?? '#808080'}/>)}
          </Pie>
          <Tooltip formatter={(v: number) => [fmt(v, currency), 'Cost']}
            contentStyle={{ border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', fontFamily:'Helvetica Neue,sans-serif' }}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
        {data.map(e => (
          <div key={e.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[e.name as keyof typeof CATEGORY_COLORS] ?? '#808080' }}/>
            <span className="text-[11px] text-gray-500">{e.name} ({total>0?((e.value/total)*100).toFixed(0):0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
