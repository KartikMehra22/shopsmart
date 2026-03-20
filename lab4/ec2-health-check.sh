#!/bin/bash
# Simple EC2 Health Check Script

INSTANCE_URL="http://localhost:5000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $INSTANCE_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "SUCCESS: Backend is healthy (HTTP 200)"
else
    echo "FAILURE: Backend is unreachable or unhealthy (HTTP $RESPONSE)"
    exit 1
fi
