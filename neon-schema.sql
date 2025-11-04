-- =====================================================
-- SOCIOS CLUB - NEON DATABASE SCHEMA
-- =====================================================
-- Este script crea todas las tablas necesarias para la aplicación
-- Ejecuta este script en la consola SQL de Neon (SQL Editor)
-- =====================================================

-- =====================================================
-- TABLA: members_2025
-- Almacena los miembros del año 2025
-- =====================================================
CREATE TABLE IF NOT EXISTS members_2025 (
  id BIGSERIAL PRIMARY KEY,
  member_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  amount_paid DECIMAL(10,2) DEFAULT 35.00,
  year INTEGER DEFAULT 2025,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(20) DEFAULT '2025_list',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para members_2025
CREATE INDEX IF NOT EXISTS idx_members_2025_member_number ON members_2025(member_number);
CREATE INDEX IF NOT EXISTS idx_members_2025_email ON members_2025(email);
CREATE INDEX IF NOT EXISTS idx_members_2025_year ON members_2025(year);
CREATE INDEX IF NOT EXISTS idx_members_2025_is_active ON members_2025(is_active);

-- =====================================================
-- TABLA: members_2026
-- Almacena los miembros del año 2026
-- =====================================================
CREATE TABLE IF NOT EXISTS members_2026 (
  id BIGSERIAL PRIMARY KEY,
  member_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  amount_paid DECIMAL(10,2) DEFAULT 35.00,
  year INTEGER DEFAULT 2026,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(20) DEFAULT 'form',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para members_2026
CREATE INDEX IF NOT EXISTS idx_members_2026_member_number ON members_2026(member_number);
CREATE INDEX IF NOT EXISTS idx_members_2026_email ON members_2026(email);
CREATE INDEX IF NOT EXISTS idx_members_2026_year ON members_2026(year);
CREATE INDEX IF NOT EXISTS idx_members_2026_is_active ON members_2026(is_active);

-- =====================================================
-- TABLA: mailchimp_sync
-- Sincronización con MailChimp
-- =====================================================
CREATE TABLE IF NOT EXISTS mailchimp_sync (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL,
  mailchimp_id VARCHAR(255),
  audience_id VARCHAR(255),
  tags TEXT, -- JSON array of tags
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_member FOREIGN KEY (member_id) REFERENCES members_2026(id) ON DELETE CASCADE
);

-- Índices para mailchimp_sync
CREATE INDEX IF NOT EXISTS idx_mailchimp_sync_member_id ON mailchimp_sync(member_id);
CREATE INDEX IF NOT EXISTS idx_mailchimp_sync_audience_id ON mailchimp_sync(audience_id);

-- =====================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_members_2025_updated_at ON members_2025;
CREATE TRIGGER update_members_2025_updated_at
  BEFORE UPDATE ON members_2025
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_2026_updated_at ON members_2026;
CREATE TRIGGER update_members_2026_updated_at
  BEFORE UPDATE ON members_2026
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETADO
-- =====================================================
-- Nota: Neon no requiere Row Level Security (RLS) como Supabase
-- ya que maneja la seguridad a nivel de conexión.
-- La aplicación usará la conexión directa de PostgreSQL.

