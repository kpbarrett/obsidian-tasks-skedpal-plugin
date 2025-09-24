SHELL := /bin/bash
DATE := $(shell date +%F)

.PHONY: plan test report cycle ci clean-artifacts process-next-task agent-test agent-docs agent-status agent-process help

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

process-next-task:
	node scripts/process_next_task.js

# Agent System Commands
agent-test: ## Test agent system functionality
	@echo "== Testing Agent System =="
	cd tests && pnpm exec playwright test --grep "agent system"

agent-docs: ## Open agent system documentation
	@echo "== Agent System Documentation =="
	@echo "Main documentation: docs/agent-system.md"
	@echo "Workflow diagram: docs/workflow-diagram.md"
	@echo "Available agents:"
	@ls -1 scripts/agents/ | grep -v orchestrator | sed 's/\.js//' | sed 's/^/- /'

agent-status: ## Show current agent system status
	@echo "== Agent System Status =="
	@echo "Inbox tasks: $$(ls ops/tasks/inbox/*.json 2>/dev/null | wc -l || echo 0)"
	@echo "Working tasks: $$(ls ops/tasks/working/*.json 2>/dev/null | wc -l || echo 0)"
	@echo "Done tasks: $$(ls ops/tasks/done/*.json 2>/dev/null | wc -l || echo 0)"
	@echo "Latest report: ops/reports/$(DATE)/summary.jsonl"

agent-process: process-next-task ## Alias for process-next-task
	@echo "Task processed using agent system"

help: ## Show this help
	@echo "Available commands:"
	@echo ""
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\$$//' | sed -e 's/##//'

