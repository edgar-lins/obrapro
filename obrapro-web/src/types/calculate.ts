export type Materials = {
    floor_m2: number
    mortar_bags: number
    grout_kg: number
}

export type FloorCalculationResponse = {
    labor_cost: number
    materials: Materials
    estimated_days: number
}