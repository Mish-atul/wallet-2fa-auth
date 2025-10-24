-- Update demo user password hash to use Web Crypto API format
-- This hash is for password "password123" using our new hashing method
UPDATE users 
SET password_hash = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
WHERE email = 'demo@example.com';

-- If demo user doesn't exist, create it
INSERT INTO users (email, password_hash, created_at, updated_at)
SELECT 'demo@example.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'demo@example.com'
);
