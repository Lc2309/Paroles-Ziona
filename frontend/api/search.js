const { google } = require('googleapis');
const path = require('path');

export default async function handler(req, res) {
  // Dans les fonctions Vercel standards, on récupère les paramètres via req.query
  const query = req.query.q;
  const folderId = process.env.GOOGLE_FOLDER_ID;

  let authOptions;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Mode Production (Vercel)
    try {
      authOptions = {
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      };
    } catch (e) {
      return res.status(500).json({ error: "Erreur de parsing des credentials JSON" });
    }
  } else {
    // Mode Développement (Local)
    authOptions = {
      keyFile: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    };
  }

  try {
    const auth = new google.auth.GoogleAuth(authOptions);
    const drive = google.drive({ version: 'v3', auth });

    let searchFilter = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
    
    if (query) {
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

    // Format de réponse Node.js standard
    return res.status(200).json({ results: response.data.files || [] });

  } catch (error) {
    console.error("Drive API Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}