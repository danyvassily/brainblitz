const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Route pour l'authentification Firebase
router.post("/auth/firebase", async (req, res) => {
  try {
    const { firebaseUid, email, username } = req.body;

    // Rechercher l'utilisateur par firebaseUid
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Créer un nouvel utilisateur si n'existe pas
      user = new User({
        username,
        email,
        firebaseUid,
        password: Math.random().toString(36).slice(-8), // Mot de passe aléatoire
      });
      await user.save();
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (error) {
    console.error("❌ Erreur d'authentification Firebase:", error);
    res.status(500).json({ message: "Erreur lors de l'authentification" });
  }
});

// Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Nom d'utilisateur déjà pris" });
    }

    // Création du nouvel utilisateur
    const user = new User({ username, password });
    await user.save();

    // Génération du token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error("❌ Erreur d'inscription:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

// Route de connexion
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Recherche de l'utilisateur
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Vérification du mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Génération du token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (error) {
    console.error("❌ Erreur de connexion:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

// Route de profil (protégée)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("❌ Erreur de récupération du profil:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil" });
  }
});

module.exports = router;
