package service

import (
	"github.com/edgar-lins/obrapro/internal/calculator"
	"github.com/edgar-lins/obrapro/internal/model"
)

type CalculateService struct{}

func NewCalculateService() *CalculateService {
	return &CalculateService{}
}

func (s *CalculateService) CalculateFloor(req model.FloorCalculationRequest) model.FloorCalculationResponse {
	return calculator.CalculateFloor(req)
}
