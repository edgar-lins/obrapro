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
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	db := database.NewConnection()

	priceRepo := repository.NewPriceRepository(db)
	priceHandler := handler.NewPriceHandler(priceRepo)

	projectRepo := repository.NewProjectRepository(db)
	calcService := service.NewCalculateService(projectRepo, priceRepo)
	calcHandler := handler.NewCalculateHandler(calcService)

	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	r.Post("/auth/register", authHandler.Register)
	r.Post("/auth/login", authHandler.Login)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("🚀 API running"))
	})

	paintHandler := handler.NewPaintHandler(calcService)
	wallHandler := handler.NewWallHandler(calcService)
	demolitionHandler := handler.NewDemolitionHandler(calcService)

	obraRepo := repository.NewObraRepository(db)
	obraHandler := handler.NewObraHandler(obraRepo, userRepo)

	billingHandler := handler.NewBillingHandler(userRepo)

	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		r.Post("/calculate/floor", calcHandler.CalculateFloor)
		r.Post("/calculate/paint", paintHandler.CalculatePaint)
		r.Post("/calculate/wall", wallHandler.CalculateWall)
		r.Post("/calculate/demolition", demolitionHandler.CalculateDemolition)
		r.Get("/projects", calcHandler.GetProjects)

		r.Get("/prices", priceHandler.GetPrices)
		r.Put("/prices", priceHandler.UpdatePrices)

		r.Post("/obras", obraHandler.Create)
		r.Get("/obras", obraHandler.List)
		r.Get("/obras/{id}", obraHandler.Get)
		r.Put("/obras/{id}/status", obraHandler.UpdateStatus)
		r.Put("/obras/{id}/stages/{stageId}/status", obraHandler.UpdateStageStatus)
		r.Post("/obras/{id}/expenses", obraHandler.AddExpense)

		r.Get("/billing/status", billingHandler.GetStatus)
		r.Post("/billing/checkout", billingHandler.CreateCheckout)
	})

	// Webhook sem auth (Stripe assina com segredo próprio)
	r.Post("/billing/webhook", billingHandler.Webhook)

	return r
}
