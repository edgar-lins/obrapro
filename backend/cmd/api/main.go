package main

import (
	"log"
	"net/http"

	"github.com/edgar-lins/obrapro/internal/app"
	"github.com/edgar-lins/obrapro/pkg/utils"
)

func main() {
	utils.InitLogger()
	utils.Log.Info("starting ObraPro API")

	router := app.NewRouter()

	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", router)
}
