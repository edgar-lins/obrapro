package model

import "time"

type Obra struct {
	ID            int       `json:"id"`
	UserID        int       `json:"user_id"`
	Name          string    `json:"name"`
	ClientName    string    `json:"client_name"`
	ClientPhone   string    `json:"client_phone"`
	ClientAddress string    `json:"client_address"`
	Status        string    `json:"status"` // orcado | em_andamento | concluido
	TotalCost     float64   `json:"total_cost"`
	LaborCost     float64   `json:"labor_cost"`
	MaterialCost  float64   `json:"material_cost"`
	EstimatedDays int       `json:"estimated_days"`
	Stages        []ObraStage `json:"stages,omitempty"`
	Expenses      []ObraExpense `json:"expenses,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ObraStage struct {
	ID             int     `json:"id"`
	ObraID         int     `json:"obra_id"`
	ServiceType    string  `json:"service_type"`
	Environment    string  `json:"environment"`
	Area           float64 `json:"area"`
	FloorType      string  `json:"floor_type"`
	PaintType      string  `json:"paint_type"`
	Coats          int     `json:"coats"`
	DemolitionType string  `json:"demolition_type"`
	LaborCost      float64 `json:"labor_cost"`
	MaterialCost   float64 `json:"material_cost"`
	TotalCost      float64 `json:"total_cost"`
	EstimatedDays  int     `json:"estimated_days"`
	Status         string  `json:"status"` // pendente | em_andamento | concluido
}

type ObraExpense struct {
	ID          int     `json:"id"`
	ObraID      int     `json:"obra_id"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category"` // material | mao_de_obra | outro
	CreatedAt   string  `json:"created_at"`
}

// Requests

type CreateObraRequest struct {
	Name          string              `json:"name"`
	ClientName    string              `json:"client_name"`
	ClientPhone   string              `json:"client_phone"`
	ClientAddress string              `json:"client_address"`
	Stages        []CreateStageInput  `json:"stages"`
}

type CreateStageInput struct {
	ServiceType    string  `json:"service_type"`
	Environment    string  `json:"environment"`
	Area           float64 `json:"area"`
	FloorType      string  `json:"floor_type"`
	PaintType      string  `json:"paint_type"`
	Coats          int     `json:"coats"`
	DemolitionType string  `json:"demolition_type"`
	LaborCost      float64 `json:"labor_cost"`
	MaterialCost   float64 `json:"material_cost"`
	TotalCost      float64 `json:"total_cost"`
	EstimatedDays  int     `json:"estimated_days"`
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

type AddExpenseRequest struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category"`
}
