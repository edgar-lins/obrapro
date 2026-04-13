package model

type PaintCalculationRequest struct {
	PaintType           string  `json:"paint_type"`
	Area                float64 `json:"area"`
	Coats               int     `json:"coats"`
	IncludeMassaCorrida bool    `json:"include_massa_corrida"`
	IncludeFundo        bool    `json:"include_fundo"`
	Environment         string  `json:"environment"`
}

type PaintMaterials struct {
	PaintLiters      float64 `json:"paint_liters"`
	MassaCorridaKg   float64 `json:"massa_corrida_kg"`
	FundoLiters      float64 `json:"fundo_liters"`
}

type PaintCalculationResponse struct {
	LaborCost     float64        `json:"labor_cost"`
	MaterialCost  float64        `json:"material_cost"`
	TotalCost     float64        `json:"total_cost"`
	Materials     PaintMaterials `json:"paint_materials"`
	EstimatedDays int            `json:"estimated_days"`
}
