-- Migration 001 — Schéma initial Parislivr
-- Exécuter: psql $DATABASE_URL -f src/db/migrations/001_initial_schema.sql

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE role AS ENUM ('merchant', 'driver', 'admin');
CREATE TYPE delivery_status AS ENUM (
  'pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'
);
CREATE TYPE vehicle_type AS ENUM ('bike', 'scooter', 'car', 'van');

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          role NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE merchant_profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  shop_name         VARCHAR(255) NOT NULL,
  siret             VARCHAR(14)  NOT NULL UNIQUE,
  address           JSONB NOT NULL,
  stripe_account_id VARCHAR(255)
);

CREATE TABLE driver_profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  vehicle_type      vehicle_type NOT NULL,
  is_available      BOOLEAN NOT NULL DEFAULT FALSE,
  current_location  JSONB,
  zones             TEXT[] NOT NULL DEFAULT '{}',
  stripe_account_id VARCHAR(255)
);

CREATE TABLE deliveries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id     UUID NOT NULL REFERENCES users(id),
  driver_id       UUID REFERENCES users(id),
  status          delivery_status NOT NULL DEFAULT 'pending',
  pickup          JSONB NOT NULL,
  dropoff         JSONB NOT NULL,
  package_info    JSONB NOT NULL,
  price_in_cents  INTEGER NOT NULL CHECK (price_in_cents > 0),
  scheduled_at    TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  picked_up_at    TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Index ────────────────────────────────────────────────────────────────────

-- Requêtes fréquentes sur les livraisons
CREATE INDEX idx_deliveries_merchant_id  ON deliveries(merchant_id);
CREATE INDEX idx_deliveries_driver_id    ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status       ON deliveries(status);

-- Vue dashboard merchant: mes livraisons par date décroissante
CREATE INDEX idx_deliveries_merchant_status_date
  ON deliveries(merchant_id, status, created_at DESC);

-- Drivers disponibles uniquement (index partiel)
CREATE INDEX idx_drivers_available
  ON driver_profiles(is_available)
  WHERE is_available = TRUE;
