import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

let app: App | null = null;

function getFirebaseApp(): App {
  if (app) return app;
  if (getApps().length > 0) return getApps()[0] as App;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  });

  return app;
}

export async function uploadToFirebase(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const firebaseApp = getFirebaseApp();
  const bucket = getStorage(firebaseApp).bucket();
  const file = bucket.file(path);

  await file.save(buffer, {
    metadata: { contentType },
    public: false,
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500',
  });

  return url;
}
