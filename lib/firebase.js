"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmjR1r9N3lxFEW7xGVon0WgyfNv50eY7g",
  authDomain: "live-b5a47.firebaseapp.com",
  projectId: "live-b5a47",
  storageBucket: "live-b5a47.firebasestorage.app",
  messagingSenderId: "590112451434",
  appId: "1:590112451434:web:17622099056e48aec3d313",
  measurementId: "G-13Y59BY5NS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

export function subscribeToAdminCommands(onCommand, onState = () => {}) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase admin listener not started. Add NEXT_PUBLIC_FIREBASE_* values in .env.local.');
    return () => {};
  }

  const adminDoc = doc(firestore, 'adminControls', 'totem-overlay');

  return onSnapshot(
    adminDoc,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};

      if (data.commandId) {
        onCommand({
          id: data.commandId,
          type: data.commandType || '',
          payload: data.commandPayload ?? null,
        });
      }

      onState({
        audioEnabled: typeof data.audioEnabled === 'boolean' ? data.audioEnabled : null,
      });
    },
    (error) => {
      console.error('Firebase admin listener error:', error);
    }
  );
}
