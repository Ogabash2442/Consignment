/**
 * admin.js - Production-Ready Modular Firebase SDK Chat & Authentication State Manager
 * Employs robust verification lifecycles, load status trackers, and standardized Firestore subcollections.
 */

import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

// File-level listener subscriptions references to prevent duplicated sockets and leaks
let activeMessagesUnsubscribe = null;
let rootChatsUnsubscribe = null;

/**
 * 1. AUTHENTICATION PERSISTENCE & LOADING STATE LIFECYCLE
 * Orchestrates dashboard boots and prevents early redirection races before Auth finishes loading.
 */
export function initializeAdminDashboard({
  onLoadingStateChange, // (isLoading: boolean) => void
  onAuthVerified,       // (user: any) => void
  onAuthFailed,         // (error: Error) => void
  onChatsUpdate,        // (chatsList: Array) => void
  onActiveMessagesUpdate // (userId: string, messagesList: Array) => void
}) {
  console.log("[Admin SDK] Initializing administrative dashboard system with loading hooks.");
  
  // Set immediate pending state as requested to hold back redirection races
  if (typeof onLoadingStateChange === 'function') {
    console.log("[Admin SDK] Initial page load loading lock set to TRUE.");
    onLoadingStateChange(true);
  }

  // Subscribe to persistent Auth status updates
  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    const adminFlag = localStorage.getItem('apx_admin_logged_in') === 'true';
    console.log(`[Admin SDK] Auth state transition captured. User: ${user ? user.uid : 'null'} | Admin session flag: ${adminFlag}`);

    if (user && adminFlag) {
      console.log("[Admin SDK] Credentials resolved and verified. Session persistent UID:", user.uid);
      
      // Complete loading state before authorizing dashboard view rendering
      if (typeof onLoadingStateChange === 'function') {
        onLoadingStateChange(false);
      }
      
      if (typeof onAuthVerified === 'function') {
        onAuthVerified(user);
      }

      // Initiate stable master snapshot syncing after validation
      listenToAllChats(onChatsUpdate);

    } else if (!user && adminFlag) {
      console.log("[Admin SDK] Local credentials flags are active but Firebase Context is empty. Re-syncing session anonymously...");
      try {
        await signInAnonymously(auth);
        console.log("[Admin SDK] Anonymously persistent session recovered successfully.");
      } catch (error) {
        console.error("[Admin SDK] Error auto-authenticating transient admin session:", error);
        
        if (typeof onLoadingStateChange === 'function') {
          onLoadingStateChange(false);
        }
        if (typeof onAuthFailed === 'function') {
          onAuthFailed(error);
        }
      }
    } else {
      console.warn("[Admin SDK] No active session context. Authenticate using credentials form entry.");
      
      if (typeof onLoadingStateChange === 'function') {
        onLoadingStateChange(false);
      }
      if (typeof onAuthFailed === 'function') {
        onAuthFailed(new Error("No active credentials located in local terminal."));
      }

      cleanupAdminListeners();
    }
  }, (err) => {
    console.error("[Admin SDK] Critical error in onAuthStateChanged wrapper:", err);
    if (typeof onLoadingStateChange === 'function') {
      onLoadingStateChange(false);
    }
    if (typeof onAuthFailed === 'function') {
      onAuthFailed(err);
    }
  });

  return unsubscribeAuth;
}

/**
 * 2. MASTER GLOBAL CHAT LISTENER (ROOT COLLECTION PATH)
 * Standard stable onSnapshot query that remains alive permanently to receive all updates.
 */
function listenToAllChats(onChatsUpdate) {
  if (!db) {
    console.warn("[Admin SDK] Firestore is offline. Skipping stable chats hook.");
    return;
  }

  console.log("[Admin SDK] Spawning single stable master chats root listener.");
  const chatsColRef = collection(db, "chats");

  if (rootChatsUnsubscribe) {
    console.log("[Admin SDK] Stopping duplicate root list stream before rebuilding.");
    rootChatsUnsubscribe();
    rootChatsUnsubscribe = null;
  }

  rootChatsUnsubscribe = onSnapshot(chatsColRef, (snapshot) => {
    console.log(`[Admin SDK] Global Firestore master collection sync tick. Total chats: ${snapshot.size}`);
    const chatList = [];

    snapshot.docs.forEach((snapDoc) => {
      const data = snapDoc.data();
      chatList.push({
        userId: data.userId || snapDoc.id,
        userName: data.userName || 'Inquirer',
        userEmail: data.userEmail || 'anonymous@logistics.com',
        status: data.status || 'unread',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        lastActive: data.lastActive || null,
        subject: data.subject || 'General Logistics consultation',
        messages: data.messages || []
      });
    });

    // Sort by actual server lastActive timestamp descending
    chatList.sort((a, b) => {
      const timeA = a.lastActive ? (a.lastActive.toDate ? a.lastActive.toDate().getTime() : new Date(a.lastUpdated).getTime()) : new Date(a.lastUpdated).getTime();
      const timeB = b.lastActive ? (b.lastActive.toDate ? b.lastActive.toDate().getTime() : new Date(b.lastUpdated).getTime()) : new Date(b.lastUpdated).getTime();
      return timeB - timeA;
    });

    if (typeof onChatsUpdate === 'function') {
      onChatsUpdate(chatList);
    }
  }, (error) => {
    console.error("[Admin SDK] Error within stable master chats listener:", error);
  });
}

