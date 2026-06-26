const express = require('express');
const crypto = require('crypto');
const https = require('https');
const app = express();

app.use(express.json());

const CLIENT_ID = 'EdwinFlo-Agent-PRD-fdd18a134-885343f8';
const CLIENT_SECRET = 'PRD-dd18a13411ce-2dfe-4105-a71e-eea1';
const RUNAME = 'Edwin_Flores-EdwinFlo-Agent--sqynozww';
const REDIRECT_URI = 'https://ebay-webhook-qvfb.onrender.com/oauth/callback';

// eBay deletion webhook
app.get('/ebay-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) return res.status(400).send('No challenge code');
  const endpoint = 'https://ebay-webhook-qvfb.onrender.com/ebay-deletion';
  const verificationToken = 'bargz_ebay_verification_token_secret_2024_secure';
  const hash = crypto.createHash('sha256');
  hash.update(challengeCode);
  hash.update(verificationToken);
  hash.update(endpoint);
  res.setHeader('Content-Type', 'application/json');
  res.json({ challengeResponse: hash.digest('hex') });
});

app.post('/ebay-deletion', (req, res) => res.sendStatus(200));

// Step 1 — Start OAuth
app.get('/auth', (req, res) => {
  const url = `https://auth.ebay.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope+https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fsell.inventory+https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fsell.account`;
  res.redirect(url);
});

// Step 2 — Handle callback
app.get('/oauth/callback', (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code received: ' + JSON.stringify(req.query));

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  const options = {
    hostname: 'api.ebay.com',
    path: '/identity/v1/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      const parsed = JSON.parse(data);
      res.send(`
        <h2>SUCCESS! Save these tokens:</h2>
        <p><strong>Access Token:</strong><br><textarea rows="5" cols="80">${parsed.access_token || 'ERROR'}</textarea></p>
        <p><strong>Refresh Token:</strong><br><textarea rows="5" cols="80">${parsed.refresh_token || 'ERROR'}</textarea></p>
        <p><strong>Full Response:</strong><br><pre>${JSON.stringify(parsed, null, 2)}</pre></p>
      `);
    });
  });

  request.write(body);
  request.end();
});

app.listen(3000, () => console.log('Running'));
