package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi"
)

func main() {
	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("🚀 API running"))
	})

	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", r)
}
