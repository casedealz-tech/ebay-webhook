const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

app.get('/ebay-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) return res.status(400).send('No challenge code');
  
  const endpoint = 'https://ebay-webhook-qvfb.onrender.com/';
  const verificationToken = 'bargz_ebay_token_2024';
  
  const hash = crypto.createHash('sha256')
    .update(challengeCode + verificationToken + endpoint)
    .digest('hex');
  
  res.json({ challengeResponse: hash });
});

app.post('/ebay-deletion', (req, res) => {
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Running'));
