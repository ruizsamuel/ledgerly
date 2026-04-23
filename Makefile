SHELL := /bin/bash
.DEFAULT_GOAL := help

DOCKER_COMPOSE ?= docker compose
DEV_COMPOSE    := $(DOCKER_COMPOSE) -f docker-compose.yml
PROD_COMPOSE   := $(DOCKER_COMPOSE) -f docker-compose.prod.yml
SERVER_DIR     := server
ENV_FILE       := .env
ENV_EXAMPLE    := .env.example

.PHONY: help build dev prod logs-dev logs-prod down \
	test test-unit test-int test-func test-watch \
	lint lint-client lint-server \
	version-patch version-minor version-major _bump

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build docker images
	$(DOCKER_COMPOSE) build

_ensure-env:
	@if [[ ! -f $(ENV_FILE) ]]; then cp $(ENV_EXAMPLE) $(ENV_FILE); fi

dev: _ensure-env ## Start development stack
	$(DEV_COMPOSE) up -d

prod: _ensure-env ## Start production stack
	$(PROD_COMPOSE) up -d

logs-dev: ## Follow development logs
	$(DEV_COMPOSE) logs -f

logs-prod: ## Follow production logs
	$(PROD_COMPOSE) logs -f

down: ## Stop and remove all containers
	$(DOCKER_COMPOSE) down --remove-orphans

test: ## Run all tests
	cd $(SERVER_DIR) && npm run test

test-unit: ## Run unit tests
	cd $(SERVER_DIR) && npm run test:unit

test-int: ## Run integration tests
	cd $(SERVER_DIR) && npm run test:integration

test-func: ## Run functional tests
	cd $(SERVER_DIR) && npm run test:functional

test-watch: ## Run tests in watch mode
	cd $(SERVER_DIR) && npm run test:watch

lint: ## Run lint and auto-fix for client and server
	$(MAKE) lint-client
	$(MAKE) lint-server

lint-client: ## Run client lint and auto-fix
	cd client && npm run lint

lint-server: ## Run server lint and auto-fix
	cd $(SERVER_DIR) && npm run lint

version-patch: ## Bump patch version (0.0.x)
	@$(MAKE) _bump TYPE=patch

version-minor: ## Bump minor version (0.x.0)
	@$(MAKE) _bump TYPE=minor

version-major: ## Bump major version (x.0.0)
	@$(MAKE) _bump TYPE=major

_bump:
	@V_NEXT=$$(npm version $(TYPE) --no-git-tag-version --prefix client); \
		npm version $$V_NEXT --no-git-tag-version --prefix server; \
		git add **/package.json **/package-lock.json; \
		echo "Bumped to $$V_NEXT"
