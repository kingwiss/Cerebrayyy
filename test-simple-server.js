const express = require('express');
const app = express();
const PORT = 8000;

app.get('/', (req, res) => {
    res.send('Simple server is working!');
});

app.listen(PORT, () => {
    console.log(`Simple server running at http://localhost:${PORT}`);
});