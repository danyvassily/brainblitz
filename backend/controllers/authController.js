const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

// Contrôleur pour l'inscription
exports.register = async (req, res) => {
  console.log("📝 Tentative d'inscription:", req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("❌ Données manquantes");
      return res.status(400).json({ message: "Username et password requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("❌ Utilisateur existe déjà:", username);
      return res
        .status(400)
        .json({ message: "Nom d'utilisateur déjà utilisé" });
    }

    // Créer un nouvel utilisateur
    const user = new User({ username, password });
    await user.save();
    console.log("✅ Utilisateur créé:", username);

    const token = jwt.sign({ username: user.username }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription:", error);
    res.status(500).json({
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
};

// Contrôleur pour la connexion
exports.login = async (req, res) => {
  console.log("🔑 Tentative de connexion:", req.body.username);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username et password requis" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ Utilisateur non trouvé:", username);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const validPassword = await user.verifyPassword(password);
    if (!validPassword) {
      console.log("❌ Mot de passe invalide pour:", username);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign({ username: user.username }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    console.log("✅ Connexion réussie:", username);
    res.json({ token });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Vérification du token
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ username: user.username });
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la vérification du token" });
  }
};
