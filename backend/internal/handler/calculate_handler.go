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

	result, err := h.service.CalculateFloor(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *CalculateHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.service.GetProjects()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}
