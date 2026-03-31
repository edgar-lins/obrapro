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
}
