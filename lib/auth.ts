export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  return !!token;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('accessToken');
}

export function getIdToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('idToken');
}

export function signOut(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
  
  window.location.href = '/signin';
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}