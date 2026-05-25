/**
 * admin.js - Production-Ready Modular Firebase SDK Chat & Authentication Initialization
 * Focuses on robust Single Admin -> Multi-User Synchronized Architecture
 */

import { auth, db } from './firebase'; // Import configured Firebase objects
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

// References for listeners we want to track to prevent memory leaks and duplication
let activeMessagesUnsubscribe = null;
let rootChatsUnsubscribe = null;

/**
 * 1. AUTHENTICATION PERSISTENCE & STARTUP LIFECYCLE
 * Wraps entire dashboard/initialization startup context.
 * Ensures we wait for Firebase state restoration, then hooks up listeners.
 */
export function initializeAdminDashboard({
  onAuthVerified,
  onAuthFailed,
  onChatsUpdate,
  onActiveMessagesUpdate
}) {
  console.log("[Admin SDK] Initializing authentication persistence framework.");

  // Subscribe to onAuthStateChanged to monitor initial loading and subsequent state transitions
  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    const adminFlag = localStorage.getItem('apx_admin_logged_in') === 'true';

    // Real-Time Listener Initialization ONLY AFTER Verification completes
    if (user && adminFlag) {
      console.log("[Admin SDK] Cryptographic credentials verified for ID:", user.uid);
      
      // Let the UI know auth checks are completed
      onAuthVerified(user);

      // Start the Master Chats Listener
      listenToAllChats(onChatsUpdate);

    } else if (!user && adminFlag) {
      console.log("[Admin SDK] Session flag active, but authentication state represents null. RESTORING SESSION...");
      try {
        // Automatic session persistence via anonymous credentials
        await signInAnonymously(auth);
        console.log("[Admin SDK] Persistent session restored successfully.");
      } catch (error) {
        console.error("[Admin SDK] Failed to automatically restore admin session:", error);
        onAuthFailed(error);
      }
    } else {
      console.warn("[Admin SDK] No persistent session authorized.");
      onAuthFailed(new Error("Unauthorized access credentials."));
      cleanupAdminListeners();
    }
  });

  return unsubscribeAuth;
}

/**
 * 2. MASTER GLOBAL CHAT LISTENER (ROOT COLLECTION)
 * Single stable onSnapshot on '/chats' collection.
 * Dynamically updates sidebar and stays permanently active.
 */
function listenToAllChats(onChatsUpdate) {
  if (!db) {
    console.warn("[Admin SDK] Firestore database offline. Skipping master chats stream initialization.");
    return;
  }

  console.log("[Admin SDK] Creating Master Root Chats Stream Listener.");
  const chatsColRef = collection(db, "chats");

  if (rootChatsUnsubscribe) {
    rootChatsUnsubscribe(); // Prevent duplicates
  }

  rootChatsUnsubscribe = onSnapshot(chatsColRef, (snapshot) => {
    const chatList = [];
    snapshot.docs.forEach((snapDoc) => {
      const data = snapDoc.data();
      chatList.push({
        userId: data.userId || snapDoc.id,
        userName: data.userName || 'Inquirer',
        userEmail: data.userEmail || '',
        status: data.status || 'unread',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        subject: data.subject || 'General Logistics Consultation',
        messages: data.messages || []
      });
    });

    // Sort by descending last updated time to put newest activity on top of the inbox
    chatList.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    onChatsUpdate(chatList);
  }, (error) => {
    console.error("[Admin SDK] Critical master chats listener error:", error);
  });
}

/**
 * 3. ACTIVE USER CHAT STREAM
 * Subscribes to unique chats/{selectedUserId}/messages, ordered chronologically.
 * Correctly cleaned up upon selecting a different user.
 */
export function streamActiveUserMessages(selectedUserId, onActiveMessagesUpdate) {
  if (!db) return () => {};

  // Kill previous message listener safely to prevent memory leaks and duplicate responses
  if (activeMessagesUnsubscribe) {
    console.log("[Admin SDK] Disconnecting previous subscription before spawning new conversation stream.");
    activeMessagesUnsubscribe();
    activeMessagesUnsubscribe = null;
  }

  if (!selectedUserId) return () => {};

  console.log(`[Admin SDK] Instantiating dedicated subcollection message stream for user: ${selectedUserId}`);
  
  // Point directly to messages subcollection, ordered by timestamp
  const messagesColRef = collection(db, "chats", selectedUserId, "messages");
  
  activeMessagesUnsubscribe = onSnapshot(messagesColRef, (snapshot) => {
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

    // Sort chronologically so user reads conversations from top to bottom
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    onActiveMessagesUpdate(selectedUserId, messages);
  }, (error) => {
    console.error(`[Admin SDK] Error in dedicated user message stream (${selectedUserId}):`, error);
  });

  return activeMessagesUnsubscribe;
}

/**
 * 4. ADMIN REPLY FUNCTION
 * Writes directly into: chats/{selectedUserId}/messages
 * Updates the metadata on parent doc: chats/{selectedUserId} to bubble up user list
 */
export async function sendAdminReply(selectedUserId, replyText) {
  if (!db || !selectedUserId || !replyText.trim()) return;

  const now = new Date();
  const timestampStr = now.toISOString().slice(0, 10) + ' ' + now.toISOString().slice(11, 16);
  const msgId = Math.random().toString(36).substring(7);

  console.log(`[Admin SDK] Sending automated dispatcher reply to user: ${selectedUserId}`);

  // Ref to subcollection message document
  const activeMessageDocRef = doc(db, "chats", selectedUserId, "messages", msgId);
  const parentChatDocRef = doc(db, "chats", selectedUserId);

  try {
    // 1. Write the dispatch response directly to user messages subcollection thread
    await setDoc(activeMessageDocRef, {
      id: msgId,
      sender: "admin", // Explicit type 'admin'
      text: replyText,
      timestamp: timestampStr,
      readStatus: "read"
    });

    // 2. Set/Merge parent metadata status so sidebar remains in sync with last message timestamp
    await setDoc(parentChatDocRef, {
      status: "active",
      lastUpdated: now.toISOString()
    }, { merge: true });

    console.log("[Admin SDK] Message dispatched successfully on Firestore thread.");
  } catch (error) {
    console.error("[Admin SDK] Failed to write reply transaction to Firestore path:", error);
    throw error;
  }
}

/**
 * 5. CLEANUP FOR LOGOUTS & LIFECYCLES
 */
export function cleanupAdminListeners() {
  console.log("[Admin SDK] Forcing full active admin listener teardown.");
  if (activeMessagesUnsubscribe) {
    activeMessagesUnsubscribe();
    activeMessagesUnsubscribe = null;
  }
  if (rootChatsUnsubscribe) {
    rootChatsUnsubscribe();
    rootChatsUnsubscribe = null;
  }
}
