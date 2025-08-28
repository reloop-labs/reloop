-- Migration: 0001_mail_schema.sql
-- Description: Create mail system tables for virtual domains, users, and aliases

-- Create virtual_domains table
CREATE TABLE IF NOT EXISTS virtual_domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Create virtual_users table
CREATE TABLE IF NOT EXISTS virtual_users (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL REFERENCES virtual_domains(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create virtual_aliases table
CREATE TABLE IF NOT EXISTS virtual_aliases (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL REFERENCES virtual_domains(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    destination TEXT NOT NULL,
    UNIQUE (domain_id, source)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_virtual_users_domain_id ON virtual_users(domain_id);
CREATE INDEX IF NOT EXISTS idx_virtual_users_email ON virtual_users(email);
CREATE INDEX IF NOT EXISTS idx_virtual_aliases_domain_id ON virtual_aliases(domain_id);
CREATE INDEX IF NOT EXISTS idx_virtual_aliases_source ON virtual_aliases(source);
CREATE INDEX IF NOT EXISTS idx_virtual_domains_name ON virtual_domains(name);
