import type {
  AreaEstimationInput, LayoutEstimationInput, EstimationResult,
  MaterialCalculation, CostSummary, MaterialCategory, CalcStep, Room, ProjectSettings,
} from './types'

function genId(): string { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

function getStructureMult(s: string) { return s === 'Steel Structure' ? 1.2 : s === 'Load Bearing' ? 0.9 : 1.0 }

function CATS(name: string): MaterialCategory {
  const map: Record<string, MaterialCategory> = {
    'Cement':'Structure','Sand':'Structure','Aggregate':'Structure','Steel':'Structure',
    'Concrete':'Structure','Roofing':'Structure',
    'Bricks':'Masonry','Blocks':'Masonry',
    'Tiles':'Finishing','Paint':'Finishing',
    'Electrical Conduits':'MEP','Wiring':'MEP','Plumbing Pipes':'MEP',
    'Doors':'Fixtures','Windows':'Fixtures',
    'Water':'Misc',
  }
  return map[name] ?? 'Misc'
}

function UNITS(name: string): string {
  const map: Record<string,string> = {
    'Cement':'Bag','Sand':'cu ft','Aggregate':'cu ft','Steel':'Kg','Bricks':'nos',
    'Blocks':'nos','Concrete':'Cubic Meter','Water':'Litre','Tiles':'sq ft','Paint':'Litre',
    'Electrical Conduits':'m','Wiring':'m','Plumbing Pipes':'m',
    'Doors':'nos','Windows':'nos','Roofing':'sq ft',
  }
  return map[name] ?? 'nos'
}

// Build transparent calculation steps per material
function buildCalc(
  material: string,
  floorAreaSqFt: number,
  wallAreaSqFt: number,
  qualMult: number,
  wallFactor: number,
  structMult: number,
  rate: number,
  wastePct: number,
  floors: number,
): MaterialCalculation {
  const totalFloor = floorAreaSqFt * floors
  const totalWall  = wallAreaSqFt  * floors

  let steps: CalcStep[] = []
  let baseQuantity = 0

  switch (material) {
    case 'Cement':
      steps = [
        { label: 'Base ratio',    formula: '400 bags per 1000 sq ft',                        value: 400,              unit: 'bags/1000sqft' },
        { label: 'Floor area',    formula: `${floorAreaSqFt} sq ft × ${floors} floors`,      value: totalFloor,       unit: 'sq ft' },
        { label: 'Quality mult',  formula: `Standard quality = ${qualMult}`,                  value: qualMult,         unit: 'x' },
        { label: 'Structure mult',formula: `${structMult}`,                                    value: structMult,       unit: 'x' },
        { label: 'Base qty',      formula: `(${totalFloor}/1000) × 400 × ${qualMult} × ${structMult}`, value: Math.round((totalFloor/1000)*400*qualMult*structMult), unit: 'Bag' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*400*qualMult*structMult)
      break
    case 'Sand':
      steps = [
        { label: 'Base ratio',  formula: '1800 cu ft per 1000 sq ft',                  value: 1800,       unit: 'cu ft/1000sqft' },
        { label: 'Floor area',  formula: `${totalFloor} sq ft`,                        value: totalFloor, unit: 'sq ft' },
        { label: 'Wall factor', formula: `Wall thickness factor = ${wallFactor}`,      value: wallFactor, unit: 'x' },
        { label: 'Base qty',    formula: `(${totalFloor}/1000) × 1800 × ${wallFactor}`,value: Math.round((totalFloor/1000)*1800*wallFactor), unit: 'cu ft' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*1800*wallFactor)
      break
    case 'Aggregate':
      steps = [
        { label: 'Base ratio', formula: '2200 cu ft per 1000 sq ft', value: 2200, unit: 'cu ft/1000sqft' },
        { label: 'Floor area', formula: `${totalFloor} sq ft`,        value: totalFloor, unit: 'sq ft' },
        { label: 'Struct mult',formula: `${structMult}`,              value: structMult, unit: 'x' },
        { label: 'Base qty',   formula: `(${totalFloor}/1000) × 2200 × ${structMult}`, value: Math.round((totalFloor/1000)*2200*structMult), unit: 'cu ft' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*2200*structMult)
      break
    case 'Steel':
      steps = [
        { label: 'Base ratio',  formula: '4000 kg per 1000 sq ft',                             value: 4000,      unit: 'kg/1000sqft' },
        { label: 'Floor area',  formula: `${totalFloor} sq ft`,                                 value: totalFloor,unit: 'sq ft' },
        { label: 'Quality mult',formula: `${qualMult}`,                                         value: qualMult,  unit: 'x' },
        { label: 'Base qty',    formula: `(${totalFloor}/1000) × 4000 × ${qualMult} × ${structMult}`, value: Math.round((totalFloor/1000)*4000*qualMult*structMult), unit: 'Kg' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*4000*qualMult*structMult)
      break
    case 'Bricks':
      steps = [
        { label: 'Base ratio', formula: '8000 nos per 1000 sq ft', value: 8000,       unit: 'nos/1000sqft' },
        { label: 'Wall factor',formula: `${wallFactor}`,            value: wallFactor, unit: 'x' },
        { label: 'Base qty',   formula: `(${totalFloor}/1000) × 8000 × ${wallFactor}`, value: Math.round((totalFloor/1000)*8000*wallFactor), unit: 'nos' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*8000*wallFactor)
      break
    case 'Blocks':
      steps = [
        { label: 'Base ratio', formula: '2000 nos per 1000 sq ft', value: 2000, unit: 'nos/1000sqft' },
        { label: 'Base qty',   formula: `(${totalFloor}/1000) × 2000 × ${wallFactor}`, value: Math.round((totalFloor/1000)*2000*wallFactor), unit: 'nos' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*2000*wallFactor)
      break
    case 'Concrete':
      steps = [
        { label: 'Base ratio', formula: '120 cu m per 1000 sq ft', value: 120, unit: 'cum/1000sqft' },
        { label: 'Base qty',   formula: `(${totalFloor}/1000) × 120 × ${structMult}`, value: Math.round((totalFloor/1000)*120*structMult*10)/10, unit: 'Cubic Meter' },
      ]
      baseQuantity = Math.round((totalFloor/1000)*120*structMult*10)/10
      break
    case 'Water':
      baseQuantity = Math.round((totalFloor/1000)*15000)
      steps = [{ label: 'Base qty', formula: `(${totalFloor}/1000) × 15000`, value: baseQuantity, unit: 'Litre' }]
      break
    case 'Tiles':
      steps = [
        { label: 'Floor area',  formula: `${floorAreaSqFt} sq ft`,            value: floorAreaSqFt, unit: 'sq ft' },
        { label: 'Coverage',    formula: '0.85 (allowance for layout/cuts)',   value: 0.85,          unit: 'x' },
        { label: 'Quality',     formula: `${qualMult}`,                        value: qualMult,      unit: 'x' },
        { label: 'Base qty',    formula: `${floorAreaSqFt} × 0.85 × ${qualMult}`, value: Math.round(floorAreaSqFt*0.85*qualMult), unit: 'sq ft' },
      ]
      baseQuantity = Math.round(floorAreaSqFt*0.85*qualMult)
      break
    case 'Paint':
      steps = [
        { label: 'Wall area',  formula: `${wallAreaSqFt.toFixed(0)} sq ft (walls + ceiling)`, value: wallAreaSqFt, unit: 'sq ft' },
        { label: 'Coverage',   formula: '0.30 litre/sq ft (2 coats)',                          value: 0.30,         unit: 'L/sqft' },
        { label: 'Base qty',   formula: `${wallAreaSqFt.toFixed(0)} × 0.30 × ${qualMult}`,    value: Math.round(floorAreaSqFt*0.30*qualMult*2), unit: 'Litre' },
      ]
      baseQuantity = Math.round(floorAreaSqFt*0.30*qualMult*2)
      break
    case 'Electrical Conduits':
      baseQuantity = Math.round(floorAreaSqFt*0.40)
      steps = [{ label: 'Base qty', formula: `${floorAreaSqFt} × 0.40 m/sqft`, value: baseQuantity, unit: 'm' }]
      break
    case 'Wiring':
      baseQuantity = Math.round(floorAreaSqFt*0.80)
      steps = [{ label: 'Base qty', formula: `${floorAreaSqFt} × 0.80 m/sqft`, value: baseQuantity, unit: 'm' }]
      break
    case 'Plumbing Pipes':
      baseQuantity = Math.round(floorAreaSqFt*0.25)
      steps = [{ label: 'Base qty', formula: `${floorAreaSqFt} × 0.25 m/sqft`, value: baseQuantity, unit: 'm' }]
      break
    case 'Doors':
      baseQuantity = Math.max(1, Math.round(totalFloor/120))
      steps = [{ label: 'Base qty', formula: `1 door per 120 sqft = ${baseQuantity}`, value: baseQuantity, unit: 'nos' }]
      break
    case 'Windows':
      baseQuantity = Math.max(1, Math.round(totalFloor/80))
      steps = [{ label: 'Base qty', formula: `1 window per 80 sqft = ${baseQuantity}`, value: baseQuantity, unit: 'nos' }]
      break
    case 'Roofing':
      baseQuantity = Math.round(floorAreaSqFt*1.05)
      steps = [{ label: 'Base qty', formula: `${floorAreaSqFt} × 1.05 (slope allowance)`, value: baseQuantity, unit: 'sq ft' }]
      break
    default:
      baseQuantity = 0
      steps = [{ label: 'Custom', formula: 'User-defined', value: 0, unit: '' }]
  }

  const wasteQuantity = baseQuantity * (wastePct / 100)
  const totalQuantity = baseQuantity + wasteQuantity
  const baseCost  = baseQuantity * rate
  const wasteCost = wasteQuantity * rate
  const totalCost = totalQuantity * rate

  return {
    material, category: CATS(material), unit: UNITS(material), rate,
    steps, baseQuantity, wasteQuantity: Math.round(wasteQuantity * 100) / 100,
    totalQuantity: Math.round(totalQuantity * 100) / 100,
    baseCost, wasteCost, totalCost,
  }
}

function buildSummary(calcs: MaterialCalculation[], s: ProjectSettings): CostSummary {
  const materialCost    = calcs.reduce((sum, c) => sum + c.totalCost, 0)
  const laborCost       = materialCost * (s.laborStructuralPct + s.laborFinishingPct) / 100
  const contingencyCost = (materialCost + laborCost) * s.contingency / 100
  const subtotal        = materialCost + laborCost + contingencyCost
  const taxAmount       = subtotal * s.taxRate / 100
  const grandTotal      = subtotal + taxAmount
  return { materialCost, laborCost, contingencyCost, taxAmount, grandTotal }
}

const MATERIALS = ['Cement','Sand','Aggregate','Steel','Bricks','Blocks','Concrete','Water',
  'Tiles','Paint','Electrical Conduits','Wiring','Plumbing Pipes','Doors','Windows','Roofing']

export function runAreaEstimation(input: AreaEstimationInput, rates: Record<string,number>): EstimationResult {
  const { settings: s, quality, wallThickness, structureType, area, floors } = input
  const qualMult    = s.qualityMultipliers[quality]
  const wallFactor  = wallThickness === '4.5 inch' ? 0.75 : 1.0
  const structMult  = getStructureMult(structureType)
  const ceilingH    = 10
  const wallAreaSqFt = (2 * (area + area * 0.7)) * ceilingH // approx wall area

  const calculations = MATERIALS.map(mat =>
    buildCalc(mat, area, wallAreaSqFt, qualMult, wallFactor, structMult, rates[mat] ?? 0, s.wasteFactor, floors)
  )
  const summary = buildSummary(calculations, s)

  return {
    id: genId(), projectName: input.projectName, method: 'Area Based',
    buildingType: input.buildingType, currency: input.currency,
    area: input.area, floors: input.floors, date: new Date().toLocaleDateString('en-IN'),
    calculations, summary, settings: s,
  }
}

export function runLayoutEstimation(input: LayoutEstimationInput, rates: Record<string,number>): EstimationResult {
  const { settings: s, quality, wallThickness, structureType, rooms } = input
  const qualMult   = s.qualityMultipliers[quality]
  const wallFactor = wallThickness === '4.5 inch' ? 0.75 : 1.0
  const structMult = getStructureMult(structureType)

  const totalFloor = rooms.reduce((sum, r) => sum + r.computed.floorArea, 0)
  const totalWall  = rooms.reduce((sum, r) => sum + r.computed.wallArea,  0)

  const calculations = MATERIALS.map(mat =>
    buildCalc(mat, totalFloor, totalWall, qualMult, wallFactor, structMult, rates[mat] ?? 0, s.wasteFactor, 1)
  )
  const summary = buildSummary(calculations, s)

  return {
    id: genId(), projectName: input.projectName, method: 'Layout Based',
    buildingType: input.buildingType, currency: input.currency,
    area: totalFloor, floors: 1, date: new Date().toLocaleDateString('en-IN'),
    calculations, summary, settings: s, rooms,
  }
}

export function getRatesFromRepository(repo: { name: string; rate: number }[]): Record<string,number> {
  return Object.fromEntries(repo.map(m => [m.name, m.rate]))
}
