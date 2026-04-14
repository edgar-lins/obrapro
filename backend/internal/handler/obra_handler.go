package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/repository"
	"github.com/edgar-lins/obrapro/pkg/utils"
	"github.com/go-chi/chi"
)

type ObraHandler struct {
	repo *repository.ObraRepository
}

func NewObraHandler(repo *repository.ObraRepository) *ObraHandler {
	return &ObraHandler{repo: repo}
}

func (h *ObraHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())

	var req model.CreateObraRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}
	if len(req.Stages) == 0 {
		http.Error(w, "at least one stage is required", http.StatusBadRequest)
		return
	}

	obra, err := h.repo.Create(req, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(obra)
}

func (h *ObraHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())

	obras, err := h.repo.FindAll(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if obras == nil {
		obras = []model.Obra{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(obras)
}

func (h *ObraHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	obra, err := h.repo.FindByID(id, userID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(obra)
}

func (h *ObraHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var req model.UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	valid := map[string]bool{"orcado": true, "em_andamento": true, "concluido": true}
	if !valid[req.Status] {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}

	if err := h.repo.UpdateStatus(id, userID, req.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObraHandler) UpdateStageStatus(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())
	obraID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid obra id", http.StatusBadRequest)
		return
	}
	stageID, err := strconv.Atoi(chi.URLParam(r, "stageId"))
	if err != nil {
		http.Error(w, "invalid stage id", http.StatusBadRequest)
		return
	}

	var req model.UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	valid := map[string]bool{"pendente": true, "em_andamento": true, "concluido": true}
	if !valid[req.Status] {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}

	if err := h.repo.UpdateStageStatus(stageID, obraID, userID, req.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObraHandler) AddExpense(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())
	obraID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var req model.AddExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if req.Description == "" || req.Amount <= 0 {
		http.Error(w, "description and amount are required", http.StatusBadRequest)
		return
	}
	if req.Category == "" {
		req.Category = "outro"
	}

	exp, err := h.repo.AddExpense(obraID, userID, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(exp)
}
