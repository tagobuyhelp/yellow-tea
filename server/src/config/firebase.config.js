import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load service account key (you'll need to download this from Firebase console)
const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../yellow-tea-e3a65-firebase-adminsdk-fbsvc-c49e317f9f.json'), 'utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;