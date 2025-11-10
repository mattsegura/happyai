-- Update profile roles for demo accounts
UPDATE profiles SET role = 'student', full_name = 'Demo Student', updated_at = NOW()
WHERE id = 'f9d39072-58ab-4d19-b8b0-e089ff00ab2e';

UPDATE profiles SET role = 'teacher', full_name = 'Demo Teacher', updated_at = NOW()
WHERE id = '0d031159-3e7c-4775-a7b5-b970ec118ffc';

UPDATE profiles SET role = 'admin', full_name = 'Demo Admin', updated_at = NOW()
WHERE id = 'ea55592c-eb47-4de9-a8d1-74184a4ffd6f';
