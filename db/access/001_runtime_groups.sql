-- Provision once per PostgreSQL cluster. Account bindings belong to each environment.
BEGIN;
CREATE ROLE ei_scope_api NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE ei_scope_delivery NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE ei_scope_projection NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE ei_scope_governance NOLOGIN NOSUPERUSER NOBYPASSRLS;
COMMIT;
