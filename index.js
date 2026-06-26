const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

app.get('/ebay-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) return res.status(400).send('No challenge code');

  const endpoint = 'https://ebay-webhook-qvfb.onrender.com/ebay-deletion';
  const verificationToken = 'bargz_ebay_verification_token_secret_2024_secure';

  const hash = crypto.createHash('sha256');
  hash.update(challengeCode);
  hash.update(verificationToken);
  hash.update(endpoint);
  const responseHash = hash.digest('hex');

  res.setHeader('Content-Type', 'application/json');
  res.json({ challengeResponse: responseHash });
});

app.post('/ebay-deletion', (req, res) => {
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Running'));
