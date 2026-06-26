
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calculator, Database, FileText, Settings, FolderOpen, Building2, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href:'/dashboard',  label:'Dashboard',   icon:LayoutDashboard },
  { href:'/projects',   label:'Projects',     icon:FolderOpen },
  { href:'/estimate',   label:'New Estimate', icon:Calculator },
  { href:'/repository', label:'Repository',   icon:Database },
  { href:'/reports',    label:'Reports',      icon:FileText },
  { href:'/drivers',    label:'Qty Drivers',  icon:SlidersHorizontal },
  { href:'/settings',   label:'Settings',     icon:Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
          <Building2 className="h-4 w-4 text-white"/>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900" style={{fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',fontWeight:700}}>CostEstimator</p>
          <p className="text-[10px] text-gray-400">Professional Edition</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path===href||(href!=='/dashboard'&&path.startsWith(href))
          return (
            <Link key={href} href={href} className={cn('nav-link',active&&'active')}>
              <Icon className="h-4 w-4 flex-shrink-0"/>{label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">v2.0 Enterprise</p>
      </div>
    </aside>
  )
}
