SHELL := /bin/bash
DATE := $(shell date +%F)

.PHONY: plan test report cycle ci clean-artifacts

plan:
	@echo "== Plan ==" && ls -1 ops/tasks/inbox || true

test:
	@echo "== Playwright =="
	cd tests && pnpm exec playwright test || true

report:
	@mkdir -p ops/reports/$(DATE)
	node scripts/report.js --out ops/reports/$(DATE)/summary.json

cycle: ## day-long pass
	@bash scripts/orchestrate.sh

ci: ## nightly: lint, unit, e2e, pack
	pnpm run lint || true
	pnpm run unit || true
	pnpm --filter tests exec playwright test || true
	pnpm run pack || true
	./scripts/checkpoint.sh || true

clean-artifacts:
	rm -rf playwright-report test-results || true
