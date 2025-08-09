import admin from 'firebase-admin';

let initialized = false;

function ensureFirebaseAdmin() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const pkRaw = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = (pkRaw || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin env. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }
  initialized = true;
}

export async function verifyIdToken(idToken: string) {
  ensureFirebaseAdmin();
  return admin.auth().verifyIdToken(idToken);
}
