const { google } = require('googleapis');

module.exports = async (req, res) => {
  // 1. Test immédiat pour voir si la fonction répond
  // Si tu vois ce message en appelant l'URL, c'est que l'auth Google crash après.
  console.log("Appel API reçu avec q =", req.query.q);

  const folderId = process.env.GOOGLE_FOLDER_ID;
  const secretKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!folderId || !secretKey) {
    return res.status(500).json({ error: "Variables d'environnement manquantes sur Vercel" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(secretKey.replace(/\\n/g, '\n')),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });

    // ... suite du code (ton drive.files.list) ...
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`, // Test simplifié pour commencer
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)',
    });

    return res.status(200).json({ results: response.data.files || [] });

  } catch (error) {
    // Si ça crash ici, le message apparaîtra enfin dans les logs Vercel
    console.error("ERREUR DRIVE DETECTEE:", error.message);
    return res.status(500).json({ error: error.message });
  }
};