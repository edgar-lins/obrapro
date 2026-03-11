package handler

import (
	"encoding/json"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/service"
)

type CalculateHandler struct {
	service *service.CalculateService
}

func NewCalculateHandler(s *service.CalculateService) *CalculateHandler {
	return &CalculateHandler{
		service: s,
	}
}

func (h *CalculateHandler) CalculateFloor(w http.ResponseWriter, r *http.Request) {
	var req model.FloorCalculationRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result := h.service.CalculateFloor(req)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
