#!/bin/bash

# Start the admin panel on port 3001
echo "Starting admin panel on port 3001..."
cd admin && npm run dev &
ADMIN_PID=$!

# Wait a bit for admin to start
sleep 3

# Start the proxy server on port 3000
echo "Starting proxy server on port 3000..."
cd .. && node server.js &
PROXY_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down servers..."
    kill $ADMIN_PID $PROXY_PID 2>/dev/null
    exit
}

# Trap CTRL+C and cleanup
trap cleanup INT TERM

echo ""
echo "✅ Servers are running:"
echo "   Website: http://localhost:3000"
echo "   Admin Panel: http://localhost:3000/admin"
echo ""
echo "Press CTRL+C to stop all servers"

# Wait for both processes
wait
