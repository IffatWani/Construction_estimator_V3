/**
 * QUANTITY DRIVERS — The single source of truth for every assumption used in calculations.
 *
 * Every number that influences a quantity lives here.
 * Nothing is hardcoded in the engine — every value is looked up from this object.
 * Users can inspect and edit every driver through the Quantity Drivers panel.
 */

export type DriverValueType = 'ratio' | 'factor' | 'count_rule' | 'percentage'

export interface QuantityDriver {
  id: string
  material: string         // Which material this driver belongs to
  paramName: string        // Human-readable parameter name
  symbol: string           // Short symbol used in formulas (e.g. "C_base")
  value: number            // The editable value
  unit: string             // Unit of the value (e.g. "bags/1000sqft")
  description: string      // What this value represents
  source: string           // Where this number comes from (IS code, industry practice, etc.)
  formulaRole: string      // How this value is used in the formula
  isDefault: boolean       // True = user has not modified this; shown as "default" badge
  valueType: DriverValueType
  min: number              // Minimum allowed value
  max: number              // Maximum allowed value
}

export interface QuantityDriverSet {
  [driverId: string]: QuantityDriver
}

/**
 * Default driver values — all sourced from IS:456, IS:2502, and standard industry practice.
 * Every single one is visible and editable by the user.
 */
