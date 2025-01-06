const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" });
  }
};

const authenticateSocket = async (socket, next) => {
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
    next(new Error("Token invalide"));
  }
};

module.exports = { authenticateToken, authenticateSocket };
