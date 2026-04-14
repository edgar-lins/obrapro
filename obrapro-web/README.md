# ObraPro — Frontend

Interface web da plataforma ObraPro, construída com Next.js 16 (App Router, Turbopack).

## Stack

- **Next.js 16** com App Router e Turbopack
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4** com tokens de Material Design 3
- **Fontes:** Manrope (headlines) + Inter (body) via Google Fonts
- **Ícones:** Material Symbols (via CDN no `layout.tsx`)

## Rodar localmente

```bash
npm install
npm run dev
# http://localhost:3000
```

## Estrutura de páginas

| Rota             | Arquivo                          | Auth | Descrição                          |
|------------------|----------------------------------|------|------------------------------------|
| `/`              | `app/page.tsx`                   | Não  | Landing page                       |
| `/login`         | `app/login/page.tsx`             | Não  | Login                              |
| `/register`      | `app/register/page.tsx`          | Não  | Registo                            |
| `/dashboard`     | `app/dashboard/page.tsx`         | Sim  | Lista de obras, stats, banner free |
| `/calculate`     | `app/calculate/page.tsx`         | Sim  | Calculadora multi-serviço + PDF    |
| `/obra/[id]`     | `app/obra/[id]/page.tsx`         | Sim  | Detalhe da obra, etapas, gastos    |
| `/settings`      | `app/settings/page.tsx`          | Sim  | Tabela de preços personalizada     |
| `/planos`        | `app/planos/page.tsx`            | Sim  | Planos Free/Pro, checkout Stripe   |

## Componentes principais

### `CalculateForm`
Formulário de cálculo multi-ambiente. Suporta 4 tipos de serviço:
- **Piso** (`piso`) — assentamento de cerâmica/porcelanato/vinílico
- **Revestimento de Parede** (`revestimento`) — idem, com 12% de quebra
- **Pintura** (`pintura`) — acrílica/látex/esmalte, com demãos configuráveis
- **Demolição** (`demolicao`) — manual/mecânica, com descarte opcional

Fluxo:
1. Utilizador preenche "Nome da Obra" + dados do cliente (opcional)
2. Adiciona ambientes com tipo de serviço e área
3. Clica "Calcular" → chama a API para cada ambiente em paralelo
4. Resultados aparecem inline em cada card
5. "Guardar Obra no Dashboard" → `POST /obras` → redireciona para `/obra/:id`
6. "Imprimir" → ativa `OrcamentoPDF` via CSS `@media print`

### `OrcamentoPDF`
Componente apenas visível no print (`hidden print:block`). Renderiza o orçamento em formato A4 com:
- Cabeçalho ObraPro + data
- Dados do cliente
- Tabela de serviços por ambiente
- Lista de materiais por ambiente
- Prazo estimado e validade
- Campos de assinatura

## Autenticação

O token JWT é guardado em `localStorage` como `obrapro_token`. O plano do utilizador é guardado como `obrapro_plan` (`free` / `pro`).

Todas as páginas protegidas verificam o token no `useEffect` inicial e redirecionam para `/login` se ausente.

## Cliente API (`src/services/api.ts`)

Todas as chamadas passam pela função `throwIfNotOk` que lança `Error` com `status: body` — permitindo identificar erros específicos no frontend (ex: `402` para limite de plano).

**Funções disponíveis:**
- `calculateFloor`, `calculateWall`, `calculatePaint`, `calculateDemolition`
- `createObra`, `getObras`, `getObra`
- `updateObraStatus`, `updateStageStatus`, `addExpense`
- `getPrices`, `updatePrices`
- `getBillingStatus`, `createCheckout`

## Design System

Tokens Tailwind custom (definidos em `globals.css`):

| Token                       | Uso                              |
|-----------------------------|----------------------------------|
| `bg-surface`                | Fundo principal                  |
| `bg-surface-container-low`  | Cards e secções                  |
| `bg-primary-container`      | CTAs primários                   |
| `text-on-surface`           | Texto principal                  |
| `text-on-surface-variant`   | Texto secundário/labels          |
| `text-primary`              | Cor de destaque                  |
| `font-headline`             | Manrope (títulos)                |
| `font-body`                 | Inter (corpo)                    |

## Print / PDF

O CSS de impressão em `globals.css` define:
- Tamanho A4, margens 15mm
- `.pdf-doc` passa de `display:none` para `display:block`
- Todo o conteúdo de ecrã tem `print:hidden`

## Build de produção

```bash
npm run build
npm start
```

Configurar `NEXT_PUBLIC_API_URL` para apontar para o backend em produção:
```bash
NEXT_PUBLIC_API_URL=https://api.obrapro.com npm run build
```

> Atualmente a URL da API está hardcoded em `src/services/api.ts`. Migrar para `process.env.NEXT_PUBLIC_API_URL` antes do deploy.
