// Simple icon replacements to avoid ad blocker issues
export const Lock = ({ className }: { className?: string }) => (
  <span className={className}>🔒</span>
);

export const Mail = ({ className }: { className?: string }) => (
  <span className={className}>📧</span>
);

export const Wallet = ({ className }: { className?: string }) => (
  <span className={className}>👛</span>
);

export const AlertCircle = ({ className }: { className?: string }) => (
  <span className={className}>⚠️</span>
);

export const Loader2 = ({ className }: { className?: string }) => (
  <span className={`${className} animate-spin`}>⏳</span>
);

export const CheckCircle = ({ className }: { className?: string }) => (
  <span className={className}>✅</span>
);

export const LogOut = ({ className }: { className?: string }) => (
  <span className={className}>🚪</span>
);

export const Shield = ({ className }: { className?: string }) => (
  <span className={className}>🛡️</span>
);
