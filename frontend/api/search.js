// frontend/api/search.js
const { google } = require('googleapis');
const path = require('path');

module.exports = async (req, res) => {
  // Utilisation de l'API URL standard (WHATWG) pour éviter le DeprecationWarning
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const fullUrl = new URL(req.url, `${protocol}://${host}`);
  const query = fullUrl.searchParams.get('q');
  
  const folderId = process.env.GOOGLE_FOLDER_ID;

  let authOptions;

  // 1. Gestion de l'authentification
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      // Nettoyage de la clé JSON pour éviter les erreurs de parsing sur Vercel
      const cleanKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n');
      authOptions = {
        credentials: JSON.parse(cleanKey),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      };
    } catch (e) {
      console.error("Erreur JSON.parse clé Google:", e.message);
      return res.status(500).json({ error: "Erreur de configuration de la clé API" });
    }
  } else {
    // Mode Développement local (nécessite credentials.json à la racine du dossier frontend)
    authOptions = {
      keyFile: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    };
  }

  try {
    // 2. Initialisation de l'instance Google Drive
    const auth = new google.auth.GoogleAuth(authOptions);
    const drive = google.drive({ version: 'v3', auth });

    // 3. Construction de la requête de recherche
    // Filtre : uniquement dans le dossier spécifié, non supprimé, et de type Google Slides ou PPTX
    let searchFilter = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
    
    if (query) {
      // Protection contre l'injection de caractères spéciaux dans la recherche
      const safeQuery = query.replace(/'/g, "\\'");
      searchFilter += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}')`;
    }

    // 4. Exécution de l'appel API Google Drive
    const response = await drive.files.list({
      q: searchFilter,
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)',
      pageSize: 15,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    // 5. Envoi des résultats
    return res.status(200).json({ 
      results: response.data.files || [] 
    });

  } catch (error) {
    console.error("Drive API Error:", error.message);
    return res.status(500).json({ 
      error: "Erreur lors de la récupération des fichiers",
      details: error.message 
    });
  }
};