CREATE TABLE IF NOT EXISTS obras (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    name          TEXT NOT NULL,
    client_name   TEXT    DEFAULT '',
    client_phone  TEXT    DEFAULT '',
    client_address TEXT   DEFAULT '',
    status        TEXT    DEFAULT 'orcado',   -- orcado | em_andamento | concluido
    total_cost    NUMERIC(10,2) DEFAULT 0,
    labor_cost    NUMERIC(10,2) DEFAULT 0,
    material_cost NUMERIC(10,2) DEFAULT 0,
    estimated_days INTEGER DEFAULT 0,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obra_stages (
    id             SERIAL PRIMARY KEY,
    obra_id        INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    service_type   TEXT    NOT NULL,           -- piso | revestimento | pintura | demolicao
    environment    TEXT    NOT NULL,
    area           NUMERIC(10,2) NOT NULL,
    floor_type     TEXT    DEFAULT '',
    paint_type     TEXT    DEFAULT '',
    coats          INTEGER DEFAULT 0,
    demolition_type TEXT   DEFAULT '',
    labor_cost     NUMERIC(10,2) DEFAULT 0,
    material_cost  NUMERIC(10,2) DEFAULT 0,
    total_cost     NUMERIC(10,2) DEFAULT 0,
    estimated_days INTEGER DEFAULT 0,
    status         TEXT    DEFAULT 'pendente', -- pendente | em_andamento | concluido
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obra_expenses (
    id          SERIAL PRIMARY KEY,
    obra_id     INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    description TEXT    NOT NULL,
    amount      NUMERIC(10,2) NOT NULL,
    category    TEXT    DEFAULT 'outro',       -- material | mao_de_obra | outro
    created_at  TIMESTAMP DEFAULT NOW()
);
