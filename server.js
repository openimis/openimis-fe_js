const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, "build")));

// Handle SPA routing - always return index.html for any route
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});