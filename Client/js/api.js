export async function refreshAccessToken() {
  try {
    const response = await fetch('https://moso-interior-site.onrender.com/refresh', {
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

