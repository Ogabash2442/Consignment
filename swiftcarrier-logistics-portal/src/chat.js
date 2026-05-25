/**
 * chat.js - Production-Ready Client/User Firebase SDK Chat Stream Manager
 * Centered around secure, persistent identifier states and robust transactional message writes.
 */

import { db } from './firebase'; 
import { collection, onSnapshot, doc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

/**
 * 1. PERSISTENT UNIQUE USER ID RETRIEVAL / GENERATION
 * Searches local Storage cache for existing identifier, generating custom client credentials key if blank.
 */
export function getOrCreatePersistentUserId() {
  let userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        userId = `client_${crypto.randomUUID()}`;
      }
    } catch (e) {
      console.warn("[User SDK] Fallback triggered as crypto.randomUUID was unavailable inside frame sandbox:", e);
    }
    
    // Solid random fallback
    if (!userId) {
      const randomSuffix = Math.random().toString(36).substring(2, 11);
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
 * Registers a long-polling subcollection stream on chats/{myUniqueUserId}/messages.
 * Keeps conversation thread continuously synchronized.
 */
export function subscribeToUserChat(userId, onMessagesUpdate, onChatMetadataUpdate) {
  if (!db || !userId) {
    console.warn("[User SDK] Firestore instances not initialized. Skipping subscription thread.");
    return () => {};
  }

  console.log(`[User SDK] Connecting real-time streams to path: chats/${userId}/messages`);

  const parentChatDocRef = doc(db, "chats", userId);
  const messagesColRef = collection(db, "chats", userId, "messages");
  const q = query(messagesColRef, orderBy("timestamp", "asc"));

  // 1. Snapshot Listener on Chat Parent Metadata
  const unsubscribeMetadata = onSnapshot(parentChatDocRef, (docSnap) => {
    if (docSnap.exists() && typeof onChatMetadataUpdate === 'function') {
      const data = docSnap.data();
      console.log("[User SDK] Parent document metadata synchronized:", data);
      onChatMetadataUpdate(data);
    }
  }, (error) => {
    console.error("[User SDK] Metadata connection subscription failure:", error);
  });

  // 2. Snapshot Listener on Messages Subcollection
  const unsubscribeMessages = onSnapshot(q, (snapshot) => {
    console.log(`[User SDK] Messages subcollection update received. Total sync count: ${snapshot.size}`);
    const messages = [];

    snapshot.docs.forEach((msgDoc) => {
      const msgData = msgDoc.data();
      
      // Robust calculation of timestamp to account for server latency updates
      let tsString = "";
      if (msgData.timestamp) {
        if (typeof msgData.timestamp.toDate === 'function') {
          const d = msgData.timestamp.toDate();
          tsString = d.toISOString().slice(0, 10) + ' ' + d.toISOString().slice(11, 16);
        } else {
          tsString = msgData.timestamp;
        }
      } else {
        const now = new Date();
        tsString = now.toISOString().slice(0, 10) + ' ' + now.toISOString().slice(11, 16);
      }

      messages.push({
        id: msgDoc.id,
        sender: msgData.sender || 'user',
        text: msgData.text || '',
        timestamp: tsString
      });
    });

    if (typeof onMessagesUpdate === 'function') {
      onMessagesUpdate(messages);
    }
  }, (error) => {
    console.error("[User SDK] Messages subcollection subscription failure:", error);
  });

  // Combined teardown package
  return () => {
    console.log(`[User SDK] Demolishing transaction message streams for: ${userId}`);
    unsubscribeMetadata();
    unsubscribeMessages();
  };
}

/**
 * 3. USER MESSAGE SEND FLOW
 * Conducts standard write: chats/{myUniqueUserId}/messages/{messageId}
 * Propagates 'lastActive' and search indexes on root parent doc chats/{myUniqueUserId}
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

  const msgId = Math.random().toString(36).substring(7);
  console.log(`[User SDK] Writing consumer message context to: chats/${userId}/messages/${msgId}`);

  const messageDocRef = doc(db, "chats", userId, "messages", msgId);
  const parentChatDocRef = doc(db, "chats", userId);

  try {
    // 1. Write the message into the direct nested messages subcollection
    await setDoc(messageDocRef, {
      id: msgId,
      sender: "user",
      text: text.trim(),
      timestamp: serverTimestamp()
    });

    // 2. Map and update root parent document indices with latest snapshot metadata
    await setDoc(parentChatDocRef, {
      userId,
      userName: userName || localStorage.getItem('chat_user_name') || 'Inquirer',
      userEmail: userEmail || localStorage.getItem('chat_user_email') || 'anonymous@logistics.com',
      lastActive: serverTimestamp(),
      lastMessage: text.trim(),
      lastMessageTime: new Date().toISOString(),
      status: 'unread',
      subject: 'In-app Chat Consultation'
    }, { merge: true });

    console.log("[User SDK] Direct subcollection message dispatched successfully.");
  } catch (error) {
    console.error("[User SDK] Failed to execute send message block on Firestore path:", error);
    throw error;
  }
}
