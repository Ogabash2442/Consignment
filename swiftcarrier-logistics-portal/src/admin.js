import { db } from './firebase';
import { doc, getDoc, updateDoc, onSnapshot, collection, arrayUnion } from 'firebase/firestore';

/**
 * 1. Checks credentials against firestore 'admin_creds/config' doc.
 * Returns { success: boolean, error?: string }
 */
export async function verifyAdminConfig(inputUsername, inputPassword) {
  if (!db) {
    throw new Error("Firestore instance not initialized.");
  }
  const configDocRef = doc(db, 'admin_creds', 'config');
  const docSnap = await getDoc(configDocRef);
  if (!docSnap.exists()) {
    throw new Error("Admin credentials document 'admin_creds/config' does not exist in Firestore.");
  }
  const configData = docSnap.data();
  const dbUsername = (configData.username || 'admin').trim().toLowerCase();
  const dbPassword = (configData.password || 'nathan247').trim();

  if (inputUsername.trim().toLowerCase() === dbUsername && inputPassword.trim() === dbPassword) {
    localStorage.setItem("admin_session", "authenticated");
    localStorage.setItem("apx_admin_logged_in", "true");
    localStorage.setItem('apx_dashboard_username', dbUsername);
    localStorage.setItem('apx_dashboard_password', dbPassword);
    return { success: true };
  } else {
    return { success: false, error: "Invalid username or password" };
  }
}

/**
 * 2. Update config credentials inside the Firestore document
 */
export async function updateAdminCredentials(newUsername, newPassword) {
  if (!db) {
    throw new Error("Firestore instance not initialized.");
  }
  const configDocRef = doc(db, 'admin_creds', 'config');
  await updateDoc(configDocRef, {
    username: newUsername,
    password: newPassword
  });
  localStorage.setItem('apx_dashboard_username', newUsername);
  localStorage.setItem('apx_dashboard_password', newPassword);
}

/**
 * 3. Log out admin session and clear credentials cache
 */
export function removeAdminSession() {
  localStorage.removeItem("admin_session");
  localStorage.removeItem('apx_admin_logged_in');
}

/**
 * 4. Stream all root chats
 */
export function subscribeToAllChats(onChatsUpdate) {
  if (!db) {
    console.warn("Firestore not available. Skipping subscribeToAllChats.");
    return () => {};
  }
  const chatsColRef = collection(db, "chats");
  return onSnapshot(chatsColRef, (snapshot) => {
    const list = [];
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        userId: docSnap.id,
        userName: data.userName || 'Inquirer',
        userEmail: data.userEmail || 'anonymous@logistics.com',
        status: data.status || 'unread',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        subject: data.subject || 'In-app Chat Consultation',
        messages: data.messages || []
      });
    });
    // Sort descending by lastUpdated ISO check
    list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    onChatsUpdate(list);
  }, (err) => {
    console.error("Error in channels subscriber stream: ", err);
  });
}

/**
 * 5. Stream a single user chat document for real-time window updates
 */
export function subscribeToSingleUserChat(userId, onChatUpdate) {
  if (!db || !userId) return () => {};
  const chatDocRef = doc(db, "chats", userId);
  return onSnapshot(chatDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onChatUpdate(data.messages || []);
    } else {
      onChatUpdate([]);
    }
  }, (err) => {
    console.error("Error streaming single user chat document: ", err);
  });
}

/**
 * 6. Send admin reply message
 */
export async function sendAdminReplyMessage(userId, replyText) {
  if (!db || !userId) return;
  const chatDocRef = doc(db, "chats", userId);
  const msgId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID().substring(0, 5) 
    : Math.random().toString(36).substring(2, 7);

  const newMsg = {
    id: msgId,
    sender: "admin",
    text: replyText.trim()
  };

  await updateDoc(chatDocRef, {
    messages: arrayUnion(newMsg),
    lastUpdated: new Date().toISOString(),
    status: 'active'
  });
}
