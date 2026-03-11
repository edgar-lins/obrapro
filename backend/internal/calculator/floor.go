package calculator

import "github.com/edgar-lins/obrapro/internal/model"

func CalculateFloor(req model.FloorCalculationRequest) model.FloorCalculationResponse {
	basePrice := getBasePrice(req.FloorType)
	labor := basePrice * req.Area

	if req.RemoveOldFloor {
		labor *= 1.3
	}
	if req.Environment == "bathroom" {
		labor *= 1.2
	}
	if req.Environment == "external" {
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

func getBasePrice(floorType string) float64 {
	switch floorType {
	case "porcelain":
		return 100
	case "ceramic":
		return 70
	case "vinyl":
		return 60
	default:
		return 80
	}
}
