import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const PROTECTED = ['/dashboard'];

function AuthGuard({ children, pathname }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (PROTECTED.includes(pathname)) {
      const auth = localStorage.getItem('empirika_authed');
      if (!auth) {
        router.replace('/login');
      } else {
        setReady(true);
      }
    } else {
      setReady(true);
    }
  }, [pathname]);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 20,
          fontWeight: 300,
          color: '#333',
          letterSpacing: '-0.3px',
        }}>
          Empirika
        </span>
      </div>
    );
  }

  return children;
}

export default function App({ Component, pageProps, router }) {
  return (
    <AuthGuard pathname={router.pathname}>
      <Component {...pageProps} />
    </AuthGuard>
  );
}
