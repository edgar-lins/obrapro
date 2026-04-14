package calculator

import "github.com/edgar-lins/obrapro/internal/model"

func CalculateDemolition(req model.DemolitionRequest, prices model.PriceTable) model.DemolitionResponse {
	basePrice := prices.DemolitionManualPrice
	if req.Type == "mecanica" {
		basePrice = prices.DemolitionMechanicalPrice
	}

	labor := basePrice * req.Area

	if req.IncludeDisposal {
		labor *= 1.25 // +25% para retirada e descarte de entulho
	}

	days := int(req.Area / 20)
	if days < 1 {
		days = 1
	}

	return model.DemolitionResponse{
		LaborCost:     labor,
		TotalCost:     labor,
		EstimatedDays: days,
	}
}
