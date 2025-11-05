import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Página Index - Redireciona para /home
 */
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para /home
    router.replace('/home');
  }, [router]);

  return null;
}
