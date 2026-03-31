package calculator

import "github.com/edgar-lins/obrapro/internal/model"

// Repara que agora recebemos a tabela de preços do utilizador como argumento
func CalculateFloor(req model.FloorCalculationRequest, prices model.PriceTable) model.FloorCalculationResponse {
	basePrice := getBasePrice(req.FloorType, prices)
	labor := basePrice * req.Area

	if req.RemoveOldFloor {
		labor *= 1.3
	}
	if req.Environment == "bathroom" || req.Environment == "banheiro" {
		labor *= 1.2
	}
	if req.Environment == "external" || req.Environment == "externo" {
		labor *= 1.15
	}

	floorWithLoss := req.Area * 1.10
	mortarBags := int(req.Area / 4)
	groutKg := int(req.Area / 10)

	days := int(req.Area / 15)
	if days < 1 {
		days = 1
	}

	return model.FloorCalculationResponse{
		LaborCost: labor,
		Materials: model.Materials{
			FloorM2:    floorWithLoss,
			MortarBags: mortarBags,
			GroutKg:    groutKg,
		},
		EstimatedDays: days,
	}
}

// Agora usamos os preços do utilizador em vez de valores fixos!
func getBasePrice(floorType string, prices model.PriceTable) float64 {
	switch floorType {
	case "porcelain", "porcelanato":
		return prices.PorcelainPrice
	case "ceramic", "ceramica":
		return prices.CeramicPrice
	case "vinyl", "vinilico":
		return prices.VinylPrice
	default:
		return prices.OtherPrice
	}
}
