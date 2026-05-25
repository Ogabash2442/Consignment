import { db } from './firebase'; 
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

/**
 * 1. PERSISTENT UNIQUE USER ID RETRIEVAL / GENERATION
 * Searches localStorage cache for existing identifier, generating custom client key if blank.
 */
export function getOrCreatePersistentUserId() {
  let userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        userId = `client_${crypto.randomUUID().substring(0, 8)}`;
      }
    } catch (e) {
      console.warn("[User SDK] Fallback triggered as crypto.randomUUID was unavailable inside frame sandbox:", e);
    }
    
    // Solid random fallback
    if (!userId) {
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      userId = `client_user_${Date.now()}_${randomSuffix}`;
    }

    localStorage.setItem('chat_user_id', userId);
    console.log(`[User SDK] Instantiated new clean persistent chat identifier: ${userId}`);
  } else {
    console.log(`[User SDK] Found previous persistent user session: ${userId}`);
  }
  return userId;
}

/**
 * 2. USER REAL-TIME LISTENER
 * Registers a real-time listener on `chats/{userId}` root document of Firestore database.
 * Directly listens to changes on the parent document.
 */
export function subscribeToUserChat(userId, onMessagesUpdate) {
  if (!db || !userId) {
    console.warn("[User SDK] Firestore instances not initialized. Skipping subscription thread.");
    return () => {};
  }

  console.log(`[User SDK] Connecting real-time streams to path: chats/${userId}`);

  const parentChatDocRef = doc(db, "chats", userId);

  const unsubscribeDoc = onSnapshot(parentChatDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[User SDK] Chat document synchronized:", data);
      if (typeof onMessagesUpdate === 'function') {
        onMessagesUpdate(data.messages || []);
      }
    } else {
      console.log("[User SDK] Chat document does not exist yet.");
      if (typeof onMessagesUpdate === 'function') {
        onMessagesUpdate([]);
      }
    }
  }, (error) => {
    console.error("[User SDK] Metadata connection subscription failure:", error);
  });

  return unsubscribeDoc;
}

/**
 * 3. USER MESSAGE SEND FLOW
 * Conducts standard write with `arrayUnion` to `chats/{userId}` document.
 * Simultaneously updates root parameters (`status: 'unread'`).
 */
export async function sendUserChatMessage({
  userId,
  userName,
  userEmail,
  text
}) {
  if (!db || !userId || !text.trim()) {
    console.warn("[User SDK] Database disconnected or empty dispatch message text. Aborted.");
    return;
  }

  const msgId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().substring(0, 5)
    : Math.random().toString(36).substring(2, 7);

  console.log(`[User SDK] Writing consumer message context to array inside chats/${userId}`);

  const parentChatDocRef = doc(db, "chats", userId);

  const newMsg = {
    id: msgId,
    sender: "user",
    text: text.trim()
  };

  try {
    // Write or merge state into root parent document with nested arrayUnion appending
    await setDoc(parentChatDocRef, {
      userId,
      userName: userName || localStorage.getItem('chat_user_name') || 'Inquirer',
      userEmail: userEmail || localStorage.getItem('chat_user_email') || 'anonymous@logistics.com',
      lastUpdated: new Date().toISOString(),
      status: 'unread',
      subject: 'In-app Chat Consultation',
      messages: arrayUnion(newMsg)
    }, { merge: true });

    console.log("[User SDK] Document message array updated successfully using arrayUnion.");
  } catch (error) {
    console.error("[User SDK] Failed to execute send message block on Firestore path:", error);
    throw error;
  }
}
