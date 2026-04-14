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
	SELECT id, email, password, COALESCE(plan,'free'), COALESCE(stripe_customer_id,''), plan_expires_at, created_at
	FROM users
	WHERE email=$1
	`

	row := r.db.QueryRow(context.Background(), query, email)

	var user model.User
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Plan,
		&user.StripeCustomerID,
		&user.PlanExpiresAt,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) FindByID(id int) (*model.User, error) {
	var user model.User
	err := r.db.QueryRow(context.Background(), `
		SELECT id, email, password, COALESCE(plan,'free'), COALESCE(stripe_customer_id,''), plan_expires_at, created_at
		FROM users WHERE id=$1
	`, id).Scan(
		&user.ID, &user.Email, &user.Password,
		&user.Plan, &user.StripeCustomerID, &user.PlanExpiresAt, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByStripeCustomerID(customerID string) (*model.User, error) {
	var user model.User
	err := r.db.QueryRow(context.Background(), `
		SELECT id, email, password, COALESCE(plan,'free'), COALESCE(stripe_customer_id,''), plan_expires_at, created_at
		FROM users WHERE stripe_customer_id=$1
	`, customerID).Scan(
		&user.ID, &user.Email, &user.Password,
		&user.Plan, &user.StripeCustomerID, &user.PlanExpiresAt, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdatePlan(userID int, plan, stripeCustomerID string) error {
	_, err := r.db.Exec(context.Background(), `
		UPDATE users SET plan=$1, stripe_customer_id=COALESCE(NULLIF($2,''), stripe_customer_id)
		WHERE id=$3
	`, plan, stripeCustomerID, userID)
	return err
}
