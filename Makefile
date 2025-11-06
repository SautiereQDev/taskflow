.PHONY: help install dev build start test lint clean

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

# Variables
NODE := node
NPM := npm
PRISMA := npx prisma
VITEST := npx vitest
ESLINT := npx eslint

.DEFAULT_GOAL := help

help: ## Affiche cette aide
	@echo "$(BLUE)TaskFlow - Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Installe les dépendances
	@echo "$(YELLOW)Installation...$(NC)"
	$(NPM) install
	$(PRISMA) generate
	@echo "$(GREEN)✓ Fait$(NC)"

dev: ## Lance le serveur
	$(NPM) run dev

build: ## Compile le projet
	$(NPM) run build

test: ## Lance les tests
	$(VITEST) run

lint: ## Vérifie le code
	$(ESLINT) . --ext .ts

clean: ## Nettoie
	rm -rf dist coverage

# Docker commands
docker-dev-up: ## Lance les conteneurs Docker en mode développement
	@echo "$(YELLOW)Démarrage des conteneurs Docker (dev + hot reload)...$(NC)"
	docker compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Conteneurs démarrés - http://localhost:3000$(NC)"

docker-dev-down: ## Arrête les conteneurs Docker dev
	@echo "$(YELLOW)Arrêt des conteneurs...$(NC)"
	docker compose -f docker-compose.dev.yml down

docker-dev-logs: ## Affiche les logs Docker en temps réel
	docker compose -f docker-compose.dev.yml logs -f

docker-dev-restart: ## Redémarre les conteneurs Docker
	docker compose -f docker-compose.dev.yml restart

docker-up: ## Lance les conteneurs Docker (production)
	@echo "$(YELLOW)Démarrage des conteneurs Docker (production)...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Conteneurs démarrés - http://localhost:3000$(NC)"

docker-down: ## Arrête les conteneurs Docker
	docker compose down

docker-logs: ## Affiche les logs Docker
	docker compose logs -f

docker-clean: ## Nettoie complètement Docker
	@echo "$(YELLOW)Nettoyage complet...$(NC)"
	docker compose -f docker-compose.dev.yml down -v
	docker compose down -v
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"
