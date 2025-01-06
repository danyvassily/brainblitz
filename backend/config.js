module.exports = {
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://dany:azerty@cluster0.ujnql73.mongodb.net/brainblitz",
  JWT_SECRET: process.env.JWT_SECRET || "votre_secret_jwt_super_securise",
  JWT_EXPIRES_IN: "24h",
  PORT: process.env.PORT || 3000,
};
