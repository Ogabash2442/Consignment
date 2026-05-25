import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to store credentials on disk so that it persists across server restarts
const CREDENTIALS_FILE = path.join(process.cwd(), "src", "admin_credentials.json");
const CHATS_FILE = path.join(process.cwd(), "src", "chats_database.json");

// Default initial credentials
let adminUsername = "admin";
let adminPassword = "nathan247";

// Default chats database
let serverChats = [
  {
    userId: 'user_maria',
    userName: 'Maria Gallia',
    userEmail: 'maria@couture-gallia.fr',
    status: 'unread',
    lastUpdated: '2026-05-24T11:45:00Z',
    subject: 'Fabric conditions check JP',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'Hello, I am tracking my delivery APX-4412-JP. Can you verify if the shipment was kept safe from the overnight rain in Paris?',
        timestamp: '2026-05-24 11:42'
      },
      {
        id: 'm2',
        sender: 'agent',
        text: 'Bonjour Maria! Yes, our Tokyo dispatch wrapped the Kuroki Premium Denim in double-layer waterproof seals. The moisture readings from the sensor are perfectly dry.',
        timestamp: '2026-05-24 11:44'
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'Ah! Excellent to hear. It is very high-end material. Thank you for checking so quickly. What time is the courier expected?',
        timestamp: '2026-05-24 11:45'
      }
    ]
  },
  {
    userId: 'user_robert',
    userName: 'Robert Vance',
    userEmail: 'r.vance@horizonimporters.com',
    status: 'active',
    lastUpdated: '2026-05-24T10:15:00Z',
    subject: 'Secure lockers SEA',
    messages: [
      {
        id: 'mr1',
        sender: 'user',
        text: 'Greetings. For the Switzerland flight APX-8820-CH, we require double-seal secure storage upon arrival in Seattle. Will your local team have a biometric technician available?',
        timestamp: '2026-05-24 10:10'
      },
      {
        id: 'mr2',
        sender: 'agent',
        text: 'Hello Robert, absolutely. Biometric clearance lock technicians are booked for the CDG and SEA locations. Your items will reside in the secure vault throughout transit.',
        timestamp: '2026-05-24 10:15'
      }
    ]
  }
];

// Load credentials from file if exists
try {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
    if (data.username) adminUsername = data.username.trim();
    if (data.password) adminPassword = data.password.trim();
    console.log("Credentials loaded from disk:", adminUsername);
  } else {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ username: adminUsername, password: adminPassword }, null, 2), "utf-8");
  }
} catch (error) {
  console.error("Error loading credentials file:", error);
}

// Load chats from file if exists
try {
  if (fs.existsSync(CHATS_FILE)) {
    serverChats = JSON.parse(fs.readFileSync(CHATS_FILE, "utf-8"));
    console.log("Chats database loaded from disk. Total conversations:", serverChats.length);
  } else {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(serverChats, null, 2), "utf-8");
  }
} catch (error) {
  console.error("Error loading chats database:", error);
}

const saveChatsToDisk = () => {
  try {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(serverChats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving chats database to disk:", err);
  }
};

// API endpoint to retrieve active credentials
app.get("/api/credentials", (req, res) => {
  res.json({ username: adminUsername, password: adminPassword });
});

// API endpoint to read and supply firebase config dynamically at runtime
app.get("/api/firebase-config", (req, res) => {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return res.json({ enabled: true, config: configData });
    } catch (err) {
      return res.json({ enabled: false, error: "Malformed configuration file structure" });
    }
  }
  res.json({ enabled: false });
});

// API endpoint to update active credentials
app.post("/api/credentials", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || !username.trim() || !password.trim()) {
    return res.status(400).json({ error: "Username and password are required and cannot be empty." });
  }

  adminUsername = username.trim();
  adminPassword = password.trim();

  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ username: adminUsername, password: adminPassword }, null, 2), "utf-8");
    console.log("Credentials updated on server disk successfully to:", adminUsername);
  } catch (error) {
    console.error("Failed to write updated credentials to disk:", error);
  }

  res.json({ success: true, username: adminUsername });
});

// API endpoint to get all server chats
app.get("/api/chats", (req, res) => {
  res.json(serverChats);
});

// API endpoint to post a chat message (two-way Real-Time Chat delivery)
app.post("/api/chats/message", (req, res) => {
  const { userId, userName, userEmail, sender, text, subject } = req.body;
  if (!userId || !text || !text.trim()) {
    return res.status(400).json({ error: "userId and text message body are required." });
  }

  const nowStr = new Date().toISOString();
  const timestampStr = nowStr.slice(0, 10) + ' ' + nowStr.slice(11, 16);

  const newMessage = {
    id: Math.random().toString(36).substring(7),
    sender: sender || "user",
    text: text.trim(),
    timestamp: timestampStr
  };

  let existingChat = serverChats.find(c => c.userId === userId);

  if (existingChat) {
    existingChat.messages.push(newMessage);
    existingChat.lastUpdated = nowStr;
    if (sender === "user") {
      existingChat.status = "unread";
    } else {
      existingChat.status = "active";
    }
    if (userName) existingChat.userName = userName;
    if (userEmail) existingChat.userEmail = userEmail;
  } else {
    existingChat = {
      userId,
      userName: userName || "Inquirer",
      userEmail: userEmail || "anonymous@logistics.com",
      status: sender === "user" ? "unread" : "active",
      lastUpdated: nowStr,
      subject: subject || "General Support Request",
      messages: [newMessage]
    };
    serverChats.unshift(existingChat);
  }

  saveChatsToDisk();
  res.json({ success: true, chat: existingChat });
});

// API endpoint to mark a conversation as resolved
app.post("/api/chats/resolve", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required to resolve a chat." });
  }

  const existingChat = serverChats.find(c => c.userId === userId);
  if (existingChat) {
    existingChat.status = "resolved";
    saveChatsToDisk();
    return res.json({ success: true });
  }

  res.status(404).json({ error: "Conversation not found." });
});

// Vite server integrated middleware / static files serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
});
