# ObraPro

SaaS de gestão e orçamentação de obras para empreiteiros brasileiros. Permite calcular custos de serviços de construção civil, gerir projetos ativos, acompanhar etapas e controlar gastos reais versus estimados.

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração Local](#configuração-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Migrações de Banco de Dados](#migrações-de-banco-de-dados)
- [API Reference](#api-reference)
- [Modelo de Dados](#modelo-de-dados)
- [Planos e Monetização](#planos-e-monetização)
- [Lógica de Cálculo](#lógica-de-cálculo)
- [Roadmap](#roadmap)

---

## Visão Geral

O ObraPro resolve um problema real para empreiteiros: calcular orçamentos profissionalmente, gerir obras e controlar se estão lucrando ou perdendo dinheiro.

**Funcionalidades:**

- Calculadoras de mão de obra e material para piso, revestimento de parede, pintura e demolição
- Tabela de preços personalizável por utilizador
- Geração de PDF de orçamento profissional
- Gestão de obras: status (Orçado → Em Andamento → Concluído)
- Acompanhamento de etapas com status individuais
- Controlo de gastos reais vs. estimados
- Modelo freemium: 3 obras gratuitas, Pro ilimitado (R$39/mês via Stripe)

---

## Stack Tecnológica

| Camada      | Tecnologia                           |
|-------------|--------------------------------------|
| Frontend    | Next.js 16 (Turbopack), React 19, TypeScript 5 |
| Estilo      | Tailwind CSS v4, Material Design 3   |
| Backend     | Go (chi router, pgx/v5)              |
| Banco       | PostgreSQL                           |
| Auth        | JWT (golang-jwt)                     |
| Pagamentos  | Stripe (subscriptions)               |
| Logging     | Logrus                               |

---

## Estrutura do Projeto

```
obrapro/
├── backend/                    # API em Go
│   ├── cmd/api/main.go         # Entry point
│   ├── internal/
│   │   ├── app/app.go          # Roteamento e injeção de dependências
│   │   ├── calculator/         # Algoritmos de cálculo por serviço
│   │   ├── handler/            # Handlers HTTP
│   │   ├── middleware/         # Autenticação JWT
│   │   ├── model/              # Structs de domínio
│   │   ├── repository/         # Acesso ao banco de dados
│   │   └── service/            # Lógica de negócio
│   ├── migrations/             # SQL de migrações (ordem numérica)
│   └── pkg/utils/              # JWT, logger, context helpers
│
└── obrapro-web/                # Frontend Next.js
    └── src/
        ├── app/                # Páginas (App Router)
        │   ├── page.tsx        # Landing page
        │   ├── login/          # Login
        │   ├── register/       # Registo
        │   ├── dashboard/      # Lista de obras
        │   ├── calculate/      # Calculadora
        │   ├── obra/[id]/      # Detalhe da obra
        │   ├── settings/       # Tabela de preços
        │   └── planos/         # Planos e billing
        ├── components/
        │   ├── CalculateForm.tsx   # Formulário de cálculo multi-serviço
        │   └── OrcamentoPDF.tsx    # Componente de PDF (print)
        ├── services/api.ts         # Cliente HTTP para a API
        └── types/calculate.ts      # Tipos TypeScript dos resultados
```

---

## Configuração Local

### Pré-requisitos

- Go 1.21+
- Node.js 20+
- PostgreSQL 15+

### 1. Banco de dados

```bash
# Criar o banco
psql -U postgres -c "CREATE DATABASE obrapro;"

# Executar todas as migrações (em ordem)
PGPASSWORD=postgres psql -h localhost -U postgres -d obrapro \
  -f backend/migrations/002_add_material_prices.sql \
  -f backend/migrations/003_add_paint_prices.sql \
  -f backend/migrations/004_add_wall_demolition_prices.sql \
  -f backend/migrations/005_create_obras.sql \
  -f backend/migrations/006_add_plan_to_users.sql
```

> A migração inicial (tabelas `users`, `price_tables`, `projects`) está embutida no código de bootstrap.

### 2. Backend

```bash
cd backend
go mod download
go run cmd/api/main.go
# API disponível em http://localhost:8080
```

### 3. Frontend

```bash
cd obrapro-web
npm install
npm run dev
# App disponível em http://localhost:3000
```

---

## Variáveis de Ambiente

### Backend

O backend usa valores hardcoded por padrão em desenvolvimento. Para produção, as seguintes variáveis devem ser configuradas:

| Variável               | Descrição                                      | Default (dev)                          |
|------------------------|------------------------------------------------|----------------------------------------|
| `STRIPE_SECRET_KEY`    | Chave secreta do Stripe                        | `""` (billing desativado)              |
| `STRIPE_PRICE_ID`      | ID do preço recorrente no Stripe (Pro R$39/mês)| `""`                                   |
| `STRIPE_WEBHOOK_SECRET`| Segredo para validar webhooks do Stripe        | `""`                                   |
| `STRIPE_SUCCESS_URL`   | URL de redirecionamento após pagamento         | `http://localhost:3000/planos?success=1` |
| `STRIPE_CANCEL_URL`    | URL de redirecionamento após cancelamento      | `http://localhost:3000/planos?canceled=1` |

> **Atenção:** Em produção, mover também `DATABASE_URL` e `JWT_SECRET` para variáveis de ambiente (atualmente hardcoded em `database/db.go` e `pkg/utils/jwt.go`).

### Frontend

| Variável               | Descrição          | Default            |
|------------------------|--------------------|--------------------|
| `NEXT_PUBLIC_API_URL`  | URL da API backend | `http://localhost:8080` |

---

## Migrações de Banco de Dados

As migrações são arquivos SQL simples numerados sequencialmente:

| Arquivo                              | Descrição                                   |
|--------------------------------------|---------------------------------------------|
| `002_add_material_prices.sql`        | Colunas de preço de material de piso        |
| `003_add_paint_prices.sql`           | Colunas de preço de pintura                 |
| `004_add_wall_demolition_prices.sql` | Preços de revestimento de parede e demolição|
| `005_create_obras.sql`               | Tabelas `obras`, `obra_stages`, `obra_expenses` |
| `006_add_plan_to_users.sql`          | Plano e integração Stripe nos utilizadores  |

Para rodar uma migração:
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d obrapro -f backend/migrations/<arquivo>.sql
```

---

## API Reference

Base URL: `http://localhost:8080`

### Autenticação

```
POST /auth/register
POST /auth/login
```

Todas as rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

O login retorna `{ token, plan }` — o `plan` deve ser guardado localmente para controlo de limites no frontend.

---

### Calculadoras

Todos os endpoints de cálculo são `POST` e requerem autenticação.

#### `POST /calculate/floor`
Calcula custo de assentamento de piso.

**Query params:** `?nosave=true` — não salva no histórico de projetos.

**Request:**
```json
{
  "floor_type": "porcelanato | ceramica | vinilico | outro",
  "area": 25.0,
  "remove_old_floor": false,
  "environment": "sala | cozinha | banheiro | externo"
}
```

**Response:**
```json
{
  "labor_cost": 2500.00,
  "material_cost": 2000.00,
  "total_cost": 4500.00,
  "estimated_days": 2,
  "materials": {
    "floor_m2": 27.5,
    "mortar_bags": 7,
    "grout_kg": 3
  }
}
```

#### `POST /calculate/wall`
Calcula custo de revestimento de parede. Mesmo schema do `/calculate/floor`. Diferenças: 12% de perda (vs 10% no piso), argamassa calculada como `área/3` (vs `/4`).

#### `POST /calculate/paint`
**Request:**
```json
{
  "paint_type": "acrilica | latex | esmalte",
  "area": 30.0,
  "coats": 2,
  "include_massa_corrida": true,
  "include_fundo": false,
  "environment": "sala"
}
```

**Response:**
```json
{
  "labor_cost": 360.00,
  "material_cost": 185.00,
  "total_cost": 545.00,
  "estimated_days": 2,
  "paint_materials": {
    "paint_liters": 9.0,
    "massa_corrida_kg": 15.0,
    "fundo_liters": 0.0
  }
}
```

#### `POST /calculate/demolition`
**Request:**
```json
{
  "area": 20.0,
  "type": "manual | mecanica",
  "include_disposal": true,
  "environment": "sala"
}
```

**Response:**
```json
{
  "labor_cost": 625.00,
  "total_cost": 625.00,
  "estimated_days": 1
}
```

---

### Preços

#### `GET /prices`
Retorna a tabela de preços do utilizador. Se não existir, retorna os valores default.

#### `PUT /prices`
Atualiza a tabela de preços.

**Request:** objeto completo com todos os campos de preço (ver [Modelo de Dados](#modelo-de-dados)).

---

### Obras

#### `POST /obras`
Cria uma nova obra com todas as etapas. Retorna 402 se utilizador Free já tiver 3 obras.

**Request:**
```json
{
  "name": "Reforma Apartamento Centro",
  "client_name": "João Silva",
  "client_phone": "11 99999-9999",
  "client_address": "Rua X, 123 — São Paulo",
  "stages": [
    {
      "service_type": "piso",
      "environment": "sala",
      "area": 25.0,
      "floor_type": "porcelanato",
      "labor_cost": 2500.00,
      "material_cost": 2000.00,
      "total_cost": 4500.00,
      "estimated_days": 2
    }
  ]
}
```

#### `GET /obras`
Lista todas as obras do utilizador, ordenadas por data de criação descendente.

#### `GET /obras/{id}`
Retorna obra completa com `stages` e `expenses`.

#### `PUT /obras/{id}/status`
```json
{ "status": "orcado | em_andamento | concluido" }
```

#### `PUT /obras/{id}/stages/{stageId}/status`
```json
{ "status": "pendente | em_andamento | concluido" }
```

#### `POST /obras/{id}/expenses`
```json
{
  "description": "Compra de cerâmica",
  "amount": 1200.00,
  "category": "material | mao_de_obra | outro"
}
```

---

### Billing

#### `GET /billing/status`
```json
{
  "plan": "free | pro",
  "plan_expires_at": null,
  "obra_limit": 3
}
```
> `obra_limit: -1` significa ilimitado (plano Pro).

#### `POST /billing/checkout`
Cria uma sessão de checkout Stripe. Retorna `{ url }` — redirecionar o utilizador para essa URL.

#### `POST /billing/webhook` *(público, sem auth)*
Endpoint para eventos Stripe. Validado por assinatura `Stripe-Signature`.

Eventos tratados:
- `checkout.session.completed` → ativa plano Pro
- `customer.subscription.deleted` → reverte para Free

---

## Modelo de Dados

### Tabela `users`

| Coluna               | Tipo      | Default  | Descrição                       |
|----------------------|-----------|----------|---------------------------------|
| `id`                 | SERIAL PK |          |                                 |
| `email`              | TEXT      |          | Único                           |
| `password`           | TEXT      |          | Hash bcrypt                     |
| `plan`               | TEXT      | `free`   | `free` ou `pro`                 |
| `stripe_customer_id` | TEXT      | `''`     | ID do cliente no Stripe         |
| `plan_expires_at`    | TIMESTAMP | NULL     |                                 |
| `created_at`         | TIMESTAMP | NOW()    |                                 |

### Tabela `price_tables`

| Coluna                       | Default  | Descrição                      |
|------------------------------|----------|--------------------------------|
| `porcelain_price`            | 100.00   | Piso — mão de obra (R$/m²)     |
| `ceramic_price`              | 70.00    |                                |
| `vinyl_price`                | 60.00    |                                |
| `other_price`                | 80.00    |                                |
| `porcelain_material_price`   | 80.00    | Piso — material (R$/m²)        |
| `ceramic_material_price`     | 45.00    |                                |
| `vinyl_material_price`       | 55.00    |                                |
| `other_material_price`       | 60.00    |                                |
| `acrylic_paint_price`        | 12.00    | Pintura — mão de obra (R$/m²)  |
| `latex_paint_price`          | 10.00    |                                |
| `enamel_paint_price`         | 18.00    |                                |
| `paint_material_price`       | 25.00    | Tinta — custo (R$/litro)       |
| `massa_corrida_price`        | 8.00     | Massa corrida (R$/kg)          |
| `fundo_price`                | 20.00    | Fundo preparador (R$/litro)    |
| `wall_porcelain_price`       | 130.00   | Parede — mão de obra (R$/m²)   |
| `wall_ceramic_price`         | 90.00    |                                |
| `wall_other_price`           | 100.00   |                                |
| `demolition_manual_price`    | 25.00    | Demolição manual (R$/m²)       |
| `demolition_mechanical_price`| 40.00    | Demolição mecânica (R$/m²)     |

### Tabela `obras`

| Coluna          | Tipo      | Descrição                                     |
|-----------------|-----------|-----------------------------------------------|
| `id`            | SERIAL PK |                                               |
| `user_id`       | INTEGER   | FK → users                                    |
| `name`          | TEXT      | Nome da obra (obrigatório)                    |
| `client_name`   | TEXT      | Nome do cliente                               |
| `client_phone`  | TEXT      |                                               |
| `client_address`| TEXT      |                                               |
| `status`        | TEXT      | `orcado` / `em_andamento` / `concluido`       |
| `total_cost`    | NUMERIC   | Soma dos stages                               |
| `labor_cost`    | NUMERIC   |                                               |
| `material_cost` | NUMERIC   |                                               |
| `estimated_days`| INTEGER   |                                               |
| `created_at`    | TIMESTAMP |                                               |
| `updated_at`    | TIMESTAMP |                                               |

### Tabela `obra_stages`

| Coluna           | Tipo    | Descrição                                           |
|------------------|---------|-----------------------------------------------------|
| `id`             | SERIAL  |                                                     |
| `obra_id`        | INTEGER | FK → obras (CASCADE DELETE)                         |
| `service_type`   | TEXT    | `piso` / `revestimento` / `pintura` / `demolicao`   |
| `environment`    | TEXT    | `sala` / `cozinha` / `banheiro` / `externo`         |
| `area`           | NUMERIC |                                                     |
| `floor_type`     | TEXT    | Para piso/revestimento                              |
| `paint_type`     | TEXT    | Para pintura                                        |
| `coats`          | INTEGER | Número de demãos                                    |
| `demolition_type`| TEXT    | `manual` / `mecanica`                               |
| `status`         | TEXT    | `pendente` / `em_andamento` / `concluido`           |

### Tabela `obra_expenses`

| Coluna        | Tipo      | Descrição                               |
|---------------|-----------|-----------------------------------------|
| `id`          | SERIAL    |                                         |
| `obra_id`     | INTEGER   | FK → obras (CASCADE DELETE)             |
| `description` | TEXT      |                                         |
| `amount`      | NUMERIC   |                                         |
| `category`    | TEXT      | `material` / `mao_de_obra` / `outro`    |
| `created_at`  | TIMESTAMP |                                         |

---

## Planos e Monetização

| Recurso                     | Free  | Pro (R$39/mês) |
|-----------------------------|-------|----------------|
| Obras                       | 3     | Ilimitadas     |
| Calculadoras                | Todas | Todas          |
| Geração de PDF              | Sim   | Sim            |
| Tabela de preços própria    | Sim   | Sim            |
| Etapas e controlo de gastos | Sim   | Sim            |

**Fluxo de upgrade:**
1. Utilizador clica em "Fazer upgrade" em `/planos`
2. Frontend chama `POST /billing/checkout` → recebe URL do Stripe
3. Utilizador é redirecionado para o Checkout do Stripe
4. Após pagamento, Stripe envia webhook `checkout.session.completed`
5. Backend atualiza `plan = 'pro'` no banco
6. Utilizador é redirecionado para `/planos?success=1`

**Configuração do Stripe (desenvolvimento):**
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Fazer login
stripe login

# Encaminhar webhooks para o backend local
stripe listen --forward-to localhost:8080/billing/webhook
```

---

## Lógica de Cálculo

### Piso e Revestimento de Parede

```
laborCost = area × pricePerM2 × environmentFactor × removalFactor

environmentFactor:
  sala      → 1.0
  cozinha   → 1.2
  banheiro  → 1.5  (mais cortes)
  externo   → 1.3

removalFactor:
  false → 1.0
  true  → 1.3  (30% adicional)

materialCost = area × (1 + wasteFactor) × materialPricePerM2
  wasteFactor: piso → 0.10, parede → 0.12

mortarBags = ceil(area / 4)   (piso) ou ceil(area / 3)   (parede)
groutKg    = ceil(area / 10)  (piso) ou ceil(area / 8)   (parede)

estimatedDays = max(1, floor(area / 15))
```

### Pintura

```
coatsFactor = 1.0 + (coats - 1) × 0.35

laborCost    = area × pricePerM2 × coatsFactor
paintLiters  = area / 10 × coatsFactor   (10 m²/litro)
massaCorridaKg = area × 0.5   (se include_massa_corrida)
fundoLiters    = area / 10    (se include_fundo)

materialCost = paintLiters × paintMaterialPrice
             + massaCorridaKg × massaCorridaPrice
             + fundoLiters × fundoPrice

estimatedDays = max(1, floor(area / 20))
```

### Demolição

```
basePrice = manual → demolitionManualPrice
            mecanica → demolitionManualPrice × 1.5

laborCost = area × basePrice
  + (includeDisposal ? laborCost × 0.25 : 0)

totalCost = laborCost   (sem material)
estimatedDays = max(1, floor(area / 20))
```

---

## Roadmap

| Fase | Status     | Descrição                                                  |
|------|------------|------------------------------------------------------------|
| 1    | Concluído  | Calculadora de piso, PDF profissional, dados do cliente    |
| 2    | Concluído  | Calculadoras de pintura, revestimento de parede, demolição |
| 3    | Concluído  | Gestão de obras, etapas, controlo de gastos                |
| 4    | Concluído  | Freemium, Stripe, limite de obras, página de planos        |
| 5    | Planeado   | App mobile (React Native)                                  |
| 6    | Planeado   | Relatórios e analytics por período                         |
