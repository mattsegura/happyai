#!/bin/bash

# Supabase project details
PROJECT_REF="lyeyndkhphtywkhwjfup"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXluZGtocGh0eXdraHdqZnVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUzMTU1NSwiZXhwIjoyMDc3MTA3NTU1fQ.lBp0Rboccuj3ZTYEWEWw18Hw9d6lBIe_pPzz6OQy2Co"

# Create student account
echo "Creating student@demo.com..."
curl -X POST "https://${PROJECT_REF}.supabase.co/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@demo.com",
    "password": "demo123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Demo Student"
    }
  }'

echo -e "\n\nCreating teacher@demo.com..."
curl -X POST "https://${PROJECT_REF}.supabase.co/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@demo.com",
    "password": "demo123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Demo Teacher"
    }
  }'

echo -e "\n\nCreating admin@demo.com..."
curl -X POST "https://${PROJECT_REF}.supabase.co/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "demo123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Demo Admin"
    }
  }'

echo -e "\n\nDemo accounts created successfully!"
