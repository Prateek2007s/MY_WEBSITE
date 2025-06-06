const express = require('express');
const app = express();
const cors = require('cors');
const accounts = require('./api/accounts');
const messages = require('./api/messages');

app.use(cors());
app.use(express.json());
app.use('/api/accounts', accounts);
app.use('/api/messages', messages);
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
