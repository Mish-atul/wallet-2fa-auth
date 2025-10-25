# 🔐 Wallet-Based 2FA Authentication System

A modern, secure authentication system that combines traditional email/password login with MetaMask wallet signature verification for enhanced security. Built with React, TypeScript, Supabase, and featuring a beautiful glassmorphism UI.

![Authentication Flow](https://img.shields.io/badge/Authentication-2FA%20Wallet-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![MetaMask](https://img.shields.io/badge/MetaMask-Integration-orange)

## ✨ Features

### 🔒 **Dual-Layer Security**
- **Traditional Authentication**: Email and password verification
- **Wallet-Based 2FA**: MetaMask signature verification using SIWE protocol
- **Wallet Address Validation**: Prevents cross-account wallet usage
- **Time-Limited Nonces**: 2-minute session validation for enhanced security

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Beautiful frosted glass effects
- **Gradient Themes**: Different color schemes for each page
- **Smooth Animations**: Floating elements and hover effects
- **Responsive Design**: Works seamlessly on all devices
- **Enhanced Error Handling**: Clear, actionable error messages

### 🚀 **Technical Excellence**
- **React 18 + TypeScript**: Type-safe, modern development
- **Vite Build System**: Lightning-fast development and builds
- **Supabase Backend**: Scalable PostgreSQL database and Edge Functions
- **TailwindCSS**: Utility-first CSS framework
- **Ethers.js v6**: Ethereum wallet integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase       │    │   MetaMask      │
│   React + TS    │◄──►│   Edge Functions │◄──►│   Wallet        │
│   Vite + Tailwind│    │   PostgreSQL     │    │   Signature     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Authentication Flow**
1. **Email/Password Login** → Generates SIWE message with nonce
2. **MetaMask Connection** → User connects wallet
3. **Signature Verification** → User signs SIWE message
4. **Wallet Validation** → System verifies wallet matches user account
5. **Access Granted** → User gains access to protected dashboard

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- MetaMask browser extension
- Supabase account

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/wallet-2fa-auth.git
cd wallet-2fa-auth
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **4. Database Setup**
Run these SQL commands in Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auth_nonces table
CREATE TABLE auth_nonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  login_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_auth_nonces_login_id ON auth_nonces(login_id);
CREATE INDEX idx_auth_nonces_user_id ON auth_nonces(user_id);
```

### **5. Deploy Edge Functions**
Deploy these functions to Supabase:
- `auth-login` - Handles email/password verification
- `auth-register` - Manages user registration
- `auth-verify-2fa` - Validates wallet signatures

### **6. Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── LoginPage.tsx    # Login interface with 2FA
│   ├── RegisterPage.tsx # User registration
│   └── Dashboard.tsx    # Protected dashboard
├── services/            # API services
│   └── auth.ts         # Authentication logic
├── types/              # TypeScript interfaces
│   └── index.ts        # Type definitions
└── styles/
    └── index.css       # Global styles + animations

supabase/
├── functions/          # Edge Functions
│   ├── auth-login/     # Login endpoint
│   ├── auth-register/  # Registration endpoint
│   └── auth-verify-2fa/# 2FA verification
└── migrations/         # Database migrations
    └── *.sql          # Schema definitions
```

## 🔧 Configuration

### **Supabase Edge Functions Environment Variables**
Set these in Supabase Dashboard → Edge Functions → Settings:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **CORS Configuration**
Add your domain to Supabase → Settings → API → CORS Origins:
- `http://localhost:5173` (development)
- `https://your-domain.vercel.app` (production)

## 🎯 Usage

### **Demo Account**
- **Email**: `demo@example.com`
- **Password**: `password123`

### **Registration Flow**
1. Click "Create one here" on login page
2. Enter email, password, and confirm password
3. Submit registration form
4. Redirected to login page on success

### **Login Flow**
1. Enter email and password
2. Click "Verify" to generate SIWE message
3. Connect MetaMask wallet
4. Sign the SIWE message
5. Access granted to dashboard

### **Wallet Validation**
- **First login**: Wallet address gets stored with user account
- **Subsequent logins**: Must use the same wallet address
- **Mismatch error**: Clear message showing expected vs connected wallet

## 🚀 Deployment

### **Vercel Deployment**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### **Environment Variables for Production**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🛡️ Security Features

### **Password Security**
- SHA-256 hashing with salt
- Minimum 6-character requirement
- Secure password validation

### **Wallet Security**
- SIWE (Sign-In With Ethereum) protocol
- EIP-55 address validation
- Nonce-based replay protection
- Time-limited sessions (2 minutes)

### **Session Management**
- JWT-like token generation
- 24-hour token expiration
- Secure logout functionality

## 🎨 UI Features

### **Design System**
- **Login Page**: Indigo → Purple → Pink gradient
- **Register Page**: Emerald → Teal → Cyan gradient  
- **Dashboard**: Violet → Purple → Indigo gradient

### **Animations**
- Floating background orbs
- Smooth hover transitions
- Loading spinners
- Scale animations on buttons

### **Responsive Design**
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions

## 🔍 Troubleshooting

### **Common Issues**

**MetaMask Not Detected**
```javascript
// Check if MetaMask is installed
if (!window.ethereum) {
  alert('Please install MetaMask to continue');
}
```

**Wallet Mismatch Error**
- Switch to the correct wallet in MetaMask
- Or register a new account with current wallet

**CORS Errors**
- Verify domain is added to Supabase CORS settings
- Check environment variables are set correctly

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run typecheck`

## 📚 API Reference

### **Authentication Endpoints**

#### **POST /auth-login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **POST /auth-register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### **POST /auth-verify-2fa**
```json
{
  "loginId": "uuid",
  "signature": "0x...",
  "message": "siwe_message_string"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **MetaMask** - Wallet integration
- **SIWE** - Sign-In With Ethereum protocol
- **Tailwind CSS** - Styling framework
- **Lucide React** - Beautiful icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/wallet-2fa-auth/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/wallet-2fa-auth/discussions)

---

**Built with ❤️ for secure Web3 authentication**
