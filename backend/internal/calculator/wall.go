package calculator

import "github.com/edgar-lins/obrapro/internal/model"

// CalculateWall segue a mesma lógica do piso mas com preços de parede
// (mão de obra mais cara, mesmos materiais de assentamento)
func CalculateWall(req model.FloorCalculationRequest, prices model.PriceTable) model.FloorCalculationResponse {
	basePrice := getWallLaborPrice(req.FloorType, prices)
	labor := basePrice * req.Area

	if req.RemoveOldFloor { // reutilizado como "remover revestimento antigo"
		labor *= 1.3
	}
	// Área molhada (banheiro/cozinha) exige mais cuidado nas juntas
	if req.Environment == "banheiro" || req.Environment == "cozinha" {
		labor *= 1.15
	}

	tilesWithLoss := req.Area * 1.12 // 12% quebra para parede (mais cortes)
	mortarBags := int(req.Area / 3)  // consumo ligeiramente maior que piso
	groutKg := int(req.Area / 8)

	days := int(req.Area / 12)
	if days < 1 {
		days = 1
	}

	materialPricePerM2 := getWallMaterialPrice(req.FloorType, prices)
	materialCost := materialPricePerM2 * tilesWithLoss

	return model.FloorCalculationResponse{
		LaborCost:    labor,
		MaterialCost: materialCost,
		TotalCost:    labor + materialCost,
		Materials: model.Materials{
			FloorM2:    tilesWithLoss,
			MortarBags: mortarBags,
			GroutKg:    groutKg,
		},
		EstimatedDays: days,
	}
}

func getWallLaborPrice(tileType string, prices model.PriceTable) float64 {
	switch tileType {
	case "porcelain", "porcelanato":
		return prices.WallPorcelainPrice
	case "ceramic", "ceramica":
		return prices.WallCeramicPrice
	default:
		return prices.WallOtherPrice
	}
}

// Material de parede reutiliza os preços de material de piso (mesmos azulejos)
func getWallMaterialPrice(tileType string, prices model.PriceTable) float64 {
	switch tileType {
	case "porcelain", "porcelanato":
		return prices.PorcelainMaterialPrice
	case "ceramic", "ceramica":
		return prices.CeramicMaterialPrice
	default:
		return prices.OtherMaterialPrice
	}
}
