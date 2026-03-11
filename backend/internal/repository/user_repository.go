package repository

import (
	"context"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user model.User) error {
	query := `
	INSERT INTO users (email, password)
	VALUES ($1, $2)
	`
	_, err := r.db.Exec(
		context.Background(),
		query,
		user.Email,
		user.Password,
	)
	return err
}

func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	query := `
	SELECT id, email, password, created_at
	FROM users
	WHERE email=$1
	`

	row := r.db.QueryRow(context.Background(), query, email)

	var user model.User
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
