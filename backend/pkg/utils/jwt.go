package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

func jwtKey() []byte {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return []byte(secret)
	}
	return []byte("super-secret-key")
}

func GenerateToken(userID int) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey())
}

func ParseToken(tokenString string) (*jwt.Token, jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtKey(), nil
	})
	if err != nil {
		return nil, nil, err
	}
	claims := token.Claims.(jwt.MapClaims)
	return token, claims, nil
}
