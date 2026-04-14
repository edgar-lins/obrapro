package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/repository"
	"github.com/edgar-lins/obrapro/pkg/utils"
	stripe "github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/customer"
	"github.com/stripe/stripe-go/v82/webhook"
)

type BillingHandler struct {
	userRepo *repository.UserRepository
}

func NewBillingHandler(userRepo *repository.UserRepository) *BillingHandler {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	return &BillingHandler{userRepo: userRepo}
}

func (h *BillingHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())
	user, err := h.userRepo.FindByID(userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"plan":            user.Plan,
		"plan_expires_at": user.PlanExpiresAt,
		"obra_limit":      obraLimitForPlan(user.Plan),
	})
}

func (h *BillingHandler) CreateCheckout(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserID(r.Context())
	user, err := h.userRepo.FindByID(userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	if user.Plan == model.PlanPro {
		http.Error(w, "already pro", http.StatusBadRequest)
		return
	}

	// Get or create Stripe customer
	customerID := user.StripeCustomerID
	if customerID == "" {
		cust, err := customer.New(&stripe.CustomerParams{
			Email: stripe.String(user.Email),
		})
		if err != nil {
			http.Error(w, "failed to create customer", http.StatusInternalServerError)
			return
		}
		customerID = cust.ID
		h.userRepo.UpdatePlan(userID, model.PlanFree, customerID)
	}

	priceID := os.Getenv("STRIPE_PRICE_ID")
	successURL := os.Getenv("STRIPE_SUCCESS_URL")
	cancelURL := os.Getenv("STRIPE_CANCEL_URL")
	if successURL == "" {
		successURL = "http://localhost:3000/planos?success=1"
	}
	if cancelURL == "" {
		cancelURL = "http://localhost:3000/planos?canceled=1"
	}

	sess, err := session.New(&stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{Price: stripe.String(priceID), Quantity: stripe.Int64(1)},
		},
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
	})
	if err != nil {
		http.Error(w, "failed to create checkout session: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"url": sess.URL})
}

func (h *BillingHandler) Webhook(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}

	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	sig := r.Header.Get("Stripe-Signature")

	event, err := webhook.ConstructEvent(payload, sig, webhookSecret)
	if err != nil {
		http.Error(w, "invalid signature", http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		var sess stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
			http.Error(w, "parse error", http.StatusBadRequest)
			return
		}
		if sess.Customer != nil {
			user, err := h.userRepo.FindByStripeCustomerID(sess.Customer.ID)
			if err == nil {
				h.userRepo.UpdatePlan(user.ID, model.PlanPro, sess.Customer.ID)
			}
		}

	case "customer.subscription.deleted":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			http.Error(w, "parse error", http.StatusBadRequest)
			return
		}
		if sub.Customer != nil {
			user, err := h.userRepo.FindByStripeCustomerID(sub.Customer.ID)
			if err == nil {
				h.userRepo.UpdatePlan(user.ID, model.PlanFree, "")
			}
		}
	}

	w.WriteHeader(http.StatusOK)
}

func obraLimitForPlan(plan string) int {
	if plan == model.PlanPro {
		return -1 // unlimited
	}
	return model.FreeObraLimit
}
