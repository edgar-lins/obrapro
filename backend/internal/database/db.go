package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewConnection() *pgxpool.Pool {
	databaseUrl := "postgres://postgres:postgres@localhost:5432/obrapro"

	pool, err := pgxpool.New(context.Background(), databaseUrl)
	if err != nil {
		log.Fatal("Unable to connect to database: ", err)
	}

	return pool
}
