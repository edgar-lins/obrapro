package calculator

import "github.com/edgar-lins/obrapro/internal/model"

// Rendimento médio: 10m² por litro por demão (valor conservador)
const paintYieldPerLiter = 10.0

func CalculatePaint(req model.PaintCalculationRequest, prices model.PriceTable) model.PaintCalculationResponse {
	if req.Coats < 1 {
		req.Coats = 2
	}

	// Mão de obra: preço base × área × fator de demãos
	basePrice := getPaintLaborPrice(req.PaintType, prices)
	coatsFactor := 1.0 + float64(req.Coats-1)*0.35 // +35% por demão adicional
	labor := basePrice * req.Area * coatsFactor

	// Tinta necessária
	paintLiters := req.Area * float64(req.Coats) / paintYieldPerLiter

	// Extras
	var massaCorridaKg float64
	var fundoLiters float64
	materialCost := paintLiters * prices.PaintMaterialPrice

	if req.IncludeMassaCorrida {
		massaCorridaKg = req.Area * 0.5 // 0.5 kg/m²
		materialCost += massaCorridaKg * prices.MassaCorridaPrice
	}
	if req.IncludeFundo {
		fundoLiters = req.Area / 10.0 // 10m² por litro
		materialCost += fundoLiters * prices.FundoPrice
	}

	days := int(req.Area / 25)
	if days < 1 {
		days = 1
	}

	return model.PaintCalculationResponse{
		LaborCost:    labor,
		MaterialCost: materialCost,
		TotalCost:    labor + materialCost,
		Materials: model.PaintMaterials{
			PaintLiters:    roundTo1(paintLiters),
			MassaCorridaKg: roundTo1(massaCorridaKg),
			FundoLiters:    roundTo1(fundoLiters),
		},
		EstimatedDays: days,
	}
}

func getPaintLaborPrice(paintType string, prices model.PriceTable) float64 {
	switch paintType {
	case "latex":
		return prices.LatexPaintPrice
	case "esmalte":
		return prices.EnamelPaintPrice
	default: // acrilica
		return prices.AcrylicPaintPrice
	}
}

func roundTo1(v float64) float64 {
	return float64(int(v*10+0.5)) / 10
}
