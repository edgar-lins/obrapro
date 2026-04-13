package handler

import (
	"encoding/json"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/service"
	"github.com/edgar-lins/obrapro/pkg/utils"
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

	userID := utils.GetUserID(r.Context())
	nosave := r.URL.Query().Get("nosave") == "true"

	result, err := h.service.CalculateFloor(req, userID, nosave)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *CalculateHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())

	projects, err := h.service.GetProjects(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}
