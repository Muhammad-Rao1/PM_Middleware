const express = require('express');
const bodyParser = require('body-parser');
const oauthRoutes = require('./routes/oauth');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use('/oauth', oauthRoutes);

app.listen(PORT, () => {
    console.log(`Middleware server running on http://localhost:${PORT}`);
});
