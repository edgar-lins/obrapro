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
	(user_id, floor_type, area, remove_old_floor, environment, labor_cost)
	VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(
		context.Background(),
		query,
		project.UserID,
		project.FloorType,
		project.Area,
		project.RemoveOldFloor,
		project.Environment,
		project.LaborCost,
	)

	return err
}

func (r *ProjectRepository) FindAll(userID int) ([]model.Project, error) {
	query := `
	SELECT id, user_id, floor_type, area, remove_old_floor, environment, labor_cost, created_at
	FROM projects
	WHERE user_id = $1
	ORDER BY created_at DESC
	`
	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []model.Project

	for rows.Next() {
		var p model.Project

		err := rows.Scan(
			&p.ID,
			&p.UserID,
			&p.FloorType,
			&p.Area,
			&p.RemoveOldFloor,
			&p.Environment,
			&p.LaborCost,
			&p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		projects = append(projects, p)
	}
	return projects, nil
}
