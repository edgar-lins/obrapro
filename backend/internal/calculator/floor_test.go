package calculator

import (
	"testing"

	"github.com/edgar-lins/obrapro/internal/model"
)

func TestCalculateFloor(t *testing.T) {
	req := model.FloorCalculationRequest{
		FloorType:   "porcelain",
		Area:        40,
		Environment: "living_room",
	}

	result := CalculateFloor(req)

	if result.LaborCost <= 0 {
		t.Errorf("expected labor cost greater than zero")
	}
	if result.Materials.FloorM2 <= 40 {
		t.Errorf("expected material area with loss ")
	}
	if result.EstimatedDays == 0 {
		t.Errorf("expected estimated days > 0")
	}
}
