const { google } = require('googleapis');

module.exports = async (req, res) => {
  console.log("Appel API reçu avec q =", req.query.q);

  const folderId = process.env.GOOGLE_FOLDER_ID;
  const secretKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!folderId || !secretKey) {
    return res.status(500).json({ error: "Variables d'environnement manquantes" });
  }

  try {
    let sanitizedKey = secretKey.trim();
    if (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"')) {
      sanitizedKey = sanitizedKey.substring(1, sanitizedKey.length - 1);
    }
    const credentials = JSON.parse(sanitizedKey.replace(/\\n/g, '\n'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });

    // 1. On définit les types de fichiers (Slides et PPTX)
    const mimeTypes = [
      "application/vnd.google-apps.presentation",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    const mimeFilter = `(${mimeTypes.map(type => `mimeType = '${type}'`).join(' or ')})`;

    // 2. Construction du filtre : On s'assure que les parenthèses ne cassent pas la requête
    let searchFilter = `'${folderId}' in parents and trashed = false and ${mimeFilter}`;
    
    const query = req.query.q;
    // Si query est vide, undefined ou "undefined" (chaîne), on ne l'ajoute pas au filtre
    if (query && query !== 'undefined' && query.trim() !== '') {
      const safeQuery = query.replace(/'/g, "\\'");
      searchFilter += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}')`;
    }

    console.log("Filtre final envoyé à Google:", searchFilter);

    const response = await drive.files.list({
      q: searchFilter,
      // Ajout de 'capabilities' pour vérifier les droits si besoin
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink, capabilities)',
      pageSize: 20,
      // Paramètres obligatoires pour les dossiers partagés/Shared Drives
      supportsAllDrives: true, 
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
    });

    return res.status(200).json({ results: response.data.files || [] });

  } catch (error) {
    console.error("ERREUR DRIVE DETECTEE:", error.message);
    return res.status(500).json({ error: error.message });
  }
};