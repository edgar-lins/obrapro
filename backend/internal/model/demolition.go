package model

type DemolitionRequest struct {
	Area            float64 `json:"area"`
	Type            string  `json:"type"` // manual | mecanica
	IncludeDisposal bool    `json:"include_disposal"`
	Environment     string  `json:"environment"`
}

type DemolitionResponse struct {
	LaborCost     float64 `json:"labor_cost"`
	TotalCost     float64 `json:"total_cost"`
	EstimatedDays int     `json:"estimated_days"`
}
