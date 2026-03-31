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
	SELECT id, user_id, porcelain_price, ceramic_price, vinyl_price, other_price
	FROM price_tables
	WHERE user_id = $1
	`

	var pt model.PriceTable
	err := r.db.QueryRow(context.Background(), query, userID).Scan(
		&pt.ID,
		&pt.UserID,
		&pt.PorcelainPrice,
		&pt.CeramicPrice,
		&pt.VinylPrice,
		&pt.OtherPrice,
	)

	if err != nil {
		// Se der erro (ex: utilizador ainda não configurou preços), devolvemos os preços default
		return &model.PriceTable{
			PorcelainPrice: 100,
			CeramicPrice:   70,
			VinylPrice:     60,
			OtherPrice:     80,
		}, nil
	}

	return &pt, nil
}

// Guarda ou atualiza os preços
func (r *PriceRepository) Upsert(pt model.PriceTable) error {
	query := `
	INSERT INTO price_tables (user_id, porcelain_price, ceramic_price, vinyl_price, other_price)
	VALUES ($1, $2, $3, $4, $5)
	ON CONFLICT (user_id) 
	DO UPDATE SET 
		porcelain_price = EXCLUDED.porcelain_price,
		ceramic_price = EXCLUDED.ceramic_price,
		vinyl_price = EXCLUDED.vinyl_price,
		other_price = EXCLUDED.other_price,
		updated_at = CURRENT_TIMESTAMP;
	`
	_, err := r.db.Exec(context.Background(), query, pt.UserID, pt.PorcelainPrice, pt.CeramicPrice, pt.VinylPrice, pt.OtherPrice)
	return err
}
