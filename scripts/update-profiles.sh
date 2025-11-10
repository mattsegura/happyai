#!/bin/bash

PROJECT_REF="lyeyndkhphtywkhwjfup"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXluZGtocGh0eXdraHdqZnVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUzMTU1NSwiZXhwIjoyMDc3MTA3NTU1fQ.lBp0Rboccuj3ZTYEWEWw18Hw9d6lBIe_pPzz6OQy2Co"

# Update student role
echo "Updating student@demo.com role..."
curl -X PATCH "https://${PROJECT_REF}.supabase.co/rest/v1/profiles?id=eq.f9d39072-58ab-4d19-b8b0-e089ff00ab2e" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"role": "student", "full_name": "Demo Student"}'

# Update teacher role
echo -e "\n\nUpdating teacher@demo.com role..."
curl -X PATCH "https://${PROJECT_REF}.supabase.co/rest/v1/profiles?id=eq.0d031159-3e7c-4775-a7b5-b970ec118ffc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"role": "teacher", "full_name": "Demo Teacher"}'

# Update admin role
echo -e "\n\nUpdating admin@demo.com role..."
curl -X PATCH "https://${PROJECT_REF}.supabase.co/rest/v1/profiles?id=eq.ea55592c-eb47-4de9-a8d1-74184a4ffd6f" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"role": "admin", "full_name": "Demo Admin"}'

echo -e "\n\nRoles updated successfully!"
