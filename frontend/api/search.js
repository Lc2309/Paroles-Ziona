module.exports = async (req, res) => {
  const folder = process.env.GOOGLE_FOLDER_ID ? "DÉTECTÉ" : "MANQUANT";
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? "DÉTECTÉE" : "MANQUANTE";
  
  return res.status(200).json({ 
    message: "Le backend fonctionne !",
    env_status: { folder, key }
  });
};