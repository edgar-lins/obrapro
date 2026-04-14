package handler

import (
	"encoding/json"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/service"
	"github.com/edgar-lins/obrapro/pkg/utils"
)

type WallHandler struct {
	service *service.CalculateService
}

func NewWallHandler(s *service.CalculateService) *WallHandler {
	return &WallHandler{service: s}
}

func (h *WallHandler) CalculateWall(w http.ResponseWriter, r *http.Request) {
	var req model.FloorCalculationRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := utils.GetUserID(r.Context())

	result, err := h.service.CalculateWall(req, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
