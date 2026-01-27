const { google } = require('googleapis');

module.exports = async (req, res) => {
  // Log pour débogage dans la console Vercel
  console.log("Appel API reçu avec q =", req.query.q);

  const folderId = process.env.GOOGLE_FOLDER_ID;
  const secretKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!folderId || !secretKey) {
    console.error("Erreur: Variables d'environnement manquantes");
    return res.status(500).json({ error: "Variables d'environnement manquantes sur Vercel" });
  }

  try {
    // NETTOYAGE DU JSON (Correction de l'erreur "Bad control character")
    let sanitizedKey = secretKey.trim();
    
    // Supprime les guillemets superflus si Vercel les a ajoutés
    if (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"')) {
      sanitizedKey = sanitizedKey.substring(1, sanitizedKey.length - 1);
    }

    // Remplace les doubles backslashes par des simples pour les sauts de ligne
    // C'est souvent ici que l'erreur au caractère 184 se produit
    const credentials = JSON.parse(sanitizedKey.replace(/\\n/g, '\n'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });

    // Construction du filtre de recherche complet
    let searchFilter = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
    
    const query = req.query.q;
    if (query) {
      // Protection contre les injections dans la requête Google Drive
      const safeQuery = query.replace(/'/g, "\\'");
      searchFilter += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}')`;
    }

    const response = await drive.files.list({
      q: searchFilter,
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)',
      pageSize: 15,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return res.status(200).json({ results: response.data.files || [] });

  } catch (error) {
    // Capture précise de l'erreur dans les logs Vercel
    console.error("ERREUR DRIVE DETECTEE:", error.message);
    return res.status(500).json({ 
      error: "Erreur serveur interne",
      message: error.message 
    });
  }
};