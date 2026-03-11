package main

import (
	"log"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/handler"
	"github.com/edgar-lins/obrapro/internal/service"
	"github.com/go-chi/chi"
)

func main() {
	r := chi.NewRouter()

	calcService := service.NewCalculateService()
	calcHandler := handler.NewCalculateHandler(calcService)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("🚀 API running"))
	})

	r.Post("/calculate/floor", calcHandler.CalculateFloor)

	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", r)
}
