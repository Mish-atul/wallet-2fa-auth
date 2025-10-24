import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { SiweMessage } from 'npm:siwe@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface VerifyRequest {
  loginId: string;
  signature: string;
  message: string;
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

    const { loginId, signature, message }: VerifyRequest = await req.json();

    if (!loginId || !signature || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cdvdbyinqosqidwavobp.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdmRieWlucW9zcWlkd2F2b2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4MzMzNywiZXhwIjoyMDc2MjU5MzM3fQ.QTQdlu-5s0iiqfSrSsYADaRLNc5eCWCF7zYn3Vsfw8Y';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Retrieve nonce from database
    const { data: nonceData, error: nonceError } = await supabase
      .from('auth_nonces')
      .select('*')
      .eq('login_id', loginId)
      .maybeSingle();

    if (nonceError || !nonceData) {
      return new Response(
        JSON.stringify({ error: 'Invalid login session' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if nonce has been used
    if (nonceData.used) {
      return new Response(
        JSON.stringify({ error: 'Login session already used' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if nonce has expired
    const expiresAt = new Date(nonceData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Login session expired' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify SIWE signature
    let walletAddress: string;
    try {
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });
      
      if (!fields.success) {
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify nonce matches
      if (siweMessage.nonce !== nonceData.nonce) {
        return new Response(
          JSON.stringify({ error: 'Invalid nonce' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      walletAddress = siweMessage.address;
    } catch (error) {
      console.error('Signature verification error:', error);
      return new Response(
        JSON.stringify({ error: 'Signature verification failed' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user information to check existing wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, wallet_address')
      .eq('id', nonceData.user_id)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate wallet address
    if (userData.wallet_address) {
      // User has a registered wallet address - it must match
      if (userData.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
        return new Response(
          JSON.stringify({ 
            error: 'Wallet address mismatch. Please connect the wallet address associated with this account.',
            expectedWallet: `${userData.wallet_address.slice(0, 6)}...${userData.wallet_address.slice(-4)}`,
            connectedWallet: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // First time wallet connection - store the wallet address
      await supabase
        .from('users')
        .update({ wallet_address: walletAddress })
        .eq('id', userData.id);
    }

    // Mark nonce as used
    await supabase
      .from('auth_nonces')
      .update({ used: true })
      .eq('login_id', loginId);

    // Generate a simple JWT-like token (in production, use proper JWT library)
    const token = btoa(JSON.stringify({
      userId: userData.id,
      email: userData.email,
      walletAddress,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }));

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          email: userData.email,
          walletAddress,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});