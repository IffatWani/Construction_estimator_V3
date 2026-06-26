export type BuildingType = 'Residential' | 'Apartment' | 'Commercial' | 'Villa' | 'Warehouse'
export type ConstructionQuality = 'Economy' | 'Standard' | 'Premium'
export type StructureType = 'RCC Framed' | 'Load Bearing' | 'Steel Structure'
export type WallThickness = '4.5 inch' | '9 inch'
export type EstimationMethod = 'Area Based' | 'Layout Based'
export type Currency = '₹' | '$' | '£' | '€'
export type MaterialCategory = 'Structure' | 'Masonry' | 'Finishing' | 'MEP' | 'Fixtures' | 'Misc'
export type RoomShape = 'Rectangle' | 'Square' | 'Circle' | 'L-Shape'
export type ProjectStatus = 'Draft' | 'Active' | 'Completed' | 'Archived'

export interface RectangleDimensions { length: number; width: number; height: number }
export interface SquareDimensions    { side: number; height: number }
export interface CircleDimensions    { radius: number; height: number }
export interface LShapeDimensions    { l1: number; w1: number; l2: number; w2: number; height: number }

export type RoomDimensions =
  | { shape: 'Rectangle'; dims: RectangleDimensions }
  | { shape: 'Square';    dims: SquareDimensions }
  | { shape: 'Circle';    dims: CircleDimensions }
  | { shape: 'L-Shape';   dims: LShapeDimensions }

export interface RoomGeometry {
  floorArea: number; wallArea: number; ceilingArea: number; perimeter: number; volume: number
}

export interface Room { id: string; name: string; geometry: RoomDimensions; computed: RoomGeometry }

export interface MaterialRateHistory { rate: number; date: string; note?: string }

export interface RepositoryMaterial {
  id: string; name: string; category: MaterialCategory; unit: string; rate: number
  supplier?: string; notes?: string; dateUpdated: string; archived: boolean
  rateHistory: MaterialRateHistory[]
}

export interface CalcStep { label: string; formula: string; value: number; unit: string }

export interface MaterialCalculation {
  material: string; category: MaterialCategory; unit: string; rate: number
  steps: CalcStep[]; baseQuantity: number; wasteQuantity: number; totalQuantity: number
  baseCost: number; wasteCost: number; totalCost: number
}

export interface ProjectMetadata {
  name: string; clientName: string; location: string
  projectType: BuildingType; notes: string; status: ProjectStatus
}

export interface ProjectRevision {
  id: string; label: string; date: string; grandTotal: number; snapshot: EstimationResult
}

export interface Project {
  id: string; metadata: ProjectMetadata; createdAt: string; updatedAt: string
  revisions: ProjectRevision[]; currentResult?: EstimationResult
}

export interface ProjectSettings {
  wasteFactor: number; contingency: number; taxRate: number
  laborStructuralPct: number; laborFinishingPct: number
  qualityMultipliers: { Economy: number; Standard: number; Premium: number }
}

export interface CostSummary {
  materialCost: number; laborCost: number; contingencyCost: number; taxAmount: number; grandTotal: number
}

export interface AreaEstimationInput {
  projectName: string; buildingType: BuildingType; currency: Currency
  area: number; floors: number; quality: ConstructionQuality
  structureType: StructureType; wallThickness: WallThickness; ceilingHeight: number
  settings: ProjectSettings
}

export interface LayoutEstimationInput {
  projectName: string; buildingType: BuildingType; currency: Currency
  rooms: Room[]; quality: ConstructionQuality; structureType: StructureType
  wallThickness: WallThickness; settings: ProjectSettings
}

export interface EstimationResult {
  id: string; projectName: string; clientName?: string; location?: string
  method: EstimationMethod; buildingType: BuildingType; currency: Currency
  area: number; floors: number; date: string
  calculations: MaterialCalculation[]; summary: CostSummary
  settings: ProjectSettings; rooms?: Room[]
}

export type InsightSeverity = 'info' | 'warning' | 'error'
export interface AIInsight { id: string; severity: InsightSeverity; material: string; message: string; detail: string }

export interface AppStore {
  repository: RepositoryMaterial[]
  addMaterial: (m: Omit<RepositoryMaterial, 'id' | 'dateUpdated' | 'archived' | 'rateHistory'>) => void
  updateMaterial: (id: string, updates: Partial<RepositoryMaterial>) => void
  deleteMaterial: (id: string) => void
  archiveMaterial: (id: string) => void
  bulkImportMaterials: (items: Array<{ name: string; unit: string; rate: number; category?: MaterialCategory }>) => void
  getMaterialRate: (name: string) => number | undefined
  settings: ProjectSettings
  updateSettings: (s: Partial<ProjectSettings>) => void
  currentResult: EstimationResult | null
  setCurrentResult: (r: EstimationResult) => void
  clearCurrentResult: () => void
  projects: Project[]
  saveProject: (result: EstimationResult, meta?: Partial<ProjectMetadata>) => void
  deleteProject: (id: string) => void
  archiveProject: (id: string) => void
  duplicateProject: (id: string) => void
  addRevision: (projectId: string, label: string) => void
  rooms: Room[]
  addRoom: (shape?: RoomShape) => void
  updateRoom: (id: string, updates: Partial<Room>) => void
  deleteRoom: (id: string) => void
  resetRooms: () => void
  currency: Currency
  setCurrency: (c: Currency) => void

  // Quantity Drivers
  drivers: Record<string, import('./quantityDrivers').QuantityDriver>
  updateDriver: (id: string, value: number) => void
  resetDriver: (id: string) => void
  resetAllDrivers: () => void

  insights: AIInsight[]
  generateInsights: (result: EstimationResult) => void
  dismissInsight: (id: string) => void
}
