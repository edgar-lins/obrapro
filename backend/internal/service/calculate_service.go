package service

import (
	"errors"

	"github.com/edgar-lins/obrapro/internal/calculator"
	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/repository"
)

type CalculateService struct {
	repo *repository.ProjectRepository
}

func NewCalculateService(repo *repository.ProjectRepository) *CalculateService {
	return &CalculateService{repo: repo}
}

func (s *CalculateService) CalculateFloor(req model.FloorCalculationRequest) (model.FloorCalculationResponse, error) {
	err := validateRequest(req)
	if err != nil {
		return model.FloorCalculationResponse{}, err
	}

	result := calculator.CalculateFloor(req)

	project := model.Project{
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

func (s *CalculateService) GetProjects() ([]model.Project, error) {
	return s.repo.FindAll()
}
