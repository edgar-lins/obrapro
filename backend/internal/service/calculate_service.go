package service

import (
	"errors"

	"github.com/edgar-lins/obrapro/internal/calculator"
	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/repository"
)

type CalculateService struct {
	repo      *repository.ProjectRepository
	priceRepo *repository.PriceRepository // <-- Adicionámos o repositório de preços
}

// Atualizámos para receber o priceRepo
func NewCalculateService(repo *repository.ProjectRepository, priceRepo *repository.PriceRepository) *CalculateService {
	return &CalculateService{repo: repo, priceRepo: priceRepo}
}

func (s *CalculateService) CalculateFloor(req model.FloorCalculationRequest, userID int) (model.FloorCalculationResponse, error) {
	err := validateRequest(req)
	if err != nil {
		return model.FloorCalculationResponse{}, err
	}

	// 1. Vamos buscar os preços personalizados deste utilizador!
	userPrices, err := s.priceRepo.GetByUserID(userID)
	if err != nil {
		return model.FloorCalculationResponse{}, err
	}

	// 2. Enviamos os preços para a calculadora
	result := calculator.CalculateFloor(req, *userPrices)

	project := model.Project{
		UserID:         userID,
		FloorType:      req.FloorType,
		Area:           req.Area,
		RemoveOldFloor: req.RemoveOldFloor,
		Environment:    req.Environment,
		LaborCost:      result.LaborCost,
	}

	s.repo.Save(project)

	return result, nil
}

func validateRequest(req model.FloorCalculationRequest) error {
	if req.Area <= 0 {
		return errors.New("area must be greater than zero")
	}
	if req.FloorType == "" {
		return errors.New("floor_type is required")
	}
	if req.Environment == "" {
		return errors.New("environment is required")
	}

	return nil
}

func (s *CalculateService) GetProjects(userID int) ([]model.Project, error) {
	return s.repo.FindAll(userID)
}
