const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
  try {
    console.log("Tentative de connexion à MongoDB...");
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connexion à MongoDB établie avec succès");
  } catch (error) {
    console.error("❌ Erreur de connexion à MongoDB:", error);
    throw error;
  }
};

module.exports = connectDB;
