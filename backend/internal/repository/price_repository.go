package repository

import (
	"context"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PriceRepository struct {
	db *pgxpool.Pool
}

func NewPriceRepository(db *pgxpool.Pool) *PriceRepository {
	return &PriceRepository{db: db}
}

// Vai buscar a tabela de preços de um utilizador (se não existir, devolvemos os valores padrão)
func (r *PriceRepository) GetByUserID(userID int) (*model.PriceTable, error) {
	query := `
	SELECT id, user_id,
		porcelain_price, ceramic_price, vinyl_price, other_price,
		COALESCE(porcelain_material_price, 80), COALESCE(ceramic_material_price, 45),
		COALESCE(vinyl_material_price, 55), COALESCE(other_material_price, 60),
		COALESCE(acrylic_paint_price, 12), COALESCE(latex_paint_price, 10), COALESCE(enamel_paint_price, 18),
		COALESCE(paint_material_price, 25), COALESCE(massa_corrida_price, 8), COALESCE(fundo_price, 20)
	FROM price_tables
	WHERE user_id = $1
	`

	var pt model.PriceTable
	err := r.db.QueryRow(context.Background(), query, userID).Scan(
		&pt.ID, &pt.UserID,
		&pt.PorcelainPrice, &pt.CeramicPrice, &pt.VinylPrice, &pt.OtherPrice,
		&pt.PorcelainMaterialPrice, &pt.CeramicMaterialPrice, &pt.VinylMaterialPrice, &pt.OtherMaterialPrice,
		&pt.AcrylicPaintPrice, &pt.LatexPaintPrice, &pt.EnamelPaintPrice,
		&pt.PaintMaterialPrice, &pt.MassaCorridaPrice, &pt.FundoPrice,
	)

	if err != nil {
		return &model.PriceTable{
			PorcelainPrice: 100, CeramicPrice: 70, VinylPrice: 60, OtherPrice: 80,
			PorcelainMaterialPrice: 80, CeramicMaterialPrice: 45, VinylMaterialPrice: 55, OtherMaterialPrice: 60,
			AcrylicPaintPrice: 12, LatexPaintPrice: 10, EnamelPaintPrice: 18,
			PaintMaterialPrice: 25, MassaCorridaPrice: 8, FundoPrice: 20,
		}, nil
	}

	return &pt, nil
}

// Guarda ou atualiza os preços
func (r *PriceRepository) Upsert(pt model.PriceTable) error {
	query := `
	INSERT INTO price_tables (
		user_id, porcelain_price, ceramic_price, vinyl_price, other_price,
		porcelain_material_price, ceramic_material_price, vinyl_material_price, other_material_price,
		acrylic_paint_price, latex_paint_price, enamel_paint_price,
		paint_material_price, massa_corrida_price, fundo_price
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	ON CONFLICT (user_id)
	DO UPDATE SET
		porcelain_price = EXCLUDED.porcelain_price,
		ceramic_price = EXCLUDED.ceramic_price,
		vinyl_price = EXCLUDED.vinyl_price,
		other_price = EXCLUDED.other_price,
		porcelain_material_price = EXCLUDED.porcelain_material_price,
		ceramic_material_price = EXCLUDED.ceramic_material_price,
		vinyl_material_price = EXCLUDED.vinyl_material_price,
		other_material_price = EXCLUDED.other_material_price,
		acrylic_paint_price = EXCLUDED.acrylic_paint_price,
		latex_paint_price = EXCLUDED.latex_paint_price,
		enamel_paint_price = EXCLUDED.enamel_paint_price,
		paint_material_price = EXCLUDED.paint_material_price,
		massa_corrida_price = EXCLUDED.massa_corrida_price,
		fundo_price = EXCLUDED.fundo_price,
		updated_at = CURRENT_TIMESTAMP;
	`
	_, err := r.db.Exec(context.Background(), query,
		pt.UserID,
		pt.PorcelainPrice, pt.CeramicPrice, pt.VinylPrice, pt.OtherPrice,
		pt.PorcelainMaterialPrice, pt.CeramicMaterialPrice, pt.VinylMaterialPrice, pt.OtherMaterialPrice,
		pt.AcrylicPaintPrice, pt.LatexPaintPrice, pt.EnamelPaintPrice,
		pt.PaintMaterialPrice, pt.MassaCorridaPrice, pt.FundoPrice,
	)
	return err
}