export const DEFAULT_DRIVERS: QuantityDriverSet = {

  // ─── CEMENT ────────────────────────────────────────────────────────────────
  'cement.base_ratio': {
    id: 'cement.base_ratio', material: 'Cement', paramName: 'Base cement ratio',
    symbol: 'C_base', value: 400, unit: 'bags / 1000 sq ft',
    description: 'Cement bags required per 1000 sq ft of built-up area for RCC framed structure, standard mix (M20)',
    source: 'IS:456:2000, standard M20 mix proportion 1:1.5:3',
    formulaRole: 'Baseline quantity before quality and structure adjustments',
    isDefault: true, valueType: 'ratio', min: 100, max: 1000,
  },
  'cement.quality_economy': {
    id: 'cement.quality_economy', material: 'Cement', paramName: 'Economy quality multiplier',
    symbol: 'Q_eco', value: 0.80, unit: 'multiplier',
    description: 'Reduction factor for economy grade construction (lower grade concrete, thinner sections)',
    source: 'Industry practice — economy builds use M15 mix, ~20% less cement',
    formulaRole: 'Multiplied against base ratio when quality = Economy',
    isDefault: true, valueType: 'factor', min: 0.5, max: 1.0,
  },
  'cement.quality_standard': {
    id: 'cement.quality_standard', material: 'Cement', paramName: 'Standard quality multiplier',
    symbol: 'Q_std', value: 1.00, unit: 'multiplier',
    description: 'Baseline multiplier for standard grade (M20 concrete, IS:456 compliance)',
    source: 'IS:456:2000 standard — reference value = 1.0',
    formulaRole: 'Multiplied against base ratio when quality = Standard',
    isDefault: true, valueType: 'factor', min: 0.8, max: 1.2,
  },
  'cement.quality_premium': {
    id: 'cement.quality_premium', material: 'Cement', paramName: 'Premium quality multiplier',
    symbol: 'Q_pre', value: 1.35, unit: 'multiplier',
    description: 'Increase factor for premium construction (M30+ concrete, higher sections, waterproofing)',
    source: 'Industry practice — premium uses M30/M35, ~35% more cement',
    formulaRole: 'Multiplied against base ratio when quality = Premium',
    isDefault: true, valueType: 'factor', min: 1.0, max: 2.0,
  },
  'cement.structure_rcc': {
    id: 'cement.structure_rcc', material: 'Cement', paramName: 'RCC framed structure factor',
    symbol: 'S_rcc', value: 1.00, unit: 'multiplier',
    description: 'Structure factor for RCC framed buildings — reference value',
    source: 'IS:456:2000 — RCC frame is the reference structure type',
    formulaRole: 'Multiplied against (base × quality) for structure type adjustment',
    isDefault: true, valueType: 'factor', min: 0.5, max: 2.0,
  },
  'cement.structure_load_bearing': {
    id: 'cement.structure_load_bearing', material: 'Cement', paramName: 'Load bearing structure factor',
    symbol: 'S_lb', value: 0.90, unit: 'multiplier',
    description: 'Load bearing structures use less concrete but more masonry — cement slightly reduced',
    source: 'Industry practice — load bearing uses ~10% less structural concrete',
    formulaRole: 'Multiplied against (base × quality) when structure = Load Bearing',
    isDefault: true, valueType: 'factor', min: 0.5, max: 1.5,
  },
  'cement.structure_steel': {
    id: 'cement.structure_steel', material: 'Cement', paramName: 'Steel structure factor',
    symbol: 'S_steel', value: 1.20, unit: 'multiplier',
    description: 'Steel structures require more concrete for foundations and connections',
    source: 'Industry practice — steel frame needs heavier foundation concrete',
    formulaRole: 'Multiplied against (base × quality) when structure = Steel Structure',
    isDefault: true, valueType: 'factor', min: 0.8, max: 2.0,
  },

  // ─── SAND ──────────────────────────────────────────────────────────────────
  'sand.base_ratio': {
    id: 'sand.base_ratio', material: 'Sand', paramName: 'Base sand ratio',
    symbol: 'Sa_base', value: 1800, unit: 'cu ft / 1000 sq ft',
    description: 'Sand required per 1000 sq ft for masonry, plaster, and concrete works combined',
    source: 'IS:2116:1980 mortar mix, IS:456 concrete — combined for standard 9" wall building',
    formulaRole: 'Baseline sand volume',
    isDefault: true, valueType: 'ratio', min: 500, max: 5000,
  },
  'sand.wall_4_5_inch': {
    id: 'sand.wall_4_5_inch', material: 'Sand', paramName: '4.5-inch wall thickness factor',
    symbol: 'W_thin', value: 0.75, unit: 'multiplier',
    description: '4.5-inch (half-brick) walls use ~25% less sand than 9-inch walls',
    source: 'Standard masonry practice — half-brick = half mortar volume approximately',
    formulaRole: 'Multiplied against base ratio when wall thickness = 4.5 inch',
    isDefault: true, valueType: 'factor', min: 0.3, max: 1.0,
  },
  'sand.wall_9_inch': {
    id: 'sand.wall_9_inch', material: 'Sand', paramName: '9-inch wall thickness factor',
    symbol: 'W_full', value: 1.00, unit: 'multiplier',
    description: '9-inch (full-brick) wall — reference thickness',
    source: 'Standard masonry practice — full-brick wall reference',
    formulaRole: 'Multiplied against base ratio when wall thickness = 9 inch',
    isDefault: true, valueType: 'factor', min: 0.8, max: 1.5,
  },

  // ─── AGGREGATE ─────────────────────────────────────────────────────────────
  'aggregate.base_ratio': {
    id: 'aggregate.base_ratio', material: 'Aggregate', paramName: 'Base aggregate ratio',
    symbol: 'Ag_base', value: 2200, unit: 'cu ft / 1000 sq ft',
    description: 'Coarse aggregate (20mm down) for concrete works per 1000 sq ft built-up area',
    source: 'IS:456:2000 M20 mix — 1:1.5:3, aggregate ~1.5× sand volume',
    formulaRole: 'Baseline aggregate volume',
    isDefault: true, valueType: 'ratio', min: 500, max: 6000,
  },

  // ─── STEEL ─────────────────────────────────────────────────────────────────
  'steel.base_ratio': {
    id: 'steel.base_ratio', material: 'Steel', paramName: 'Base steel ratio',
    symbol: 'St_base', value: 4000, unit: 'kg / 1000 sq ft',
    description: 'Reinforcement steel (TMT Fe-500) per 1000 sq ft for RCC residential building',
    source: 'IS:456:2000, SP:34 — typical residential RCC: 4–5 kg/sq ft (4000 kg/1000sqft)',
    formulaRole: 'Baseline steel weight',
    isDefault: true, valueType: 'ratio', min: 1000, max: 12000,
  },

  // ─── BRICKS ────────────────────────────────────────────────────────────────
  'bricks.base_ratio': {
    id: 'bricks.base_ratio', material: 'Bricks', paramName: 'Base bricks ratio',
    symbol: 'Br_base', value: 8000, unit: 'nos / 1000 sq ft',
    description: 'Number of standard modular bricks (190×90×90mm) per 1000 sq ft for 9-inch walls',
    source: 'IS:1905:1987 — 500 bricks/cu m × wall volume; 9-inch wall ~16 bricks/sq ft',
    formulaRole: 'Baseline brick count',
    isDefault: true, valueType: 'ratio', min: 2000, max: 20000,
  },

  // ─── BLOCKS ────────────────────────────────────────────────────────────────
  'blocks.base_ratio': {
    id: 'blocks.base_ratio', material: 'Blocks', paramName: 'Base blocks ratio',
    symbol: 'Bl_base', value: 2000, unit: 'nos / 1000 sq ft',
    description: 'AAC/Hollow concrete blocks (600×200×200mm) per 1000 sq ft as alternative to bricks',
    source: 'Industry practice — AAC blocks: ~8 blocks/sq m wall area',
    formulaRole: 'Baseline block count',
    isDefault: true, valueType: 'ratio', min: 500, max: 6000,
  },

  // ─── CONCRETE ──────────────────────────────────────────────────────────────
  'concrete.base_ratio': {
    id: 'concrete.base_ratio', material: 'Concrete', paramName: 'Base concrete ratio',
    symbol: 'Co_base', value: 120, unit: 'cu m / 1000 sq ft',
    description: 'Ready-mix or site-mixed concrete volume per 1000 sq ft (footings, columns, beams, slabs)',
    source: 'IS:456:2000 structural design practice — typical RCC frame: 0.12 cu m/sq ft',
    formulaRole: 'Baseline concrete volume',
    isDefault: true, valueType: 'ratio', min: 30, max: 400,
  },

  // ─── WATER ─────────────────────────────────────────────────────────────────
  'water.base_ratio': {
    id: 'water.base_ratio', material: 'Water', paramName: 'Base water ratio',
    symbol: 'Wa_base', value: 15000, unit: 'litres / 1000 sq ft',
    description: 'Water for construction (curing, mixing, masonry) per 1000 sq ft',
    source: 'IS:456:2000 curing requirements — 28-day curing, 7 litres/sq m/day',
    formulaRole: 'Baseline water volume',
    isDefault: true, valueType: 'ratio', min: 3000, max: 50000,
  },

  // ─── TILES ─────────────────────────────────────────────────────────────────
  'tiles.floor_coverage': {
    id: 'tiles.floor_coverage', material: 'Tiles', paramName: 'Floor tile coverage factor',
    symbol: 'T_cov', value: 0.85, unit: 'multiplier on floor area',
    description: 'Fraction of floor area tiled after allowance for walls, columns, and cut waste',
    source: 'Industry practice — typically 85% of built-up area is tiled floor',
    formulaRole: 'Floor area × coverage factor = tiled area before waste',
    isDefault: true, valueType: 'factor', min: 0.5, max: 1.0,
  },
  'tiles.waste_factor': {
    id: 'tiles.waste_factor', material: 'Tiles', paramName: 'Tile cutting waste',
    symbol: 'T_waste', value: 0.10, unit: 'fraction of tiled area',
    description: 'Extra tiles ordered to account for cuts, breakage, and pattern matching',
    source: 'Industry practice — 10% wastage standard for regular layouts; 15% for diagonal',
    formulaRole: 'Added to net tiled area: total = tiled area × (1 + waste)',
    isDefault: true, valueType: 'factor', min: 0.05, max: 0.30,
  },

  // ─── PAINT ─────────────────────────────────────────────────────────────────
  'paint.coverage_rate': {
    id: 'paint.coverage_rate', material: 'Paint', paramName: 'Paint coverage rate',
    symbol: 'P_cov', value: 0.14, unit: 'litres / sq ft (2 coats)',
    description: 'Paint volume per sq ft of paintable surface for 2 coats (primer + 2 finish coats)',
    source: 'IS:101 — typical emulsion coverage: 12–14 sq m/litre; 0.14 L/sqft for 2 coats',
    formulaRole: 'Paintable area × coverage rate = total litres',
    isDefault: true, valueType: 'ratio', min: 0.05, max: 0.30,
  },
  'paint.area_multiplier': {
    id: 'paint.area_multiplier', material: 'Paint', paramName: 'Paintable area factor',
    symbol: 'P_area', value: 3.50, unit: 'multiplier on floor area',
    description: 'Walls + ceiling area as multiple of floor area (both sides of walls, ceiling)',
    source: 'Geometry: for 10ft ceiling, perimeter walls ≈ 2.5× floor area + ceiling = ~3.5×',
    formulaRole: 'Floor area × this factor = total paintable sq ft',
    isDefault: true, valueType: 'factor', min: 1.5, max: 6.0,
  },

  // ─── ELECTRICAL CONDUITS ───────────────────────────────────────────────────
  'electrical_conduits.ratio': {
    id: 'electrical_conduits.ratio', material: 'Electrical Conduits', paramName: 'Conduit length ratio',
    symbol: 'EC_ratio', value: 0.40, unit: 'm / sq ft',
    description: 'PVC conduit length per sq ft of built-up area for light and power points',
    source: 'NBC 2016 Part 8 — typical residential: 4–5 points per 100 sqft, ~0.40 m conduit/sqft',
    formulaRole: 'Floor area × ratio = total conduit metres',
    isDefault: true, valueType: 'ratio', min: 0.1, max: 1.5,
  },

  // ─── WIRING ────────────────────────────────────────────────────────────────
  'wiring.ratio': {
    id: 'wiring.ratio', material: 'Wiring', paramName: 'Wiring length ratio',
    symbol: 'W_ratio', value: 0.80, unit: 'm / sq ft',
    description: 'Electrical cable length per sq ft (includes 2.5mm² for power, 1.5mm² for lighting)',
    source: 'NBC 2016 Part 8 — wiring ~2× conduit length due to looping and returns',
    formulaRole: 'Floor area × ratio = total wiring metres',
    isDefault: true, valueType: 'ratio', min: 0.2, max: 3.0,
  },

  // ─── PLUMBING ──────────────────────────────────────────────────────────────
  'plumbing.ratio': {
    id: 'plumbing.ratio', material: 'Plumbing Pipes', paramName: 'Plumbing pipe ratio',
    symbol: 'Pl_ratio', value: 0.25, unit: 'm / sq ft',
    description: 'CPVC/uPVC pipe length per sq ft for water supply and drainage combined',
    source: 'NBC 2016 Part 9 — residential: ~1 bathroom per 120 sqft, 30m pipes each',
    formulaRole: 'Floor area × ratio = total pipe metres',
    isDefault: true, valueType: 'ratio', min: 0.05, max: 1.0,
  },

  // ─── DOORS ─────────────────────────────────────────────────────────────────
  'doors.area_per_door': {
    id: 'doors.area_per_door', material: 'Doors', paramName: 'Area per door',
    symbol: 'D_area', value: 120, unit: 'sq ft per door',
    description: 'One door assumed per this many sq ft of built-up area (all rooms + entry)',
    source: 'Industry practice — residential: 1 door per 120 sqft on average (2BHK = 10 doors)',
    formulaRole: 'Total area ÷ area_per_door = door count',
    isDefault: true, valueType: 'count_rule', min: 40, max: 400,
  },

  // ─── WINDOWS ───────────────────────────────────────────────────────────────
  'windows.area_per_window': {
    id: 'windows.area_per_window', material: 'Windows', paramName: 'Area per window',
    symbol: 'Wi_area', value: 80, unit: 'sq ft per window',
    description: 'One window assumed per this many sq ft of built-up area',
    source: 'NBC 2016 Part 3 — minimum 10% ventilation; typically 1 window per 80 sqft',
    formulaRole: 'Total area ÷ area_per_window = window count',
    isDefault: true, valueType: 'count_rule', min: 30, max: 300,
  },

  // ─── ROOFING ───────────────────────────────────────────────────────────────
  'roofing.slope_factor': {
    id: 'roofing.slope_factor', material: 'Roofing', paramName: 'Roof slope/overhang factor',
    symbol: 'R_slope', value: 1.05, unit: 'multiplier on floor area',
    description: 'Accounts for roof slope and overhang; flat roofs with small parapet = 1.05×',
    source: 'Industry practice — flat RCC roof with 600mm parapet: ~5% extra area',
    formulaRole: 'Floor area × slope factor = roofing material area',
    isDefault: true, valueType: 'factor', min: 1.0, max: 2.0,
  },

  // ─── WASTE & CONTINGENCY (global) ─────────────────────────────────────────
  'global.waste_factor': {
    id: 'global.waste_factor', material: 'All Materials', paramName: 'Material waste factor',
    symbol: 'W_pct', value: 5, unit: '% of base quantity',
    description: 'Additional material ordered to account for breakage, cutting waste, and site losses',
    source: 'IS:456:2000 clause 14.2 — 5% wastage commonly specified in BOQ documents',
    formulaRole: 'Waste qty = base qty × (waste% / 100); Total qty = base + waste',
    isDefault: true, valueType: 'percentage', min: 0, max: 30,
  },
  'global.labor_structural': {
    id: 'global.labor_structural', material: 'All Materials', paramName: 'Structural labor rate',
    symbol: 'L_str', value: 25, unit: '% of material cost',
    description: 'Labor cost for structural works (excavation, concrete, steel fixing, formwork)',
    source: 'CPWD DSR 2023 — structural labor typically 20–30% of material cost',
    formulaRole: 'Material cost × labor% = structural labor cost',
    isDefault: true, valueType: 'percentage', min: 0, max: 100,
  },
  'global.labor_finishing': {
    id: 'global.labor_finishing', material: 'All Materials', paramName: 'Finishing labor rate',
    symbol: 'L_fin', value: 15, unit: '% of material cost',
    description: 'Labor cost for finishing works (tiling, painting, plumbing, electrical fitting)',
    source: 'CPWD DSR 2023 — finishing labor typically 12–18% of material cost',
    formulaRole: 'Material cost × labor% = finishing labor cost',
    isDefault: true, valueType: 'percentage', min: 0, max: 100,
  },
  'global.contingency': {
    id: 'global.contingency', material: 'All Materials', paramName: 'Contingency allowance',
    symbol: 'Cont', value: 3, unit: '% of (material + labor)',
    description: 'Buffer for unforeseen work, price escalation, and scope changes',
    source: 'Industry practice — standard BOQ contingency: 3–5%',
    formulaRole: '(Material + labor) × contingency% = contingency amount',
    isDefault: true, valueType: 'percentage', min: 0, max: 20,
  },
  'global.tax': {
    id: 'global.tax', material: 'All Materials', paramName: 'Tax rate (GST)',
    symbol: 'Tax', value: 18, unit: '% of subtotal',
    description: 'GST applicable on construction services and materials',
    source: 'GST Act 2017 — construction services: 18% GST (12% for affordable housing)',
    formulaRole: '(Material + labor + contingency) × tax% = tax amount',
    isDefault: true, valueType: 'percentage', min: 0, max: 50,
  },
}

/** Return a fresh deep copy of the default drivers */
export function getDefaultDrivers(): QuantityDriverSet {
  return JSON.parse(JSON.stringify(DEFAULT_DRIVERS))
}

/** Group drivers by material for the UI panel */
export function groupDriversByMaterial(drivers: QuantityDriverSet): Record<string, QuantityDriver[]> {
  const groups: Record<string, QuantityDriver[]> = {}
  for (const d of Object.values(drivers)) {
    if (!groups[d.material]) groups[d.material] = []
    groups[d.material].push(d)
  }
  return groups
}

/** How many drivers have been modified from defaults */
export function countModifiedDrivers(drivers: QuantityDriverSet): number {
  return Object.values(drivers).filter(d => !d.isDefault).length
}
