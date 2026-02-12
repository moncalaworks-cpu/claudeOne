#!/bin/bash
#
# agent-monitor skill: List agents with automatic server management
# Usage: ./agents-list.sh [--verbose]
#
# Features:
# - Checks if agent monitor server is running
# - Starts server if not running
# - Lists all active agents
# - Automatically stops server after listing (if we started it)
# - Returns agent data in easy-to-read format
#

set -e

VERBOSE=${1:-""}
PORT=3000
MAX_RETRIES=10
RETRY_DELAY=1

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_verbose() {
  if [ "$VERBOSE" == "--verbose" ]; then
    echo -e "${YELLOW}[DEBUG]${NC} $1" >&2
  fi
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1" >&2
}

# Check if server is running by looking for the process
is_server_running() {
  pgrep -f "node src/index.js start" > /dev/null 2>&1
  return $?
}

# Wait for server to start
wait_for_server() {
  local retries=0
  print_verbose "Waiting for server to start..."

  while ! is_server_running && [ $retries -lt $MAX_RETRIES ]; do
    sleep $RETRY_DELAY
    retries=$((retries + 1))
    print_verbose "Attempt $retries/$MAX_RETRIES..."
  done

  if [ $retries -ge $MAX_RETRIES ]; then
    print_error "Server failed to start after $MAX_RETRIES attempts"
    return 1
  fi

  print_verbose "Server started successfully"
  return 0
}

# Main script
main() {
  print_verbose "Starting agent-monitor skill..."

  # Check if server is already running
  if is_server_running; then
    print_verbose "Server is already running on port $PORT"
    SERVER_WAS_RUNNING=true
  else
    print_verbose "Server not running, starting it..."
    SERVER_WAS_RUNNING=false

    # Start the server in background, suppress output
    npm start > /tmp/agent-monitor.log 2>&1 &
    SERVER_PID=$!
    print_verbose "Started server with PID $SERVER_PID"

    # Wait for server to be ready
    if ! wait_for_server; then
      print_error "Failed to start server"
      kill $SERVER_PID 2>/dev/null || true
      exit 1
    fi

    print_success "Server started"
  fi

  # List agents
  print_verbose "Fetching agent list..."
  echo ""

  if node src/index.js agents; then
    RESULT=0
  else
    print_error "Failed to get agent list"
    RESULT=1
  fi

  echo ""

  # Stop server if we started it
  if [ "$SERVER_WAS_RUNNING" == "false" ]; then
    print_verbose "Stopping server (PID $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null || true
    sleep 1
    print_success "Server stopped"
  else
    print_verbose "Server was already running, leaving it running"
  fi

  print_verbose "agent-monitor skill completed"
  exit $RESULT
}

# Run main function
main
