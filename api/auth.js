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
                client_id: 'Ov23liNx2QAADrNHViQW',
                client_secret: '4e5147be7e1951b5ecb4fe6277e0461a6367d94e',
                code: code,
            }),
        });

        const data = await tokenResponse.json();

        if (data.error) {
            return res.status(400).json({ error: data.error_description });
        }

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
              function receiveMessage(e) {
                console.log("Received message:", e);
                window.opener.postMessage(
                  'authorization:github:success:${JSON.stringify({
            token: data.access_token,
            provider: 'github'
        })}',
                  e.origin
                );
              }
              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
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
