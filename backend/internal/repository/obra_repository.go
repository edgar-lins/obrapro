package repository

import (
	"context"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ObraRepository struct {
	db *pgxpool.Pool
}

func NewObraRepository(db *pgxpool.Pool) *ObraRepository {
	return &ObraRepository{db: db}
}

func (r *ObraRepository) Create(req model.CreateObraRequest, userID int) (model.Obra, error) {
	ctx := context.Background()

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return model.Obra{}, err
	}
	defer tx.Rollback(ctx)

	// Compute totals from stages
	var totalLabor, totalMaterial, totalCost float64
	var totalDays int
	for _, s := range req.Stages {
		totalLabor += s.LaborCost
		totalMaterial += s.MaterialCost
		totalCost += s.TotalCost
		totalDays += s.EstimatedDays
	}

	var obra model.Obra
	err = tx.QueryRow(ctx, `
		INSERT INTO obras (user_id, name, client_name, client_phone, client_address,
		                   labor_cost, material_cost, total_cost, estimated_days)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, name, client_name, client_phone, client_address,
		          status, total_cost, labor_cost, material_cost, estimated_days, created_at, updated_at
	`, userID, req.Name, req.ClientName, req.ClientPhone, req.ClientAddress,
		totalLabor, totalMaterial, totalCost, totalDays,
	).Scan(
		&obra.ID, &obra.UserID, &obra.Name, &obra.ClientName, &obra.ClientPhone, &obra.ClientAddress,
		&obra.Status, &obra.TotalCost, &obra.LaborCost, &obra.MaterialCost, &obra.EstimatedDays,
		&obra.CreatedAt, &obra.UpdatedAt,
	)
	if err != nil {
		return model.Obra{}, err
	}

	for _, s := range req.Stages {
		var stage model.ObraStage
		err = tx.QueryRow(ctx, `
			INSERT INTO obra_stages (obra_id, service_type, environment, area,
			                         floor_type, paint_type, coats, demolition_type,
			                         labor_cost, material_cost, total_cost, estimated_days)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
			RETURNING id, obra_id, service_type, environment, area,
			          floor_type, paint_type, coats, demolition_type,
			          labor_cost, material_cost, total_cost, estimated_days, status
		`, obra.ID, s.ServiceType, s.Environment, s.Area,
			s.FloorType, s.PaintType, s.Coats, s.DemolitionType,
			s.LaborCost, s.MaterialCost, s.TotalCost, s.EstimatedDays,
		).Scan(
			&stage.ID, &stage.ObraID, &stage.ServiceType, &stage.Environment, &stage.Area,
			&stage.FloorType, &stage.PaintType, &stage.Coats, &stage.DemolitionType,
			&stage.LaborCost, &stage.MaterialCost, &stage.TotalCost, &stage.EstimatedDays, &stage.Status,
		)
		if err != nil {
			return model.Obra{}, err
		}
		obra.Stages = append(obra.Stages, stage)
	}

	if err = tx.Commit(ctx); err != nil {
		return model.Obra{}, err
	}

	return obra, nil
}

func (r *ObraRepository) FindAll(userID int) ([]model.Obra, error) {
	rows, err := r.db.Query(context.Background(), `
		SELECT id, user_id, name, client_name, client_phone, client_address,
		       status, total_cost, labor_cost, material_cost, estimated_days, created_at, updated_at
		FROM obras
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var obras []model.Obra
	for rows.Next() {
		var o model.Obra
		err := rows.Scan(
			&o.ID, &o.UserID, &o.Name, &o.ClientName, &o.ClientPhone, &o.ClientAddress,
			&o.Status, &o.TotalCost, &o.LaborCost, &o.MaterialCost, &o.EstimatedDays,
			&o.CreatedAt, &o.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		obras = append(obras, o)
	}
	return obras, nil
}

func (r *ObraRepository) FindByID(id, userID int) (model.Obra, error) {
	ctx := context.Background()

	var obra model.Obra
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, name, client_name, client_phone, client_address,
		       status, total_cost, labor_cost, material_cost, estimated_days, created_at, updated_at
		FROM obras
		WHERE id = $1 AND user_id = $2
	`, id, userID).Scan(
		&obra.ID, &obra.UserID, &obra.Name, &obra.ClientName, &obra.ClientPhone, &obra.ClientAddress,
		&obra.Status, &obra.TotalCost, &obra.LaborCost, &obra.MaterialCost, &obra.EstimatedDays,
		&obra.CreatedAt, &obra.UpdatedAt,
	)
	if err != nil {
		return model.Obra{}, err
	}

	stageRows, err := r.db.Query(ctx, `
		SELECT id, obra_id, service_type, environment, area,
		       floor_type, paint_type, coats, demolition_type,
		       labor_cost, material_cost, total_cost, estimated_days, status
		FROM obra_stages
		WHERE obra_id = $1
		ORDER BY id
	`, obra.ID)
	if err != nil {
		return model.Obra{}, err
	}
	defer stageRows.Close()
	for stageRows.Next() {
		var s model.ObraStage
		err := stageRows.Scan(
			&s.ID, &s.ObraID, &s.ServiceType, &s.Environment, &s.Area,
			&s.FloorType, &s.PaintType, &s.Coats, &s.DemolitionType,
			&s.LaborCost, &s.MaterialCost, &s.TotalCost, &s.EstimatedDays, &s.Status,
		)
		if err != nil {
			return model.Obra{}, err
		}
		obra.Stages = append(obra.Stages, s)
	}

	expRows, err := r.db.Query(ctx, `
		SELECT id, obra_id, description, amount, category, created_at
		FROM obra_expenses
		WHERE obra_id = $1
		ORDER BY created_at DESC
	`, obra.ID)
	if err != nil {
		return model.Obra{}, err
	}
	defer expRows.Close()
	for expRows.Next() {
		var e model.ObraExpense
		err := expRows.Scan(&e.ID, &e.ObraID, &e.Description, &e.Amount, &e.Category, &e.CreatedAt)
		if err != nil {
			return model.Obra{}, err
		}
		obra.Expenses = append(obra.Expenses, e)
	}

	return obra, nil
}

func (r *ObraRepository) UpdateStatus(id, userID int, status string) error {
	_, err := r.db.Exec(context.Background(), `
		UPDATE obras SET status = $1, updated_at = NOW()
		WHERE id = $2 AND user_id = $3
	`, status, id, userID)
	return err
}

func (r *ObraRepository) UpdateStageStatus(stageID, obraID, userID int, status string) error {
	_, err := r.db.Exec(context.Background(), `
		UPDATE obra_stages s SET status = $1
		FROM obras o
		WHERE s.id = $2 AND s.obra_id = $3 AND o.id = s.obra_id AND o.user_id = $4
	`, status, stageID, obraID, userID)
	return err
}

func (r *ObraRepository) AddExpense(obraID, userID int, req model.AddExpenseRequest) (model.ObraExpense, error) {
	var exp model.ObraExpense
	err := r.db.QueryRow(context.Background(), `
		INSERT INTO obra_expenses (obra_id, description, amount, category)
		SELECT $1, $2, $3, $4 WHERE EXISTS (
			SELECT 1 FROM obras WHERE id = $1 AND user_id = $5
		)
		RETURNING id, obra_id, description, amount, category, created_at
	`, obraID, req.Description, req.Amount, req.Category, userID).Scan(
		&exp.ID, &exp.ObraID, &exp.Description, &exp.Amount, &exp.Category, &exp.CreatedAt,
	)
	return exp, err
}
