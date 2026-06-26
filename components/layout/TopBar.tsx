
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const titles: Record<string,{title:string;sub:string}> = {
  '/dashboard':  { title:'Dashboard',            sub:'Project overview and analytics' },
  '/projects':   { title:'Projects',             sub:'Manage your estimation projects' },
  '/estimate':   { title:'New Estimate',         sub:'Calculate material quantities and costs' },
  '/repository': { title:'Material Repository', sub:'Manage materials, rates, and bulk import' },
  '/reports':    { title:'Reports',              sub:'View, analyse, and export estimates' },
  '/drivers':    { title:'Quantity Drivers',     sub:'Inspect and edit every assumption used in calculations' },
  '/settings':   { title:'Settings',             sub:'Configure defaults, tax, and labor rates' },
}

const mobileNav = [
  {href:'/dashboard',label:'Dashboard'},{href:'/projects',label:'Projects'},
  {href:'/estimate',label:'Estimate'},{href:'/drivers',label:'Drivers'},{href:'/repository',label:'Repository'},{href:'/reports',label:'Reports'},
]

export function TopBar() {
  const path = usePathname()
  const meta = titles[path] ?? { title:'Construction Estimator', sub:'' }
  return (
    <>
      <header className="hidden md:flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5">
        <div>
          <h1 className="text-base font-bold text-gray-900" style={{fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',fontWeight:700}}>{meta.title}</h1>
          {meta.sub&&<p className="text-xs text-gray-400 mt-0.5">{meta.sub}</p>}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 ring-1 ring-inset ring-green-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500"/>Online
        </span>
      </header>
      <header className="flex md:hidden items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand flex items-center justify-center"><Building2 className="h-3.5 w-3.5 text-white"/></div>
          <span className="text-sm font-bold text-gray-900">CostEstimator</span>
        </div>
        <h1 className="text-sm font-medium text-gray-900">{meta.title}</h1>
      </header>
      <nav className="flex md:hidden overflow-x-auto border-b border-gray-200 bg-white px-4">
        {mobileNav.map(({href,label})=>(
          <Link key={href} href={href} className={cn('flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors',
            path===href?'border-brand text-brand':'border-transparent text-gray-500 hover:text-gray-700')}>
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
