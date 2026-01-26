import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const folderId = process.env.GOOGLE_FOLDER_ID;

  // Configuration de l'authentification hybride
  let authOptions: any;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Mode Production (Vercel) : On utilise la variable d'environnement
    try {
      authOptions = {
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      };
    } catch (e) {
      return NextResponse.json({ error: "Erreur de parsing des credentials JSON" }, { status: 500 });
    }
  } else {
    // Mode Développement (Local) : On utilise le fichier credentials.json
    authOptions = {
      keyFile: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    };
  }

  try {
    const auth = new google.auth.GoogleAuth(authOptions);
    const drive = google.drive({ version: 'v3', auth });

    // Construction du filtre de recherche
    let searchFilter = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
    
    if (query) {
      const safeQuery = query.replace(/'/g, "\\'");
      searchFilter += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}')`;
    }

    const response = await drive.files.list({
      q: searchFilter,
      fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)', // Ajout de webContentLink pour le téléchargement
      pageSize: 15,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return NextResponse.json({ results: response.data.files || [] });

  } catch (error: any) {
    console.error("Drivre API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}