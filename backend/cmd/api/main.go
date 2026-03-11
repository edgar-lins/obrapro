package main

import (
	"log"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/database"
	"github.com/edgar-lins/obrapro/internal/handler"
	"github.com/edgar-lins/obrapro/internal/repository"
	"github.com/edgar-lins/obrapro/internal/service"
	"github.com/edgar-lins/obrapro/pkg/utils"
	"github.com/go-chi/chi"
)

func main() {
	utils.InitLogger()
	utils.Log.Info("starting ObraPro API")

	r := chi.NewRouter()

	db := database.NewConnection()
	projectRepo := repository.NewProjectRepository(db)
	calcService := service.NewCalculateService(projectRepo)
	calcHandler := handler.NewCalculateHandler(calcService)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("🚀 API running"))
	})

	r.Post("/calculate/floor", calcHandler.CalculateFloor)
	r.Get("/projects", calcHandler.GetProjects)

	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", r)
}
