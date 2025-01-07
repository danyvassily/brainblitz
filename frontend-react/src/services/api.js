import axios from "axios";
import { io } from "socket.io-client";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Initialisation de Socket.IO
export const socket = io("http://localhost:8080", {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Gestionnaire d'événements Socket.IO
socket.on("connect", () => {
  console.log("Connecté au serveur Socket.IO");
});

socket.on("connect_error", (error) => {
  console.error("Erreur de connexion Socket.IO:", error);
});

socket.on("disconnect", () => {
  console.log("Déconnecté du serveur Socket.IO");
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      // Connecter Socket.IO avec le token
      socket.auth = { token: response.data.token };
      socket.connect();
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      // Connecter Socket.IO avec le token
      socket.auth = { token: response.data.token };
      socket.connect();
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    socket.disconnect();
  },
};

export const gameService = {
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },
  startGame: (gameMode, category) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Délai d'attente dépassé"));
      }, 5000);

      socket.once("game_started", (gameData) => {
        clearTimeout(timeout);
        resolve(gameData);
      });

      socket.once("game_error", (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message));
      });

      socket.emit("start_game", { mode: gameMode, categoryId: category });
    });
  },
};

// Réinitialiser la connexion Socket.IO si un token existe
const token = localStorage.getItem("token");
if (token) {
  socket.auth = { token };
  socket.connect();
}

export default api;
