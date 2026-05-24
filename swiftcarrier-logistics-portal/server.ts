import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to store credentials on disk so that it persists across server restarts
const CREDENTIALS_FILE = path.join(process.cwd(), "src", "admin_credentials.json");

// Default initial credentials
let adminUsername = "admin";
let adminPassword = "nathan247";

// Load from file if exists
try {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
    if (data.username) adminUsername = data.username.trim();
    if (data.password) adminPassword = data.password.trim();
    console.log("Credentials loaded from disk:", adminUsername);
  } else {
    // Generate initial default file
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ username: adminUsername, password: adminPassword }, null, 2), "utf-8");
  }
} catch (error) {
  console.error("Error loading credentials file:", error);
}

// API endpoint to retrieve active credentials
app.get("/api/credentials", (req, res) => {
  res.json({ username: adminUsername, password: adminPassword });
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
