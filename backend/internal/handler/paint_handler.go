package handler

import (
	"encoding/json"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/service"
	"github.com/edgar-lins/obrapro/pkg/utils"
)

type PaintHandler struct {
	service *service.CalculateService
}

func NewPaintHandler(s *service.CalculateService) *PaintHandler {
	return &PaintHandler{service: s}
}

func (h *PaintHandler) CalculatePaint(w http.ResponseWriter, r *http.Request) {
	var req model.PaintCalculationRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := utils.GetUserID(r.Context())

	result, err := h.service.CalculatePaint(req, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
