package handler

import (
	"encoding/json"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/repository"
	"github.com/edgar-lins/obrapro/pkg/utils"
)

type PriceHandler struct {
	repo *repository.PriceRepository
}

func NewPriceHandler(repo *repository.PriceRepository) *PriceHandler {
	return &PriceHandler{repo: repo}
}

// Devolve os preços atuais do utilizador
func (h *PriceHandler) GetPrices(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())

	prices, err := h.repo.GetByUserID(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar preços", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prices)
}

// Atualiza os preços do utilizador
func (h *PriceHandler) UpdatePrices(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())

	var pt model.PriceTable
	err := json.NewDecoder(r.Body).Decode(&pt)
	if err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	// Garantimos que o ID do utilizador é o do token logado (segurança!)
	pt.UserID = userID

	err = h.repo.Upsert(pt)
	if err != nil {
		http.Error(w, "Erro ao guardar preços", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
