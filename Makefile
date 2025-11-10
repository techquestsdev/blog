.PHONY: help install dev build preview lighthouse lighthouse-full test test-unit test-integration test-coverage lint format clean docker-build docker-run docker-push docker-compose-up docker-compose-down

# Variables
DOCKER_REGISTRY := ghcr.io
DOCKER_IMAGE := techquestsdev/blog
DOCKER_TAG := latest

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	bun install

dev: ## Start development server
	bun run dev

build: ## Build for production
	bun run build

preview: ## Preview production build
	bun run preview

lighthouse: ## Run Lighthouse performance audit (requires built app)
	@test -d build || { echo "Error: build/ directory not found. Run 'make build' first."; exit 1; }
	@echo "Starting preview server..."
	@bun run preview > /dev/null 2>&1 & echo $$! > .preview.pid
	@sleep 2
	@echo "Running Lighthouse audit..."
	@bunx lighthouse http://localhost:4173 \
		--only-categories=performance \
		--output=json \
		--output-path=./lighthouse-report.json \
		--chrome-flags="--headless" \
		--quiet
	@echo "Parsing results..."
	@node -e "const data = JSON.parse(require('fs').readFileSync('./lighthouse-report.json', 'utf-8')); console.log('\\nPerformance Score:', Math.round(data.categories.performance.score * 100) + '/100'); const m = data.audits; console.log('\\nCore Web Vitals:'); console.log('  FCP (First Contentful Paint):', m['first-contentful-paint'].displayValue); console.log('  LCP (Largest Contentful Paint):', m['largest-contentful-paint'].displayValue); console.log('  CLS (Cumulative Layout Shift):', m['cumulative-layout-shift'].displayValue); console.log('  TTI (Time to Interactive):', m['interactive'].displayValue); console.log('\\nOther Metrics:'); console.log('  Speed Index:', m['speed-index'].displayValue); console.log('  Total Blocking Time:', m['total-blocking-time'].displayValue); console.log('\\nFull report saved to: lighthouse-report.json\\n');"
	@kill `cat .preview.pid` && rm .preview.pid
	@echo "Preview server stopped"

lighthouse-full: build lighthouse ## Build site and run Lighthouse audit

test: ## Run all tests (unit + integration)
	bun run test

test-unit: ## Run unit tests (vitest)
	bun run test:unit

test-unit-watch: ## Run unit tests in watch mode
	bun vitest

test-coverage: ## Run unit tests with coverage
	bun run test:unit --coverage

test-coverage-watch: ## Run unit tests with coverage in watch mode
	bun run test:unit --coverage --watch

test-integration: ## Run integration tests (requires built app)
	bun run build
	bun run test:integration

test-integration-setup: ## Install Playwright dependencies
	bunx playwright install --with-deps

lint: ## Run linter
	bun run lint

format: ## Format code
	bun run format

clean: ## Clean build artifacts and dependencies
	rm -rf build .svelte-kit node_modules coverage test-results playwright-report lighthouse-report.json .preview.pid

# Docker commands (requires pre-built files in build/ directory)
docker-build: ## Build Docker image (requires 'make build' first)
	@test -d build || { echo "Error: build/ directory not found. Run 'make build' first."; exit 1; }
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-build-full: build docker-build ## Build site and Docker image

docker-run: ## Run Docker container locally
	docker run -p 3000:3000 $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)

docker-push: ## Push Docker image to registry
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)

docker-build-push: docker-build docker-push ## Build and push Docker image

docker-scan: ## Scan Docker image for vulnerabilities with Trivy
	@command -v trivy >/dev/null 2>&1 || { echo "Trivy not installed. Install from: https://github.com/aquasecurity/trivy"; exit 1; }
	trivy image $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)

docker-scan-critical: ## Scan Docker image for critical vulnerabilities only
	@command -v trivy >/dev/null 2>&1 || { echo "Trivy not installed. Install from: https://github.com/aquasecurity/trivy"; exit 1; }
	trivy image --severity CRITICAL,HIGH $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)

# Docker Compose commands
docker-compose-up: ## Start services with docker-compose
	docker-compose up -d

docker-compose-down: ## Stop services with docker-compose
	docker-compose down

docker-compose-logs: ## Show docker-compose logs
	docker-compose logs -f

docker-compose-rebuild: ## Rebuild and restart services
	docker-compose up -d --build

# CI/CD commands
ci-validate: ## Validate package.json and configuration
	@echo "Validating package.json..."
	@bun pm ls
	@echo "Checking for lockfile..."
	@test -f bun.lock && echo "✓ bun.lock found" || echo "⚠ bun.lock not found"

ci-lint-test: install lint test ## Run CI lint and test pipeline
	@echo "CI lint and test completed successfully"

ci-build: install build ## Run CI build pipeline
	@echo "CI build completed successfully"

ci-full: ci-validate ci-lint-test ci-build ## Run full CI pipeline
	@echo "Full CI pipeline completed successfully"

# Development helpers
deps-update: ## Update dependencies
	bun update

deps-audit: ## Audit dependencies for vulnerabilities
	bun audit

deps-outdated: ## Check for outdated dependencies
	bun outdated
