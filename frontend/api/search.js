const { google } = require('googleapis');

module.exports = async (req, res) => {
  const query = req.query.q;
  
  const folderId = process.env.GOOGLE_FOLDER_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!folderId || !clientEmail || !privateKey) {
    return res.status(500).json({ error: "Configuration incomplète sur Vercel" });
  }

  try {
    // Nettoyage de la clé : on gère les deux cas (vrais retours à la ligne ou \n textuels)
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });

    // Filtre pour Slides Google et PPTX
    const mimeFilter = `(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
    
    // On cherche dans le dossier, non supprimé, avec les bons types
    let searchFilter = `'${folderId}' in parents and trashed = false and ${mimeFilter}`;
    
    if (query && query !== 'undefined' && query.trim() !== '') {
      const safeQuery = query.replace(/'/g, "\\'");
      searchFilter += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}')`;
    }

    const response = await drive.files.list({
      q: searchFilter,
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)',
      pageSize: 24,
      supportsAllDrives: true, 
      includeItemsFromAllDrives: true,
    });

    return res.status(200).json({ results: response.data.files || [] });

  } catch (error) {
    console.error("ERREUR DRIVE :", error.message);
    return res.status(500).json({ error: "Erreur lors de la récupération des fichiers" });
  }
};