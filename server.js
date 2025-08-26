const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Serve static files from the build folder at /front/
app.use('/front', express.static(path.join(__dirname, 'build')));

// Proxy API requests from /api/* to http://localhost:8000/
app.all('/api/*path', (req, res) => {
  // Rewrite the URL to remove /api/ and keep the rest
  //req.url = req.url.replace(/^\/api/  '');
  proxy.web(req, res, { target: 'http://backend:8000' }, (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  });
});

// Handle SPA routing: Serve index.html for all routes under /front/*
app.get('/front/*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.status(500).send('Proxy error');
});

const port = 3000;
app.listen(port, () => {
  console.log(`App served at http://localhost:${port}/front/`);
  console.log(`API requests proxied from /api/ to http://localhost:8000/`);
});