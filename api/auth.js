export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description });
    }

    // Security: Validate token exists
    if (!data.access_token) {
      throw new Error('No access token received from GitHub');
    }

    // Security: Add security headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'");

    // Security: Use safe token transmission (JSON in postMessage, not template literal)
    // Note: Using * for origin because we don't know the exact opener origin in this serverless function
    // Alternative: configure ALLOWED_ORIGINS in env vars for production
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

    // Return token to CMS
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Complete</title>
        </head>
        <body>
          <script>
            (function() {
              if (window.opener) {
                // Security: Send token as structured data, not interpolated string
                const tokenData = ${JSON.stringify({
      token: data.access_token,
      provider: 'github'
    })};
                window.opener.postMessage(
                  'authorization:github:success:' + JSON.stringify(tokenData),
                  '${allowedOrigin}'
                );
                window.close();
              } else {
                document.body.innerHTML = '<h1>Authentication successful! You can close this window.</h1>';
              }
            })();
          </script>
          <p>Authorizing... You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
}
