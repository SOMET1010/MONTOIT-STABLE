-- migration: create database enums
-- description: create all base enums for the platform
-- created: 2025-11-23T12:51:49Z

-- create enum types for the platform
-- these enums define the core business logic and data integrity

do $$
begin
    -- user type enum to define different user roles in the platform
    create type user_type as enum ('locataire', 'proprietaire', 'agence', 'admin_ansut');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- user role enum for permission management
    create type user_role as enum ('admin', 'user', 'agent', 'moderator');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- property type enum to categorize different property types
    create type property_type as enum ('appartement', 'villa', 'studio', 'chambre', 'bureau', 'commerce');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- property status enum to track property availability
    create type property_status as enum ('disponible', 'loue', 'en_attente', 'retire');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- application status enum for rental applications
    create type application_status as enum ('en_attente', 'acceptee', 'refusee', 'annulee');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- verification status enum for document verification
    create type verification_status as enum ('en_attente', 'verifie', 'rejete');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- payment status enum to track payment states
    create type payment_status as enum ('en_attente', 'complete', 'echoue', 'annule');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- payment type enum to categorize different payment types
    create type payment_type as enum ('loyer', 'depot_garantie', 'charges', 'frais_agence');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- payment method enum for different payment methods
    create type payment_method as enum ('mobile_money', 'carte_bancaire', 'virement', 'especes');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- lease status enum to track lease lifecycle
    create type lease_status as enum ('brouillon', 'en_attente_signature', 'actif', 'expire', 'resilie');
exception
    when duplicate_object then null;
end $$;

do $$
begin
    -- lease type enum for different lease durations
    create type lease_type as enum ('courte_duree', 'longue_duree');
exception
    when duplicate_object then null;
end $$;

-- create visit type enum for property visit scheduling
do $$
begin
    create type visit_type as enum ('physique', 'virtuelle');
exception
    when duplicate_object then null;
end $$;

-- create visit status enum for visit scheduling
do $$
begin
    create type visit_status as enum ('en_attente', 'confirmee', 'annulee', 'terminee');
exception
    when duplicate_object then null;
end $$;

-- create alert frequency enum for user notifications
do $$
begin
    create type alert_frequency as enum ('immediate', 'daily', 'weekly');
exception
    when duplicate_object then null;
end $$;

-- create alert type enum for different notification types
do $$
begin
    create type alert_type as enum ('new_property', 'price_drop', 'status_change');
exception
    when duplicate_object then null;
end $$;