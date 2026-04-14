# ObraPro — Backend

API REST em Go para a plataforma ObraPro.

## Estrutura

```
backend/
├── cmd/api/main.go              # Entry point — inicializa logger e HTTP server
├── internal/
│   ├── app/app.go               # Roteamento, CORS, injeção de dependências
│   ├── calculator/
│   │   ├── floor.go             # Cálculo de piso e fatores por ambiente
│   │   ├── wall.go              # Cálculo de revestimento de parede
│   │   ├── paint.go             # Cálculo de pintura e materiais
│   │   ├── demolition.go        # Cálculo de demolição
│   │   └── floor_test.go        # Testes unitários
│   ├── handler/
│   │   ├── auth_handler.go      # POST /auth/register, POST /auth/login
│   │   ├── billing_handler.go   # GET|POST /billing/*, POST /billing/webhook
│   │   ├── calculate_handler.go # POST /calculate/floor, GET /projects
│   │   ├── demolition_handler.go# POST /calculate/demolition
│   │   ├── obra_handler.go      # CRUD /obras + stages + expenses
│   │   ├── paint_handler.go     # POST /calculate/paint
│   │   ├── price_handler.go     # GET|PUT /prices
│   │   └── wall_handler.go      # POST /calculate/wall
│   ├── middleware/
│   │   └── auth_middleware.go   # Valida JWT e injeta user_id no contexto
│   ├── model/
│   │   ├── calculate.go         # FloorCalculationRequest/Response
│   │   ├── demolition.go        # DemolitionRequest/Response
│   │   ├── obra.go              # Obra, ObraStage, ObraExpense, requests
│   │   ├── paint.go             # PaintCalculationRequest/Response
│   │   ├── project.go           # Project (legacy)
│   │   └── user.go              # User, PriceTable, constantes de plano
│   ├── repository/
│   │   ├── obra_repository.go   # CRUD obras + stages + expenses (transacional)
│   │   ├── price_repository.go  # Upsert/Get tabela de preços
│   │   ├── project_repository.go# Save/FindAll projetos (legacy)
│   │   └── user_repository.go   # CRUD users + plan management
│   ├── service/
│   │   ├── auth_service.go      # Register (bcrypt), Login → LoginResult{token,plan}
│   │   └── calculate_service.go # Orquestra calculadoras + repo de preços
│   └── database/db.go           # Pool pgx/v5
├── migrations/                  # SQL numerados — rodar em ordem
└── pkg/utils/
    ├── context.go               # GetUserID(ctx) helper
    ├── jwt.go                   # GenerateToken / ParseToken
    └── logger.go                # Logrus singleton
```

## Rodar localmente

```bash
go mod download
go run cmd/api/main.go
```

Servidor sobe em `:8080`.

## Testes

```bash
go test ./internal/calculator/...
```

## Adicionar nova calculadora

1. Criar `internal/calculator/<nome>.go` com a função `Calculate<Nome>(req, prices)`
2. Criar `internal/model/<nome>.go` com os structs de request/response
3. Criar `internal/handler/<nome>_handler.go`
4. Registar a rota em `internal/app/app.go`
5. Se precisar de novos preços: criar migração SQL e atualizar `PriceTable` em `model/user.go`, `price_repository.go` (query + scan + upsert)

## Variáveis de ambiente em produção

```bash
DATABASE_URL=postgres://user:pass@host:5432/obrapro
JWT_SECRET=<segredo forte>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://app.obrapro.com/planos?success=1
STRIPE_CANCEL_URL=https://app.obrapro.com/planos?canceled=1
```

> Atualmente `DATABASE_URL` e `JWT_SECRET` são hardcoded — mover para env antes de produção.

## CORS

Origens permitidas (configuradas em `app.go`):
- `http://localhost:3000`
- `http://localhost:3001`

Em produção, atualizar para o domínio do frontend.
