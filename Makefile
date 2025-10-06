.PHONY: help setup start stop restart logs clean monitoring-start monitoring-stop monitoring-logs status health

# Colors
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

setup: ## Setup monitoring infrastructure
	@echo "$(YELLOW)Setting up monitoring stack...$(NC)"
	@chmod +x setup-monitoring.sh
	@./setup-monitoring.sh
	@echo "$(GREEN)Setup complete!$(NC)"

start: ## Start main application stack
	@echo "$(YELLOW)Starting main application stack...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)Main stack started!$(NC)"
	@make status

stop: ## Stop main application stack
	@echo "$(YELLOW)Stopping main application stack...$(NC)"
	@docker-compose down
	@echo "$(GREEN)Main stack stopped!$(NC)"

restart: ## Restart main application stack
	@echo "$(YELLOW)Restarting main application stack...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)Main stack restarted!$(NC)"

logs: ## Show logs from main stack
	@docker-compose logs -f

monitoring-start: ## Start monitoring stack
	@echo "$(YELLOW)Starting monitoring stack...$(NC)"
	@docker-compose -f docker-compose.monitoring.yml up -d
	@echo "$(GREEN)Monitoring stack started!$(NC)"
	@make monitoring-status

monitoring-stop: ## Stop monitoring stack
	@echo "$(YELLOW)Stopping monitoring stack...$(NC)"
	@docker-compose -f docker-compose.monitoring.yml down
	@echo "$(GREEN)Monitoring stack stopped!$(NC)"

monitoring-logs: ## Show logs from monitoring stack
	@docker-compose -f docker-compose.monitoring.yml logs -f

monitoring-restart: ## Restart monitoring stack
	@echo "$(YELLOW)Restarting monitoring stack...$(NC)"
	@docker-compose -f docker-compose.monitoring.yml restart
	@echo "$(GREEN)Monitoring stack restarted!$(NC)"

start-all: setup start monitoring-start ## Setup and start everything

stop-all: stop monitoring-stop ## Stop everything

status: ## Show status of main containers
	@echo "$(BLUE)Main Stack Status:$(NC)"
	@docker-compose ps

monitoring-status: ## Show status of monitoring containers
	@echo "$(BLUE)Monitoring Stack Status:$(NC)"
	@docker-compose -f docker-compose.monitoring.yml ps

health: ## Check health of all services
	@echo "$(BLUE)Health Check:$(NC)"
	@echo "$(YELLOW)API:$(NC)"
	@curl -s http://localhost:5000/ | head -n 5 || echo "❌ API not responding"
	@echo "\n$(YELLOW)Prometheus:$(NC)"
	@curl -s http://localhost:9090/-/healthy || echo "❌ Prometheus not responding"
	@echo "\n$(YELLOW)Grafana:$(NC)"
	@curl -s http://localhost:3000/api/health | head -n 5 || echo "❌ Grafana not responding"

clean: ## Clean up volumes and containers
	@echo "$(YELLOW)⚠️  This will remove all containers and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker-compose -f docker-compose.monitoring.yml down -v; \
		echo "$(GREEN)Cleanup complete!$(NC)"; \
	fi

rebuild: ## Rebuild and restart main application
	@echo "$(YELLOW)Rebuilding application...$(NC)"
	@docker-compose up -d --build
	@echo "$(GREEN)Rebuild complete!$(NC)"

shell-api: ## Access API container shell
	@docker exec -it node-api sh

shell-mongo: ## Access MongoDB shell
	@docker exec -it mongodb mongosh -u admin -p secret --authenticationDatabase admin

shell-postgres: ## Access PostgreSQL shell
	@docker exec -it postgres psql -U postgres -d ecommerce

shell-redis: ## Access Redis CLI
	@docker exec -it redis redis-cli

backup-db: ## Backup all databases
	@echo "$(YELLOW)Creating database backups...$(NC)"
	@mkdir -p backups
	@docker exec mongodb mongodump --username admin --password secret --authenticationDatabase admin --out /tmp/backup
	@docker cp mongodb:/tmp/backup ./backups/mongodb-$(shell date +%Y%m%d-%H%M%S)
	@docker exec postgres pg_dump -U postgres ecommerce > ./backups/postgres-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)Backups created in ./backups/$(NC)"

urls: ## Show access URLs
	@echo "$(BLUE)Access URLs:$(NC)"
	@echo "  API:          $(GREEN)http://localhost:5000$(NC)"
	@echo "  Metrics:      $(GREEN)http://localhost:5000/metrics$(NC)"
	@echo "  GraphQL:      $(GREEN)http://localhost:5000/graphql$(NC)"
	@echo "  Prometheus:   $(GREEN)http://localhost:9090$(NC)"
	@echo "  Grafana:      $(GREEN)http://localhost:3000$(NC) (admin/admin)"
	@echo "  MongoDB:      $(GREEN)mongodb://localhost:27017$(NC)"
	@echo "  PostgreSQL:   $(GREEN)postgresql://localhost:5432$(NC)"
	@echo "  Redis:        $(GREEN)redis://localhost:6379$(NC)"