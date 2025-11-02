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

    // ⚠️ SECURITY FIX: Remove hardcoded credentials and use environment variables only
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Validate environment variables are set
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
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
    try {
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (fields.data.nonce !== nonceData.nonce) {
        return new Response(
          JSON.stringify({ error: 'Invalid nonce' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const walletAddress = fields.data.address;

      // Get user information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
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

      // Check if wallet address matches
      if (userData.wallet_address && userData.wallet_address !== walletAddress) {
        return new Response(
          JSON.stringify({
            error: 'Wallet address mismatch. Please use the correct wallet.',
            expectedWallet: userData.wallet_address,
            connectedWallet: walletAddress,
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Update user's wallet address if not set
      if (!userData.wallet_address) {
        await supabase
          .from('users')
          .update({ wallet_address: walletAddress })
          .eq('id', nonceData.user_id);
      }

      // Mark nonce as used
      await supabase
        .from('auth_nonces')
        .update({ used: true })
        .eq('id', nonceData.id);

      // Generate session token (simple JWT-like token)
      const sessionToken = crypto.randomUUID();
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      return new Response(
        JSON.stringify({
          success: true,
          token: sessionToken,
          user: {
            id: userData.id,
            email: userData.email,
            walletAddress,
          },
          expiresAt: expirationTime.toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('SIWE verification error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
