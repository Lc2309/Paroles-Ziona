const { google } = require('googleapis');

module.exports = async (req, res) => {
  console.log("Appel API reçu avec q =", req.query.q);

  const folderId = process.env.GOOGLE_FOLDER_ID;
  const secretKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!folderId || !secretKey) {
    return res.status(500).json({ error: "Variables manquantes" });
  }

  try {
    // STRATÉGIE DE SECOURS : Si le JSON crash, on extrait la clé manuellement
    let credentials;
    try {
      // Tentative standard avec nettoyage
      const sanitized = secretKey.trim().replace(/\\n/g, '\n');
      credentials = JSON.parse(sanitized);
    } catch (jsonError) {
      console.warn("Échec du parse JSON standard, tentative d'extraction manuelle...");
      
      // Extraction manuelle des champs essentiels du JSON corrompu
      // On cherche les valeurs entre guillemets après les clés
      const extract = (key) => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`);
        const match = secretKey.match(regex);
        return match ? match[1] : null;
      };

      const client_email = extract("client_email");
      let private_key = extract("private_key");

      if (!client_email || !private_key) {
        throw new Error("Impossible d'extraire les identifiants du JSON corrompu.");
      }

      // On s'assure que la clé privée est bien formatée
      private_key = private_key.replace(/\\n/g, '\n');

      credentials = {
        client_email,
        private_key
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });

    const mimeFilter = `(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
    let searchFilter = `'${folderId}' in parents and trashed = false and ${mimeFilter}`;
    
    const query = req.query.q;
    if (query && query !== 'undefined' && query.trim() !== '') {
      const safeQuery = query.replace(/'/g, "\\'");
      searchFilter += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}')`;
    }

    const response = await drive.files.list({
      q: searchFilter,
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)',
      pageSize: 20,
      supportsAllDrives: true, 
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
    });

    return res.status(200).json({ results: response.data.files || [] });

  } catch (error) {
    console.error("ERREUR DRIVE DETECTEE:", error.message);
    return res.status(500).json({ error: "Erreur d'authentification ou de lecture Drive" });
  }
};