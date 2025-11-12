// Google Drive Integration
// Handles OAuth, file picking, and syncing with Google Drive

import type { GoogleDriveFile, GoogleDriveAuth, UniversalContent } from '../types/content';

// Google Drive API configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let gapiInitialized = false;
let pickerInitialized = false;

/**
 * Initialize Google API client
 */
export async function initializeGoogleDrive(): Promise<boolean> {
  if (gapiInitialized) return true;

  return new Promise((resolve) => {
    // Check if gapi is loaded
    if (typeof window === 'undefined' || !window.gapi) {
      console.warn('Google API not loaded. Add script to index.html');
      resolve(false);
      return;
    }

    window.gapi.load('client:auth2:picker', async () => {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        });
        
        gapiInitialized = true;
        pickerInitialized = true;
        resolve(true);
      } catch (error) {
        console.error('Error initializing Google Drive:', error);
        resolve(false);
      }
    });
  });
}

/**
 * Authenticate user with Google Drive
 */
export async function authenticateGoogleDrive(): Promise<GoogleDriveAuth | null> {
  try {
    await initializeGoogleDrive();
    
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    const authResponse = user.getAuthResponse(true);
    
    return {
      accessToken: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      expiresAt: authResponse.expires_at,
      scope: authResponse.scope.split(' ')
    };
  } catch (error) {
    console.error('Google Drive authentication failed:', error);
    return null;
  }
}

/**
 * Check if user is already authenticated
 */
export function isGoogleDriveAuthenticated(): boolean {
  if (!gapiInitialized) return false;
  
  const authInstance = window.gapi.auth2?.getAuthInstance();
  return authInstance?.isSignedIn.get() || false;
}

/**
 * Sign out from Google Drive
 */
export async function signOutGoogleDrive(): Promise<void> {
  if (!gapiInitialized) return;
  
  const authInstance = window.gapi.auth2?.getAuthInstance();
  await authInstance?.signOut();
}

/**
 * Open Google Drive file picker
 */
export async function openGoogleDrivePicker(
  onSelect: (files: GoogleDriveFile[]) => void,
  multiSelect: boolean = true
): Promise<void> {
  await initializeGoogleDrive();
  
  if (!window.google?.picker) {
    console.error('Google Picker API not loaded');
    return;
  }

  const authInstance = window.gapi.auth2.getAuthInstance();
  const token = authInstance.currentUser.get().getAuthResponse().access_token;

  const picker = new window.google.picker.PickerBuilder()
    .addView(window.google.picker.ViewId.DOCS)
    .addView(window.google.picker.ViewId.DOCS_IMAGES)
    .addView(window.google.picker.ViewId.DOCS_VIDEOS)
    .addView(window.google.picker.ViewId.PRESENTATIONS)
    .addView(window.google.picker.ViewId.SPREADSHEETS)
    .setOAuthToken(token)
    .setDeveloperKey(GOOGLE_API_KEY)
    .setCallback((data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const files: GoogleDriveFile[] = data.docs.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          mimeType: doc.mimeType,
          thumbnailLink: doc.thumbnails?.[0]?.url,
          webViewLink: doc.url,
          modifiedTime: doc.lastEditedUtc,
          size: doc.sizeBytes?.toString(),
          iconLink: doc.iconUrl
        }));
        onSelect(files);
      }
    })
    .setTitle('Select files from Google Drive')
    .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
    .enableFeature(multiSelect ? window.google.picker.Feature.MULTISELECT_ENABLED : 0)
    .build();

  picker.setVisible(true);
}

/**
 * Get file metadata from Google Drive
 */
export async function getGoogleDriveFile(fileId: string): Promise<GoogleDriveFile | null> {
  try {
    await initializeGoogleDrive();
    
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, thumbnailLink, webViewLink, modifiedTime, size, iconLink'
    });
    
    return response.result as GoogleDriveFile;
  } catch (error) {
    console.error('Error fetching Google Drive file:', error);
    return null;
  }
}

/**
 * List files from Google Drive
 */
export async function listGoogleDriveFiles(
  query?: string,
  pageSize: number = 50
): Promise<GoogleDriveFile[]> {
  try {
    await initializeGoogleDrive();
    
    const params: any = {
      pageSize,
      fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, modifiedTime, size, iconLink)',
      orderBy: 'modifiedTime desc'
    };
    
    if (query) {
      params.q = query;
    }
    
    const response = await window.gapi.client.drive.files.list(params);
    return response.result.files || [];
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    return [];
  }
}

/**
 * Download file content from Google Drive
 */
export async function downloadGoogleDriveFile(fileId: string): Promise<Blob | null> {
  try {
    await initializeGoogleDrive();
    
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    return new Blob([response.body]);
  } catch (error) {
    console.error('Error downloading Google Drive file:', error);
    return null;
  }
}

/**
 * Convert Google Drive file to UniversalContent
 */
export function convertGoogleDriveToContent(
  file: GoogleDriveFile,
  linkedTo: UniversalContent['linkedTo'] = {}
): UniversalContent {
  const getContentType = (mimeType: string): UniversalContent['type'] => {
    if (mimeType.includes('document')) return 'document';
    if (mimeType.includes('presentation')) return 'presentation';
    if (mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'document';
  };

  return {
    id: `gdrive-${file.id}`,
    source: 'google-drive',
    type: getContentType(file.mimeType),
    name: file.name,
    driveId: file.id,
    url: file.webViewLink,
    driveUrl: file.webViewLink,
    metadata: {
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : undefined,
      thumbnail: file.thumbnailLink,
      lastModified: file.modifiedTime
    },
    linkedTo,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };
}

/**
 * Sync Google Drive files (check for updates)
 */
export async function syncGoogleDriveFiles(
  existingFiles: UniversalContent[]
): Promise<UniversalContent[]> {
  try {
    await initializeGoogleDrive();
    
    const updatedFiles: UniversalContent[] = [];
    
    for (const content of existingFiles) {
      if (content.source === 'google-drive' && content.driveId) {
        const freshFile = await getGoogleDriveFile(content.driveId);
        if (freshFile) {
          updatedFiles.push(convertGoogleDriveToContent(freshFile, content.linkedTo));
        }
      }
    }
    
    return updatedFiles;
  } catch (error) {
    console.error('Error syncing Google Drive files:', error);
    return existingFiles;
  }
}

// Type declarations for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

