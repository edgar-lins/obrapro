package utils

import "context"

func GetUserID(ctx context.Context) int {
	userID := ctx.Value("user_id")
	if userID == nil {
		return 0
	}
	return userID.(int)
}
