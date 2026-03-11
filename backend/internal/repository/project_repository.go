package repository

import (
	"context"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProjectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Save(project model.Project) error {
	query := `
	INSERT INTO projects
	(floor_type, area, remove_old_floor, environment, labor_cost)
	VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(
		context.Background(),
		query,
		project.FloorType,
		project.Area,
		project.RemoveOldFloor,
		project.Environment,
		project.LaborCost,
	)

	return err
}
