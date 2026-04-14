export type Materials = {
    floor_m2: number
    mortar_bags: number
    grout_kg: number
}

export type PaintMaterials = {
    paint_liters: number
    massa_corrida_kg: number
    fundo_liters: number
}

export type FloorCalculationResponse = {
    labor_cost: number
    material_cost: number
    total_cost: number
    materials: Materials
    estimated_days: number
}

export type PaintCalculationResponse = {
    labor_cost: number
    material_cost: number
    total_cost: number
    paint_materials: PaintMaterials
    estimated_days: number
}

export type DemolitionResponse = {
    labor_cost: number
    total_cost: number
    estimated_days: number
}

export type CalculationResult = FloorCalculationResponse | PaintCalculationResponse | DemolitionResponse

export function isFloorResult(r: CalculationResult): r is FloorCalculationResponse {
    return "materials" in r
}

export function isPaintResult(r: CalculationResult): r is PaintCalculationResponse {
    return "paint_materials" in r
}

export function isDemolitionResult(r: CalculationResult): r is DemolitionResponse {
    return !("materials" in r) && !("paint_materials" in r)
}