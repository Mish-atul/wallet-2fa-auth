import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { generateNonce } from 'npm:siwe@2.3.2';

// Web Crypto API-based password hashing (works in Edge Functions)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt-blockchain-2fa'); // Simple salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LoginRequest {
  email: string;
  password: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cdvdbyinqosqidwavobp.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdmRieWlucW9zcWlkd2F2b2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4MzMzNywiZXhwIjoyMDc2MjU5MzM3fQ.QTQdlu-5s0iiqfSrSsYADaRLNc5eCWCF7zYn3Vsfw8Y';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify password using Web Crypto API
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a random nonce for SIWE
    const nonce = generateNonce();
    const loginId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Store nonce in database
    const { error: nonceError } = await supabase
      .from('auth_nonces')
      .insert({
        login_id: loginId,
        nonce,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (nonceError) {
      console.error('Error storing nonce:', nonceError);
      return new Response(
        JSON.stringify({ error: 'Failed to create login session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create SIWE message
    const domain = new URL(req.headers.get('origin') || 'http://localhost:5173').host;
    const uri = req.headers.get('origin') || 'http://localhost:5173';
    const issuedAt = new Date().toISOString();

    const siweMessage = {
      domain,
      address: '0x0000000000000000000000000000000000000000', // Placeholder, will be replaced by wallet
      statement: 'Wallet-based 2FA login',
      uri,
      version: '1',
      chainId: 1,
      nonce,
      issuedAt,
      expirationTime: expiresAt.toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        loginId,
        siweMessage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});