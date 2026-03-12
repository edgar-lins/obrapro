package app

import (
	"net/http"

	"github.com/edgar-lins/obrapro/internal/database"
	"github.com/edgar-lins/obrapro/internal/handler"
	"github.com/edgar-lins/obrapro/internal/middleware"
	"github.com/edgar-lins/obrapro/internal/repository"
	"github.com/edgar-lins/obrapro/internal/service"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
)

func NewRouter() http.Handler {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	db := database.NewConnection()

	projectRepo := repository.NewProjectRepository(db)
	calcService := service.NewCalculateService(projectRepo)
	calcHandler := handler.NewCalculateHandler(calcService)

	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	r.Post("/auth/register", authHandler.Register)
	r.Post("/auth/login", authHandler.Login)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("🚀 API running"))
	})

	r.Post("/calculate/floor", calcHandler.CalculateFloor)
	//VOLTAR COM ISSO AQUI!
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		//r.Post("/calculate/floor", calcHandler.CalculateFloor)
		r.Get("/projects", calcHandler.GetProjects)
	})

	return r
}
