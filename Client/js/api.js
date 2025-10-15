export async function refreshAccessToken() {
  try {
    const response = await fetch('http://localhost:3284/refresh', {
      method: 'GET',
      credentials: 'include' 
    });

    if (!response.ok) {
      throw new Error('Could not refresh token');
    }

    const data = await response.json();
    return data.accessToken;
  } catch (err) {
    console.error('Error refreshing token:', err); 
    
  }
}

