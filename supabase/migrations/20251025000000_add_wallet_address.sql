-- Add wallet_address column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Create index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Update existing users to have null wallet_address (they'll need to re-authenticate to set it)
-- The demo user will get their wallet address set during first 2FA completion