/**
 * 3. ACTIVE USER CHAT SUBCOLLECTION STREAM
 * Dynamically streams dedicated messages subcollection for selected user.
 * Disconnects previous conversation stream first to completely prevent duplication.
 */
export function streamActiveUserMessages(selectedUserId, onActiveMessagesUpdate) {
  if (!db) {
    console.warn("[Admin SDK] Database is offline. Subcollection stream aborted.");
    return () => {};
  }

  // Teardown previous message snapshot safely to prevent leak
  if (activeMessagesUnsubscribe) {
    console.log("[Admin SDK] Disconnecting outstanding message subcollection stream to prevent leaks.");
    activeMessagesUnsubscribe();
    activeMessagesUnsubscribe = null;
  }

  if (!selectedUserId) {
    console.log("[Admin SDK] No selected conversations. Chat terminal in standby.");
    return () => {};
  }

  console.log(`[Admin SDK] Spinning up real-time stream for nested path: chats/${selectedUserId}/messages`);
  
  const messagesColRef = collection(db, "chats", selectedUserId, "messages");
  const q = query(messagesColRef, orderBy("timestamp", "asc"));

  activeMessagesUnsubscribe = onSnapshot(q, (snapshot) => {
    console.log(`[Admin SDK] Subcollection update on chats/${selectedUserId}/messages | Count: ${snapshot.size}`);
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

    if (typeof onActiveMessagesUpdate === 'function') {
      onActiveMessagesUpdate(selectedUserId, messages);
    }
  }, (error) => {
    console.error(`[Admin SDK] Snapshot streaming of messages failed for ${selectedUserId}:`, error);
  });

  return activeMessagesUnsubscribe;
}

/**
 * 4. ADMIN REPLY DISPATCHER
 * Standardizes direct writes into: chats/{selectedUserId}/messages/{messageId}
 * Also flags 'lastActive' on parent to instantly trigger sidebar updates.
 */
export async function sendAdminReply(selectedUserId, replyText) {
  if (!db || !selectedUserId || !replyText.trim()) {
    console.warn("[Admin SDK] Empty parameters or database offline. Reply rejected.");
    return;
  }

  const msgId = Math.random().toString(36).substring(7);
  console.log(`[Admin SDK] Executing reply trans: write admin message to chats/${selectedUserId}/messages/${msgId}`);

  const messageDocRef = doc(db, "chats", selectedUserId, "messages", msgId);
  const parentChatDocRef = doc(db, "chats", selectedUserId);

  try {
    // 1. Send the response inside standard nested subcollection messages path
    await setDoc(messageDocRef, {
      id: msgId,
      sender: "admin", 
      text: replyText.trim(),
      timestamp: serverTimestamp()
    });

    // 2. Refresh parent root metadata document indices
    await setDoc(parentChatDocRef, {
      lastActive: serverTimestamp(),
      lastMessage: replyText.trim(),
      lastMessageTime: new Date().toISOString(),
      status: "active" // changes status to active to show representative replied
    }, { merge: true });

    console.log("[Admin SDK] Direct subcollection write finalized.");
  } catch (error) {
    console.error("[Admin SDK] Server write failed during admin response transaction:", error);
    throw error;
  }
}

/**
 * 5. SESSION CONTEXT TEARDOWN
 */
export function cleanupAdminListeners() {
  console.log("[Admin SDK] Terminating all background database subscribers.");
  if (activeMessagesUnsubscribe) {
    activeMessagesUnsubscribe();
    activeMessagesUnsubscribe = null;
  }
  if (rootChatsUnsubscribe) {
    rootChatsUnsubscribe();
    rootChatsUnsubscribe = null;
  }
}
