package model

import "time"

type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type PriceTable struct {
	ID             int     `json:"id"`
	UserID         int     `json:"user_id"`
	PorcelainPrice float64 `json:"porcelain_price"`
	CeramicPrice   float64 `json:"ceramic_price"`
	VinylPrice     float64 `json:"vinyl_price"`
	OtherPrice     float64 `json:"other_price"`
	// Preços de material de piso (custo de compra por m²)
	PorcelainMaterialPrice float64 `json:"porcelain_material_price"`
	CeramicMaterialPrice   float64 `json:"ceramic_material_price"`
	VinylMaterialPrice     float64 `json:"vinyl_material_price"`
	OtherMaterialPrice     float64 `json:"other_material_price"`
	// Preços de pintura — mão de obra (por m²)
	AcrylicPaintPrice float64 `json:"acrylic_paint_price"`
	LatexPaintPrice   float64 `json:"latex_paint_price"`
	EnamelPaintPrice  float64 `json:"enamel_paint_price"`
	// Preços de material de pintura
	PaintMaterialPrice  float64 `json:"paint_material_price"`  // tinta (por litro)
	MassaCorridaPrice   float64 `json:"massa_corrida_price"`   // massa corrida (por kg)
	FundoPrice          float64 `json:"fundo_price"`           // fundo preparador (por litro)
}
