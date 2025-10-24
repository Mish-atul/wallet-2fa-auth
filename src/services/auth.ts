import { BrowserProvider } from 'ethers';
import { SiweMessage as SiweMessageType, LoginResponse, VerifyResponse } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function register(email: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string; user?: any }> {
  const response = await fetch(`${API_BASE_URL}/auth-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/-auth-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found');
  }

  // Ensure proper EIP-55 checksum format
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address format');
  }
  
  return address;
}

export async function signMessage(siweMessage: SiweMessageType, walletAddress: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const updatedMessage = { ...siweMessage, address: walletAddress };

  const message = createSiweMessage(updatedMessage);

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signature = await signer.signMessage(message);

  return signature;
}

export async function verify2FA(loginId: string, signature: string, message: string): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/-auth-verify-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ loginId, signature, message }),
  });

  if (!response.ok) {
    const error = await response.json();
    
    // Handle wallet mismatch error with detailed information
    if (error.expectedWallet && error.connectedWallet) {
      throw new Error(
        `Wallet mismatch! Expected: ${error.expectedWallet}, Connected: ${error.connectedWallet}. Please switch to the correct wallet in MetaMask.`
      );
    }
    
    throw new Error(error.error || 'Verification failed');
  }

  return response.json();
}

function createSiweMessage(message: SiweMessageType): string {
  return `${message.domain} wants you to sign in with your Ethereum account:
${message.address}

${message.statement}

URI: ${message.uri}
Version: ${message.version}
Chain ID: ${message.chainId}
Nonce: ${message.nonce}
Issued At: ${message.issuedAt}
Expiration Time: ${message.expirationTime}`;
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}
