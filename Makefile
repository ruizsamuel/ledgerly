SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
DEV_COMPOSE := $(DOCKER_COMPOSE) -f docker-compose.yml
PROD_COMPOSE := $(DOCKER_COMPOSE) -f docker-compose.prod.yml
CLIENT_DIR := client
SERVER_DIR := server
VERSION_KIND := $(firstword $(filter patch minor major,$(MAKECMDGOALS)))

.PHONY: help build run dev prod logs down version patch minor major

help:
	@echo "Targets:"
	@echo "  make build                		Build development and production images"
	@echo "  make dev                		Start development stack"
	@echo "  make run                		Start production stack"
	@echo "  make dev logs           		Start development stack and follow logs"
	@echo "  make run logs           		Start production stack and follow logs"
	@echo "  make down               		Stop development and production stacks"
	@echo "  make version patch|minor|major	Bump synced app version and stage files"

build:
	$(DOCKER_COMPOSE) build

dev:
	$(DEV_COMPOSE) up -d

run:
	$(PROD_COMPOSE) up -d

logs:
	@if echo " $(MAKECMDGOALS) " | grep -q " run "; then \
		$(PROD_COMPOSE) logs -f; \
	else \
		$(DEV_COMPOSE) logs -f; \
	fi

down:
	$(DOCKER_COMPOSE) down

version:
	@if [ -z "$(VERSION_KIND)" ]; then \
		echo "Usage: make version patch|minor|major"; \
		exit 1; \
	fi
	@current_client_version=$$(node -p "require('./client/package.json').version"); \
	current_server_version=$$(node -p "require('./server/package.json').version"); \
	if [ "$$current_client_version" != "$$current_server_version" ]; then \
		echo "Client and server versions must match before versioning: $$current_client_version vs $$current_server_version"; \
		exit 1; \
	fi; \
	next_version=$$(node -e "const version=process.argv[1]; const level=process.argv[2]; const parts=version.split('.').map(Number); if(parts.length!==3||parts.some(Number.isNaN)){console.error('Invalid semantic version:', version); process.exit(1);} if(level==='major'){parts[0]+=1; parts[1]=0; parts[2]=0;} else if(level==='minor'){parts[1]+=1; parts[2]=0;} else {parts[2]+=1;} process.stdout.write(parts.join('.'));" "$$current_client_version" "$(VERSION_KIND)"); \
	for dir in $(CLIENT_DIR) $(SERVER_DIR); do \
		(cd $$dir && npm version $$next_version --no-git-tag-version); \
	done; \
	git add $(CLIENT_DIR)/package.json $(CLIENT_DIR)/package-lock.json $(SERVER_DIR)/package.json $(SERVER_DIR)/package-lock.json; \
	echo "Versions bumped from $$current_client_version to $$next_version ($(VERSION_KIND)). Commit and tag when ready."; \
	echo "Tip: run make run or make dev after versioning if you need to rebuild images."

patch minor major:
	@:
