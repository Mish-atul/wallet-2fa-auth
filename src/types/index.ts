export interface User {
  email: string;
  walletAddress: string;
}

export interface SiweMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

export interface LoginResponse {
  success: boolean;
  loginId: string;
  siweMessage: SiweMessage;
}

export interface VerifyResponse {
  success: boolean;
  token: string;
  user: User;
}
