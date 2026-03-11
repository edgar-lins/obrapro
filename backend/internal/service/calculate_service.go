package service

import (
	"errors"

	"github.com/edgar-lins/obrapro/internal/calculator"
	"github.com/edgar-lins/obrapro/internal/model"
)

type CalculateService struct{}

func NewCalculateService() *CalculateService {
	return &CalculateService{}
}

func (s *CalculateService) CalculateFloor(req model.FloorCalculationRequest) (model.FloorCalculationResponse, error) {
	err := validateRequest(req)
	if err != nil {
		return model.FloorCalculationResponse{}, err
	}

	result := calculator.CalculateFloor(req)

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
