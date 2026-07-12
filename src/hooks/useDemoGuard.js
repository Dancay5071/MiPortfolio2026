export const DEMO_EMAIL    = 'demo@code.com';
export const DEMO_PASSWORD = 'demo1234';

export function useDemoGuard(session, addToast) {
  const isDemoUser = session?.user?.email === DEMO_EMAIL;

  function demoIntercept(fakeAction = null) {
    if (!isDemoUser) return false;

    addToast('[ MODO INVITADO ] ', 'demo');

    console.info(
      '%c[ DEMO MODE ] %cAcción interceptada. Supabase no fue llamado.',
      'color:#a78bfa;font-weight:bold;font-family:monospace',
      'color:#94a3b8;font-family:monospace'
    );

    if (typeof fakeAction === 'function') {
      fakeAction();
    }

    return true;
  }

  return { isDemoUser, demoIntercept };
}
