const express = require('express');
const bodyParser = require('body-parser');
const oauthRoutes = require('./routes/oauth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/oauth', oauthRoutes);

app.listen(PORT, () => {
    console.log(`Middleware server running on http://localhost:${PORT}`);
});
