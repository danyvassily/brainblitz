const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.FRONTEND_PORT || 3000;

// Configuration CORS
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Servir socket.io client depuis le CDN
app.get("/socket.io/socket.io.js", (req, res) => {
  res.redirect("https://cdn.socket.io/4.7.2/socket.io.min.js");
});

// Route pour toutes les autres requêtes -> renvoyer index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`
🌐 Serveur Frontend démarré
📡 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
  `);
});
