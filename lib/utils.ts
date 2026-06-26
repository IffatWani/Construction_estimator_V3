import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MaterialCategory } from './types'
import { CATEGORY_BADGE } from './constants'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function fmt(value: number, currency: string): string {
  return `${currency}${Math.round(value).toLocaleString('en-IN')}`
}

export function fmtNum(value: number, decimals = 0): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function categoryBadge(cat: MaterialCategory): string {
  return CATEGORY_BADGE[cat] ?? CATEGORY_BADGE['Misc']
}

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function today(): string {
  return new Date().toLocaleDateString('en-IN')
}
