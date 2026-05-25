/**
 * chat.js - Production-Ready Client/User Firebase SDK Chat Stream Initialization
 * Focuses on robust client-side persistent identifier and real-time support listener
 */

import { db } from './firebase'; // Import configured Firebase objects
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

/**
 * 1. PERSISTENT UNIQUE USER ID RETRIEVAL / GENERATION
 * Looks up existing unique ID in localStorage, seeds a randomized identifier if empty.
 */
export function getOrCreatePersistentUserId() {
  let userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    const randomSuffix = Math.random().toString(36).substring(2, 11);
    userId = `client_${randomSuffix}`;
    localStorage.setItem('chat_user_id', userId);
    console.log(`[User SDK] No previous identifier located. Generated fresh ID: ${userId}`);
  } else {
    console.log(`[User SDK] Reconnected previous identifier session: ${userId}`);
  }
  return userId;
}

/**
 * 2. USER REAL-TIME LISTENER
 * Subscribes to: chats/{myUniqueUserId}/messages in real-time.
 * Automatically receives admin replies instantly and streams conversation thread.
 */
export function subscribeToUserChat(userId, onMessagesUpdate, onChatMetadataUpdate) {
  if (!db || !userId) return () => {};

  console.log(`[User SDK] Connecting real-time sync stream for consumer: ${userId}`);

  const parentChatDocRef = doc(db, "chats", userId);
  const messagesColRef = collection(db, "chats", userId, "messages");

  // 1. Snapshot Listener on Chat Parent Metadata
  const unsubscribeMetadata = onSnapshot(parentChatDocRef, (docSnap) => {
    if (docSnap.exists()) {
      onChatMetadataUpdate(docSnap.data());
    }
  }, (error) => {
    console.error("[User SDK] Metadata synchronization error:", error);
  });

  // 2. Snapshot Listener on Messages Subcollection
  const unsubscribeMessages = onSnapshot(messagesColRef, (snapshot) => {
    const messages = [];
    snapshot.docs.forEach((msgDoc) => {
      const msgData = msgDoc.data();
      messages.push({
        id: msgDoc.id,
        sender: msgData.sender || 'user',
        text: msgData.text || '',
        timestamp: msgData.timestamp || ''
      });
    });

    // Sort chronologically for readable thread ordering
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    onMessagesUpdate(messages);
  }, (error) => {
    console.error("[User SDK] Messages subcollection synchronization error:", error);
  });

  // Combined teardown package
  return () => {
    console.log(`[User SDK] Terminating synchronization streams for: ${userId}`);
    unsubscribeMetadata();
    unsubscribeMessages();
  };
}

/**
 * 3. USER MESSAGE SEND FLOW
 * Writes directly to the chats/{myUniqueUserId}/messages subcollection sub-node.
 * Updates the parent root chats/{myUniqueUserId} with metadata indices to alert sidebar instantly.
 */
export async function sendUserChatMessage({
  userId,
  userName,
  userEmail,
  text
}) {
  if (!db || !userId || !text.trim()) return;

  const now = new Date();
  const timestampStr = now.toISOString().slice(0, 10) + ' ' + now.toISOString().slice(11, 16);
  const msgId = Math.random().toString(36).substring(7);

  console.log(`[User SDK] Dispatched client transaction from session: ${userId}`);

  const messageDocRef = doc(db, "chats", userId, "messages", msgId);
  const parentChatDocRef = doc(db, "chats", userId);

  try {
    // 1. Write the user message as a nested sub-collection document
    await setDoc(messageDocRef, {
      id: msgId,
      sender: 'user',
      text: text.trim(),
      timestamp: timestampStr,
      readStatus: 'unread'
    });

    // 2. Write/Update root parent document values for active sorting inside the administrative inbox
    await setDoc(parentChatDocRef, {
      userId,
      userName: userName || 'Inquirer',
      userEmail: userEmail || 'anonymous@logistics.com',
      status: 'unread',
      lastUpdated: now.toISOString(),
      subject: 'In-app Chat Consultation'
    }, { merge: true });

    console.log("[User SDK] Client transaction finalized cleanly.");
  } catch (error) {
    console.error("[User SDK] Failed to execute send message block on Firestore path:", error);
    throw error;
  }
}
