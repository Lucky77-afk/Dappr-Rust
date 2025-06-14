.PHONY: help install dev build test lint format clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development environment"
	@echo "  make build      - Build for production"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linter"
	@echo "  make format     - Format code"
	@echo "  make clean      - Clean build artifacts"

# Install dependencies
install:
	yarn install
	cd app && yarn install

# Start development environment
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Build for production
build:
	docker-compose build

# Run tests
test:
	docker-compose -f docker-compose.test.yml up --build --exit-code-from test

# Run linter
lint:
	yarn lint
	cd app && yarn lint

# Format code
format:
	yarn format
	cd app && yarn format

# Clean build artifacts
clean:
	rm -rf node_modules
	cd app && rm -rf node_modules
	docker-compose down -v
	docker system prune -f
