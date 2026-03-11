package model

import "time"

type Project struct {
	ID             int       `json:"id"`
	UserID         int       `json:"user_id"`
	FloorType      string    `json:"floor_type"`
	Area           float64   `json:"area"`
	RemoveOldFloor bool      `json:"remove_old_floor"`
	Environment    string    `json:"environment"`
	LaborCost      float64   `json:"labor_cost"`
	CreatedAt      time.Time `json:"created_at"`
}
