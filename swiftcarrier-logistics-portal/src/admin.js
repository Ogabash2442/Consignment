import { db } from './firebase';
import { doc, getDoc, updateDoc, onSnapshot, collection, arrayUnion } from 'firebase/firestore';

/**
 * 1. Checks credentials against firestore 'admin_creds/config' doc.
 * Returns { success: boolean, error?: string }
 */
export async function verifyAdminConfig(inputUsername, inputPassword) {
  if (!db) {
    console.warn("[admin.js] Firestore db reference is uninitialized.");
    throw new Error("Firestore instance not initialized.");
  }
  
  console.log("=== FIRESTORE CONFIG FETCH START ===");
  const configDocRef = doc(db, 'admin_creds', 'config');
  const docSnap = await getDoc(configDocRef);
  
  if (!docSnap.exists()) {
    console.error("[admin.js] [FIRESTORE READ FAILURE] Document at path 'admin_creds/config' does not exist in Firestore.");
    throw new Error("Admin credentials document 'admin_creds/config' does not exist in Firestore.");
  }

  // FIRESTORE DIRECT DATA EXTRACTION (CRITICAL: Extract directly as fields; never pass database objects to JSON.parse)
  const configData = docSnap.data();
  console.log("[admin.js] [FIRESTORE DATA EXTRACTION SUCCESS] Retrieved live document snapshot from 'admin_creds/config'.");
  
  // Explicit log markers around Firestore data extraction
  console.log("[admin.js] [FIRESTORE READ MARKER] docSnap.data().username evaluates to string:", configData ? configData.username : "undefined");
  console.log("[admin.js] [FIRESTORE READ MARKER] docSnap.data().password evaluates to string:", configData ? configData.password : "undefined");

  const dbUsername = (configData && configData.username ? configData.username : 'admin').toString().trim().toLowerCase();
  const dbPassword = (configData && configData.password ? configData.password : 'nathan247').toString().trim();

  const normalInputUser = inputUsername.trim().toLowerCase();
  const normalInputPass = inputPassword.trim();

  // Keep custom login credentials bypass using inputUsername matching 'admin' and inputPassword matching the database-loaded password
  if (normalInputUser === dbUsername && normalInputPass === dbPassword) {
    console.log("[admin.js] Login authentication verified. Activating session with local settings updates.");
    
    // Save as simple strings - DO NOT JSON.stringify or wrap
    localStorage.setItem("admin_session", "authenticated");
    localStorage.setItem("apx_admin_logged_in", "true");
    localStorage.setItem('apx_dashboard_username', dbUsername);
    localStorage.setItem('apx_dashboard_password', dbPassword);
    
    // Explicit log markers around localStorage data writes
    console.log("[admin.js] [LOCALSTORAGE WRITE MARKER] Set 'admin_session' to:", localStorage.getItem("admin_session"));
    console.log("[admin.js] [LOCALSTORAGE WRITE MARKER] Set 'apx_admin_logged_in' to:", localStorage.getItem("apx_admin_logged_in"));
    console.log("=== FIRESTORE CONFIG FETCH END (SUCCESS) ===");

    return { success: true };
  } else {
    console.warn("[admin.js] Authentication terminal credentials validation failed.");
    console.log("=== FIRESTORE CONFIG FETCH END (FAILURE) ===");
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
  
  console.log("=== FIRESTORE CREDENTIAL UPDATE START ===");
  console.log("[admin.js] Writing new operator credentials to Firestore paths.");
  console.log("[admin.js] New username target:", newUsername);
  console.log("[admin.js] New password target:", newPassword);

  await updateDoc(configDocRef, {
    username: newUsername,
    password: newPassword
  });
  
  // Commit to local cached store as raw strings
  localStorage.setItem('apx_dashboard_username', newUsername);
  localStorage.setItem('apx_dashboard_password', newPassword);
  console.log("=== FIRESTORE CREDENTIAL UPDATE END ===");
}

/**
 * 3. Log out admin session and clear credentials cache
 */
export function removeAdminSession() {
  console.log("=== SESSION DEACTIVATION START ===");
  localStorage.removeItem("admin_session");
  localStorage.removeItem('apx_admin_logged_in');
  
  // Explicit check verification
  console.log("[admin.js] [LOCALSTORAGE DEACTIVATION CHECK] 'admin_session' value is now:", localStorage.getItem("admin_session"));
  console.log("=== SESSION DEACTIVATION END ===");
}

/**
 * 4. Safe helper to check session purely as a string value without JSON.parse
 */
export function getAdminSessionStatus() {
  const sessionVal = localStorage.getItem("admin_session");
  // Explicit log markers around localStorage reads
  console.log("[admin.js] [LOCALSTORAGE READ MARKER] Retrieved 'admin_session' raw value:", sessionVal);
  return sessionVal === "authenticated";
}

/**
 * 5. Stream all root chats
 */
export function subscribeToAllChats(onChatsUpdate) {
  if (!db) {
    console.warn("[admin.js] Firestore reference uninitialized. Skipping stream listener configuration.");
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
    console.error("[admin.js] Error in channels subscriber stream: ", err);
  });
}

/**
 * 6. Stream a single user chat document for real-time window updates
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
    console.error("[admin.js] Error streaming single user chat document: ", err);
  });
}

/**
 * 7. Send admin reply message
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
