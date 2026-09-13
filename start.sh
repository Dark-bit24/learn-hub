#!/bin/bash
# ============================================
# LearnHub - Start Everything
# Usage: bash start.sh
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}  LearnHub - Starting All Services    ${NC}"
echo -e "${YELLOW}======================================${NC}"

# Get the directory this script lives in
DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Start Backend ────────────────────────────
echo -e "\n${BLUE}▶ Starting Backend  (http://localhost:5000)${NC}"
cd "$DIR/server"
npm run dev &
SERVER_PID=$!

# ── Start Frontend ───────────────────────────
echo -e "${GREEN}▶ Starting Frontend (http://localhost:5173)${NC}\n"
cd "$DIR/client"
npm run dev &
CLIENT_PID=$!

echo -e "${YELLOW}--------------------------------------${NC}"
echo -e "  Backend  PID: $SERVER_PID"
echo -e "  Frontend PID: $CLIENT_PID"
echo -e "${YELLOW}--------------------------------------${NC}"
echo -e "  Press ${RED}Ctrl+C${NC} to stop everything\n"

# Stop both when script is interrupted
trap "echo ''; echo 'Stopping...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
