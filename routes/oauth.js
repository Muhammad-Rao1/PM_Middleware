const express = require('express');
const axios = require('axios');
const router = express.Router();

const ZOHO_AUTH_URL = 'https://accounts.zoho.com/oauth/v2/auth';
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

// Temporary store for authorization code
let authorizationData = {};

// Step 1: Generate Authorization URL
router.post('/authorize', (req, res) => {
    const { client_id, redirect_uri, scope } = req.body;

    if (!client_id || !redirect_uri || !scope) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const authUrl = `${ZOHO_AUTH_URL}?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&access_type=offline`;
    res.json({ authorization_url: authUrl });
});

// Step 2: Receive Authorization Code
router.get('/callback', (req, res) => {
    const { code, location, 'accounts-server': accounts } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code is missing.');
    }

    // Temporarily store the received data
    authorizationData = { code, location, accounts };
    res.status(200).json({ message: 'Authorization code received.', authorizationData });
});

// Step 3: Fetch Authorization Code
router.get('/get-auth-code', (req, res) => {
    if (!authorizationData.code) {
        return res.status(400).json({ error: 'No authorization code available.' });
    }

    res.json({ authorizationData });
});

// Step 4: Exchange Authorization Code for Tokens
router.post('/get-tokens', async (req, res) => {
    const { client_id, client_secret, redirect_uri } = req.body;

    if (!authorizationData.code || !client_id || !client_secret || !redirect_uri) {
        return res.status(400).json({ error: 'Missing required fields or authorization code.' });
    }

    try {
        const tokenResponse = await axios.post(ZOHO_TOKEN_URL, null, {
            params: {
                grant_type: 'authorization_code',
                client_id,
                client_secret,
                redirect_uri,
                code: authorizationData.code,
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token, refresh_token, api_domain, token_type, expires_in } = tokenResponse.data;

        res.json({
            access_token,
            refresh_token,
            token_type,
            expires_in,
            api_domain,
        });
    } catch (error) {
        console.error('Error exchanging authorization code for tokens:', error.message);
        res.status(500).json({ error: 'Error retrieving tokens.' });
    }
});

module.exports = router;
