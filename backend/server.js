// Remplacement de punycode par tr46
const tr46 = require("tr46");
global.punycode = tr46;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const { authenticateSocket } = require("./middleware/auth");
const gameController = require("./controllers/gameController");
const jwt = require("jsonwebtoken");
const config = require("./config");
const User = require("./models/User");

// Initialisation de l'application
const app = express();
const httpServer = createServer(app);

// Configuration de CORS
const corsOptions = {
  origin: "http://localhost:3000", // Frontend URL
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

// Configuration de Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket"],
  },
  pingTimeout: 60000,
  connectTimeout: 60000,
});

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes API
app.use("/api", authRoutes);

// Socket.IO Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Token manquant"));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Utilisateur non trouvé"));
    }

    socket.user = user;
    socket.username = user.username;
    next();
  } catch (error) {
    console.error("❌ Erreur d'authentification Socket.IO:", error);
    next(new Error("Token invalide"));
  }
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  console.log(
    "👤 Nouveau client connecté:",
    socket.id,
    "- User:",
    socket.username
  );

  // Envoyer les catégories disponibles immédiatement après la connexion
  const quizCategories = require("./data/quizCategories");
  socket.emit(
    "categories",
    Object.keys(quizCategories).map((key) => ({
      id: key,
      ...quizCategories[key],
    }))
  );

  // Sélection de catégorie
  socket.on("select_category", (categoryId) => {
    const category = quizCategories[categoryId];
    if (category) {
      socket.emit("category_selected", {
        id: categoryId,
        name: category.name,
      });
    }
  });

  // Démarrage du jeu
  socket.on("start_game", ({ mode, categoryId }) => {
    console.log("Démarrage du quiz:", categoryId);
    if (mode === "multi") {
      const { lobbyId } = gameController.createLobby(socket, mode);
      socket.join(lobbyId);
    }
    gameController.startGame(io, socket, categoryId, mode);
  });

  socket.on("create_lobby", (mode) => {
    const { lobbyId, joinLink } = gameController.createLobby(socket, mode);
    socket.emit("lobby_created", {
      lobbyId,
      players: [socket.username],
      joinLink,
    });
  });

  socket.on("join_lobby", (lobbyId) => {
    if (gameController.joinLobby(io, socket, lobbyId)) {
      gameController.startMultiplayerGame(io, lobbyId);
    }
  });

  socket.on("submit_answer", (answer) => {
    const lobbyId = Array.from(socket.rooms).find(
      (room) => room.startsWith(socket.username) || room.startsWith("solo_")
    );
    if (lobbyId) {
      gameController.handleAnswer(io, socket, answer, lobbyId);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 Client déconnecté:", socket.id, "- User:", socket.username);
  });
});

// Connexion à la base de données et démarrage du serveur
const PORT = process.env.BACKEND_PORT || 3001;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`
        🎮 Serveur Backend BrainBlitz démarré
        📡 Port: ${PORT}
        🌐 URL: http://localhost:${PORT}
        `);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de démarrage du serveur:", err);
    process.exit(1);
  });
