/*
  # Wallet-Based 2FA Authentication System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - User email for initial login
      - `password_hash` (text) - Hashed password
      - `wallet_address` (text, nullable) - Ethereum wallet address for 2FA
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `auth_nonces`
      - `id` (uuid, primary key)
      - `login_id` (uuid, unique) - Temporary login session identifier
      - `nonce` (text, unique) - Random nonce for SIWE verification
      - `user_id` (uuid, foreign key) - Reference to users table
      - `expires_at` (timestamptz) - Nonce expiration (2 minutes)
      - `used` (boolean) - Whether nonce has been used
      - `created_at` (timestamptz) - Nonce creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access only
    - Indexes on frequently queried columns (email, login_id, nonce)

  3. Notes
    - Password hashes should be generated using bcrypt or similar
    - Nonces are single-use and expire after 2 minutes
    - Wallet address is initially null until first 2FA verification
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create auth_nonces table
CREATE TABLE IF NOT EXISTS auth_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  nonce text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_auth_nonces_login_id ON auth_nonces(login_id);
CREATE INDEX IF NOT EXISTS idx_auth_nonces_nonce ON auth_nonces(nonce);
CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires_at ON auth_nonces(expires_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_nonces ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for auth_nonces table
CREATE POLICY "Service role can manage nonces"
  ON auth_nonces FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a demo user for testing (password is "password123")
-- Using a simple hash for demo - in production use bcrypt
INSERT INTO users (email, password_hash) 
VALUES ('demo@example.com', '$2b$10$rKvVPZqGmK8p5o9Z1Z.5KedLX8Zn8H8qC5Lp7J5jN5Kp0Q5Z1Z.5K')
ON CONFLICT (email) DO NOTHING;