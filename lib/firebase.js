"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

// Send a command to the totem overlay from a control device
export async function sendAdminCommand(type, payload = null) {
  try {
    const adminDoc = doc(firestore, 'adminControls', 'totem-overlay');
    const commandId = `${type}-${Date.now()}-${Math.random()}`;
    
    await updateDoc(adminDoc, {
      commandId,
      commandType: type,
      commandPayload: payload,
      lastCommandTime: serverTimestamp(),
    });

    console.log(`✓ Sent command: ${type}`, payload);
  } catch (error) {
    console.error('Error sending admin command:', error);
  }
}

// Update audio state across all devices
export async function setAudioState(enabled) {
  try {
    const adminDoc = doc(firestore, 'adminControls', 'totem-overlay');
    await updateDoc(adminDoc, {
      audioEnabled: enabled,
      lastStateUpdate: serverTimestamp(),
    });
    console.log(`✓ Audio state updated: ${enabled}`);
  } catch (error) {
    console.error('Error updating audio state:', error);
  }
}

// Convenience functions for common commands
export async function resetTotem() {
  return sendAdminCommand('RESET');
}

export async function queueRemoteFollow(count = 1) {
  return sendAdminCommand('QUEUE_FOLLOW', count);
}

export async function queueRemotePop(count = 1) {
  return sendAdminCommand('QUEUE_POP', count);
}

export async function enableAudio() {
  return setAudioState(true);
}

export async function disableAudio() {
  return setAudioState(false);
}

export async function toggleAudio() {
  return sendAdminCommand('TOGGLE_AUDIO');
}
