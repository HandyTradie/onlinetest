import * as _admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import serviceAccountKey from './quizmine-a809e-firebase-adminsdk-ihc77-f9f2d6b53a.json';

// Init firebase
_admin.initializeApp({
  credential: _admin.credential.cert(serviceAccountKey as ServiceAccount)
});

export const admin = _admin;
export const db = admin.firestore();
