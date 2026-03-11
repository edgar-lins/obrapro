package model

type FloorCalculationRequest struct {
	FloorType      string  `json:"floor_type"`
	Area           float64 `json:"area"`
	RemoveOldFloor bool    `json:"remove_old_floor"`
	Environment    string  `json:"environment"`
}

type Materials struct {
	FloorM2    float64 `json:"floor_m2"`
	MortarBags int     `json:"mortar_bags"`
	GroutKg    int     `json:"grout_kg"`
}

type FloorCalculationResponse struct {
	LaborCost     float64   `json:"labor_cost"`
	Materials     Materials `json:"materials"`
	EstimatedDays int       `json:"estimated_days"`
}
