const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Secure Login Route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fallback route for single page navigation or 404
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`ULTRON COMS RELAY SERVER STARTING...`);
  console.log(`STATUS: OPERATIONAL`);
  console.log(`PORT: ${PORT}`);
  console.log(`LOCAL ENDPOINT: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
