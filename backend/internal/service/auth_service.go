package service

import (
	"errors"

	"github.com/edgar-lins/obrapro/internal/model"
	"github.com/edgar-lins/obrapro/internal/repository"
	"github.com/edgar-lins/obrapro/pkg/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo *repository.UserRepository
}

func NewAuthService(repo *repository.UserRepository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := model.User{
		Email:    email,
		Password: string(hash),
	}

	return s.repo.Create(user)
}

type LoginResult struct {
	Token string `json:"token"`
	Plan  string `json:"plan"`
}

func (s *AuthService) Login(email, password string) (LoginResult, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return LoginResult{}, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)
	if err != nil {
		return LoginResult{}, errors.New("invalid credentials")
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return LoginResult{}, err
	}

	return LoginResult{Token: token, Plan: user.Plan}, nil
}
