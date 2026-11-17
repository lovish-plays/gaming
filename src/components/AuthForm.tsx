'use client';

import AuthSection from '@/components/AuthSection';

export default function AuthForm({ onClose }: { onClose?: () => void }) {
  return <AuthSection onClose={onClose} />;
}
