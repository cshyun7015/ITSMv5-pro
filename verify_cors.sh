#!/bin/bash
# CORS Preflight Redirect Verification Script

echo "Checking Request API (No trailing slash)..."
STATUS1=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:8000/api/v1/request)
if [ "$STATUS1" == "204" ]; then
  echo "✅ PASS: Request API (No slash) returns 204"
else
  echo "❌ FAIL: Request API (No slash) returns $STATUS1"
fi

echo "Checking Request API (With trailing slash)..."
STATUS2=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:8000/api/v1/request/)
if [ "$STATUS2" == "204" ]; then
  echo "✅ PASS: Request API (With slash) returns 204"
else
  echo "❌ FAIL: Request API (With slash) returns $STATUS2"
fi

echo "Checking System API (No trailing slash)..."
STATUS3=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:8000/api/v1/system)
if [ "$STATUS3" == "204" ]; then
  echo "✅ PASS: System API (No slash) returns 204"
else
  echo "❌ FAIL: System API (No slash) returns $STATUS3"
fi

echo "Verification complete!"
