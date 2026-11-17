'use client';

import AuthSection from '@/components/AuthSection';

export default function AuthForm({
  onClose,
  initialMode = 'signin',
}: {
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
}) {
  return <AuthSection onClose={onClose} initialMode={initialMode} />;
}
