#!/bin/bash

# Parallel Development Script for Obsidian Tasks SkedPal Plugin
# This script launches AI agents to work on tasks from sprint_plan.json

# Configuration
SPRINT_NUMBER=${1:-1}  # Default to sprint 1 if not specified
DRY_RUN=${2:-false}    # Dry run mode - print commands without executing
AGENT_COUNTS="dev1 dev2 ta1 ta2"  # Adjust based on team size

# Show usage if help requested
if [ "$SPRINT_NUMBER" = "--help" ] || [ "$SPRINT_NUMBER" = "-h" ]; then
    echo "Usage: $0 [sprint_number] [dry_run]"
    echo "  sprint_number: Sprint number to execute (default: 1)"
    echo "  dry_run: Set to 'true' to print commands without executing (default: false)"
    echo ""
    echo "Examples:"
    echo "  $0 1           # Execute sprint 1 tasks"
    echo "  $0 2 true      # Dry run for sprint 2 - show commands only"
    echo "  $0 --help      # Show this help message"
    exit 0
fi

# Function to launch agent with specific task
launch_agent() {
    local agent_type=$1
    local profile=$2
    local command=$3
    local env_name=""
    
    case $agent_type in
        "dev"*) env_name="dev${agent_type:3}" ;;
        "ta"*) env_name="ta${agent_type:2}" ;;
        "tester") env_name="tester" ;;
        "engineer") env_name="eng" ;;
    esac
    
    if [ "$DRY_RUN" = "true" ]; then
        echo "[DRY RUN] Would launch $agent_type with profile $profile: $command"
        echo "         Command: cnp2 --env=$env_name --profile=$profile \"$command\""
    else
        echo "Launching $agent_type with profile $profile: $command"
        cnp2 --env=$env_name --profile=$profile "$command" &
    fi
}

# Extract tasks for the specified sprint
SPRINT_TASKS=$(jq -r --arg sprint "$SPRINT_NUMBER" '.sprints[] | select(.sprint == ($sprint | tonumber)) | .tasks[] | "\(.role)|\(.commands | join("; "))"' sprint_plan.json)

if [ -z "$SPRINT_TASKS" ]; then
    echo "Error: Sprint $SPRINT_NUMBER not found in sprint_plan.json"
    exit 1
fi

if [ "$DRY_RUN" = "true" ]; then
    echo "=== DRY RUN: Parallel Development Commands for Sprint $SPRINT_NUMBER ==="
else
    echo "=== Starting Parallel Development for Sprint $SPRINT_NUMBER ==="
fi

# Launch agents for each role
while IFS='|' read -r role commands; do
    case $role in
        "developer")
            # Launch multiple developer agents
            IFS=';' read -ra dev_commands <<< "$commands"
            for i in "${!dev_commands[@]}"; do
                agent_num=$((i + 1))
                launch_agent "dev${agent_num}" "developer" "${dev_commands[$i]}"
            done
            ;;
        "test-author")
            # Launch multiple test author agents
            IFS=';' read -ra ta_commands <<< "$commands"
            for i in "${!ta_commands[@]}"; do
                agent_num=$((i + 1))
                launch_agent "ta${agent_num}" "test-author" "${ta_commands[$i]}"
            done
            ;;
        "tester")
            # Launch tester agent
            IFS=';' read -ra tester_commands <<< "$commands"
            for command in "${tester_commands[@]}"; do
                launch_agent "tester" "test" "$command"
            done
            ;;
        "engineer")
            # Launch engineer agent
            IFS=';' read -ra eng_commands <<< "$commands"
            for command in "${eng_commands[@]}"; do
                launch_agent "engineer" "engineer" "$command"
            done
            ;;
    esac
done <<< "$SPRINT_TASKS"

# Wait for all background processes to complete (only if not in dry run mode)
if [ "$DRY_RUN" != "true" ]; then
    echo "Waiting for all agents to complete their tasks..."
    wait
    echo "=== Parallel Development for Sprint $SPRINT_NUMBER Complete ==="
else
    echo "=== DRY RUN Complete - No commands were executed ==="
fi