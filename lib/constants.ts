import type { MaterialCategory, ProjectSettings, RepositoryMaterial } from './types'

export const DEFAULT_SETTINGS: ProjectSettings = {
  wasteFactor: 5, contingency: 3, taxRate: 18,
  laborStructuralPct: 25, laborFinishingPct: 15,
  qualityMultipliers: { Economy: 0.80, Standard: 1.00, Premium: 1.35 },
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = ['Structure','Masonry','Finishing','MEP','Fixtures','Misc']

export const UNIT_OPTIONS = ['Bag','Kg','Ton','Cubic Meter','Square Meter','Running Meter','Piece','Litre','sq ft','cu ft','m','nos']

export const BUILDING_TYPES = ['Residential','Apartment','Commercial','Villa','Warehouse'] as const
export const QUALITY_OPTIONS = ['Economy','Standard','Premium'] as const
export const STRUCTURE_TYPES = ['RCC Framed','Load Bearing','Steel Structure'] as const
export const WALL_THICKNESSES = ['4.5 inch','9 inch'] as const
export const CURRENCIES = [
  { value: '₹', label: '₹ INR' }, { value: '$', label: '$ USD' },
  { value: '£', label: '£ GBP' }, { value: '€', label: '€ EUR' },
] as const

export const CATEGORY_COLORS: Record<MaterialCategory, string> = {
  Structure: '#C65911', Masonry: '#e67030', Finishing: '#808080',
  MEP: '#374151', Fixtures: '#a84a0e', Misc: '#9ca3af',
}

export const CATEGORY_BADGE: Record<MaterialCategory, string> = {
  Structure: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Masonry:   'bg-amber-50  text-amber-700  ring-amber-600/20',
  Finishing: 'bg-gray-100  text-gray-600   ring-gray-500/20',
  MEP:       'bg-slate-100 text-slate-700  ring-slate-600/20',
  Fixtures:  'bg-red-50    text-red-700    ring-red-600/20',
  Misc:      'bg-zinc-50   text-zinc-600   ring-zinc-500/20',
}

// Default repository seeded with 16 standard materials
function seed(
  name: string, category: MaterialCategory, unit: string, rate: number, supplier = ''
): RepositoryMaterial {
  return {
    id: name.toLowerCase().replace(/\s+/g,'-'),
    name, category, unit, rate, supplier,
    notes: '', dateUpdated: '2024-01-01', archived: false,
    rateHistory: [{ rate, date: '2024-01-01', note: 'Initial rate' }],
  }
}

export const DEFAULT_REPOSITORY: RepositoryMaterial[] = [
  seed('Cement',             'Structure',  'Bag',          420),
  seed('Sand',               'Structure',  'cu ft',         55),
  seed('Aggregate',          'Structure',  'cu ft',         45),
  seed('Steel',              'Structure',  'Kg',            70),
  seed('Bricks',             'Masonry',    'nos',            8),
  seed('Blocks',             'Masonry',    'nos',           12),
  seed('Concrete',           'Structure',  'Cubic Meter', 6500),
  seed('Water',              'Misc',       'Litre',        0.05),
  seed('Tiles',              'Finishing',  'sq ft',         80),
  seed('Paint',              'Finishing',  'Litre',        350),
  seed('Electrical Conduits','MEP',        'm',             85),
  seed('Wiring',             'MEP',        'm',             55),
  seed('Plumbing Pipes',     'MEP',        'm',            120),
  seed('Doors',              'Fixtures',   'nos',         8500),
  seed('Windows',            'Fixtures',   'nos',         4200),
  seed('Roofing',            'Structure',  'sq ft',         95),
]

export const CHART_COLORS = ['#C65911','#e67030','#808080','#374151','#a84a0e','#9ca3af','#6b7280','#ee9b6a']
