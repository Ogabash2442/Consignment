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
const SHIPMENTS_FILE = path.join(process.cwd(), "src", "shipments_database.json");
const BRANDING_FILE = path.join(process.cwd(), "src", "branding_database.json");
const ANNOUNCEMENTS_FILE = path.join(process.cwd(), "src", "announcements_database.json");

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

const DEFAULT_SVG_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%230f172a'/><path d='M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z' fill='none' stroke='%2338bdf8' stroke-width='6' stroke-linejoin='round'/><path d='M50 20 L50 80 M20 35 L50 50 L80 35' fill='none' stroke='%2338bdf8' stroke-width='4' stroke-linejoin='round'/><circle cx='50' cy='50' r='10' fill='%230ea5e9' opacity='0.8'/></svg>";

const DEFAULT_BRANDING = {
  siteName: "APEX GLOBAL",
  websiteLogo: DEFAULT_SVG_LOGO,
  headerLogo: DEFAULT_SVG_LOGO,
  footerLogo: DEFAULT_SVG_LOGO,
  contactPhone: "+41 43 816 22 11",
  contactEmail: "ops@apex-global.com",
  officeAddress: "Aviation Depot Zone 4, 8058 Zurich-Airport, Switzerland",
  footerInformation: "© 2026 Apex Global Logistics AG. All sovereign trade registrations active.",
  websiteBrandingDetails: "Optimized maritime container ocean liner arrangements crossing primary seafaring trade routes. Secure telemetry seals protect ultra-high value cargoes.",
  heroBrandingText: "Global Cargo Shipping Without Borders",
  socialTwitter: "https://twitter.com/apexglobal",
  socialLinkedin: "https://linkedin.com/company/apexglobal",
  socialInstagram: "https://instagram.com/apexglobal"
};

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'North Atlantic Air Route Normal Operations',
    content: 'Atmospheric conditions across the North Atlantic flights have stabilized. All priority trans-continental air freight returns to regular scheduled operations.',
    category: 'success',
    timestamp: '2026-05-24 10:00',
    active: true
  },
  {
    id: 'ann-2',
    title: 'European Road Transport Custom Audits',
    content: 'Slight clearance delays at German-Austrian border crossings due to impromptu freight custom system upgrades. Regular transits might add 2-3 hours.',
    category: 'delay',
    timestamp: '2026-05-23 15:30',
    active: true
  }
];

const DEFAULT_SHIPMENTS = [
  {
    trackingId: 'APX-8820-CH',
    status: 'In Transit',
    origin: {
      city: 'Zurich',
      country: 'Switzerland',
      sender: 'Chronos Swiss Haute Horologie AG',
      address: 'Bahnhofstrasse 102, 8001 Zürich'
    },
    destination: {
      city: 'Seattle',
      country: 'United States',
      receiver: 'Horizon Luxury Importers LLC',
      address: '770 Pine Street, Seattle, WA 98101'
    },
    details: {
      weight: '4.2 kg',
      type: 'Air Freight (Secure Vault)',
      dimensions: '40 x 30 x 25 cm',
      value: '$145,000 USD',
      serviceLevel: 'Express Priority Cargo',
      estimatedDelivery: '2026-05-26',
      shippingDate: '2026-05-22'
    },
    notes: 'Premium high-value luxury timepieces. Store in climate-controlled secure locker. Double seal verification required.',
    timeline: [
      {
        id: 'ts1',
        status: 'Processed',
        location: 'Zurich Central Depot',
        timestamp: '2026-05-22 09:15',
        description: 'Shipment registered, packed, and barcoded by sender in premium secure container.',
        isCompleted: true
      },
      {
        id: 'ts2',
        status: 'Processed',
        location: 'Zurich Airport Hub (ZRH)',
        timestamp: '2026-05-22 17:30',
        description: 'Customs paperwork approved, cargo cleared for priority air export.',
        isCompleted: true
      },
      {
        id: 'ts3',
        status: 'In Transit',
        location: 'Zurich Airport Hub (ZRH)',
        timestamp: '2026-05-23 11:00',
        description: 'Loaded onto flight APX-104 destined for Paris CDG air transport connection.',
        isCompleted: true
      },
      {
        id: 'ts4',
        status: 'In Transit',
        location: 'Paris Charles de Gaulle (CDG) Terminal 4',
        timestamp: '2026-05-23 19:40',
        description: 'Arrived at international transfer hub. Sorted for transcontinental flight.',
        isCompleted: true
      },
      {
        id: 'ts5',
        status: 'In Transit',
        location: 'Paris Charles de Gaulle Airfield',
        timestamp: '2026-05-24 06:15',
        description: 'Departed on Flight APX-009 crossing the Atlantic route. Currently flying overhead.',
        isCompleted: true
      },
      {
        id: 'ts6',
        status: 'Out for Delivery',
        location: 'Seattle-Tacoma Airport (SEA)',
        timestamp: 'Estimated: 2026-05-24 18:00',
        description: 'Awaiting customs inspection and high-safety logistics vehicle transfer.',
        isCompleted: false
      },
      {
        id: 'ts7',
        status: 'Delivered',
        location: 'Seattle Distribution Center',
        timestamp: 'Estimated: 2026-05-26 14:00',
        description: 'Final delivery dispatch to Horizon Luxury importers.',
        isCompleted: false
      }
    ]
  },
  {
    trackingId: 'APX-4412-JP',
    status: 'Out for Delivery',
    origin: {
      city: 'Tokyo',
      country: 'Japan',
      sender: 'Kuroki Premium Denim Mills',
      address: '2-Chome Kojimachi, Chiyoda City, Tokyo 102-0083'
    },
    destination: {
      city: 'Paris',
      country: 'France',
      receiver: 'Maison de Haute Couture Gallia',
      address: '15 Rue du Faubourg Saint-Honoré, 75008 Paris'
    },
    details: {
      weight: '48.5 kg',
      type: 'Air Express Freight',
      dimensions: '120 x 80 x 60 cm',
      value: '€24,800 EUR',
      serviceLevel: 'Express Cargo Saver',
      estimatedDelivery: '2026-05-24',
      shippingDate: '2026-05-20'
    },
    notes: 'Premium fabric material roll. High water sensitivity. Keep dry at all times.',
    timeline: [
      {
        id: 'js1',
        status: 'Processed',
        location: 'Okayama Weaving Facility',
        timestamp: '2026-05-20 08:30',
        description: 'Fabric inspected, wrapped in dual-layer waterproof shields.',
        isCompleted: true
      },
      {
        id: 'js2',
        status: 'Processed',
        location: 'Tokyo Narita Airport Hub (NRT)',
        timestamp: '2026-05-21 14:20',
        description: 'Consolidated into high-speed cargo container, air freight verified.',
        isCompleted: true
      },
      {
        id: 'js3',
        status: 'In Transit',
        location: 'NRT Flight Terminal',
        timestamp: '2026-05-22 03:00',
        description: 'Departed Narita on flight APX-398 over Arctic Circle track.',
        isCompleted: true
      },
      {
        id: 'js4',
        status: 'In Transit',
        location: 'Paris Charles de Gaulle (CDG) Main Depot',
        timestamp: '2026-05-23 10:10',
        description: 'Arrived at destination import terminal. Cleared custom duties immediately.',
        isCompleted: true
      },
      {
        id: 'js5',
        status: 'Out for Delivery',
        location: 'Paris Central Distribution Node',
        timestamp: '2026-05-24 07:45',
        description: 'Dispatched in localized eco-friendly tracking vehicle. Courier assigned: Jean-Luc L.',
        isCompleted: true
      },
      {
        id: 'js6',
        status: 'Delivered',
        location: 'Paris - Rue du Faubourg Saint-Honoré',
        timestamp: 'Estimated: 2026-05-24 16:30',
        description: 'Final hand-off with physical signature collection and condition inspection.',
        isCompleted: false
      }
    ]
  },
  {
    trackingId: 'APX-2015-EU',
    status: 'Delivered',
    origin: {
      city: 'Berlin',
      country: 'Germany',
      sender: 'Aurum Pharma Logistik GmbH',
      address: 'Mullerstraße 178, 13353 Berlin'
    },
    destination: {
      city: 'Munich',
      country: 'Germany',
      receiver: 'Alpha Biotech Research Center',
      address: 'Am Klopferspitz 19, 82152 Planegg, München'
    },
    details: {
      weight: '12.8 kg',
      type: 'Refrigerated Road Transport',
      dimensions: '50 x 50 x 50 cm',
      value: '€89,000 EUR',
      serviceLevel: 'Thermal Critical Priority',
      estimatedDelivery: '2026-05-23',
      shippingDate: '2026-05-22'
    },
    notes: 'Temperature-sensitive pharmaceuticals. Needs constant dry-ice cool storage (-20°C). Check temp logger logs upon receipt.',
    timeline: [
      {
        id: 'es1',
        status: 'Processed',
        location: 'Berlin Cold Depot',
        timestamp: '2026-05-22 13:00',
        description: 'Packaged in customized high-density polystyrene cooling containers with electronic sensors.',
        isCompleted: true
      },
      {
        id: 'es2',
        status: 'In Transit',
        location: 'Berlin-Tegel Transit Hub',
        timestamp: '2026-05-22 19:15',
        description: 'Loaded onto refrigerated logistics van with active temperature telemetry.',
        isCompleted: true
      },
      {
        id: 'es3',
        status: 'In Transit',
        location: 'Nuremberg Autobahn Rest Node',
        timestamp: '2026-05-23 02:40',
        description: 'Midway transit verify. Core temperature status stable at -21.4°C.',
        isCompleted: true
      },
      {
        id: 'es4',
        status: 'Out for Delivery',
        location: 'Munich North Hub',
        timestamp: '2026-05-23 08:30',
        description: 'Assigned to direct medical logistics courier line.',
        isCompleted: true
      },
      {
        id: 'es5',
        status: 'Delivered',
        location: 'Planegg, Munich Clinic',
        timestamp: '2026-05-23 11:22',
        description: 'Delivered successfully. Accepted and signed by Dr. H. Weber. Temp logger verified safe.',
        isCompleted: true
      }
    ]
  },
  {
    trackingId: 'APX-9530-US',
    status: 'Processed',
    origin: {
      city: 'Los Angeles',
      country: 'United States',
      sender: 'HydroGrid Solar Panels Manufacturing',
      address: '8900 Sepulveda Blvd, Los Angeles, CA 90045'
    },
    destination: {
      city: 'Houston',
      country: 'United States',
      receiver: 'Lone Star Renewables Development',
      address: '1201 Texas Ave, Houston, TX 77002'
    },
    details: {
      weight: '820.0 kg',
      type: 'Industrial Road Transport',
      dimensions: '240 x 180 x 150 cm',
      value: '$34,000 USD',
      serviceLevel: 'Heavy Cargo Freight',
      estimatedDelivery: '2026-05-28',
      shippingDate: '2026-05-24'
    },
    notes: 'Fragile silica solar cells. Heavy load flatbed transport. Ensure tethering is tight.',
    timeline: [
      {
        id: 'us1',
        status: 'Processed',
        location: 'LA Harbor Terminal Warehouse',
        timestamp: '2026-05-24 09:00',
        description: 'Shipment details declared, freight weight checked, loaded on transport pallet.',
        isCompleted: true
      },
      {
        id: 'us2',
        status: 'Processed',
        location: 'LA Harbor Terminal Warehouse',
        timestamp: '2026-05-24 14:00',
        description: 'Cargo loading onto heavy flatbed truck complete. Driver pre-trip assessment signed.',
        isCompleted: false
      },
      {
        id: 'us3',
        status: 'In Transit',
        location: 'Phoenix Node Checkpoint',
        timestamp: 'Estimated: 2026-05-25 11:00',
        description: 'Interstate checkpoint. Safety audit checklist approval.',
        isCompleted: false
      }
    ]
  }
];

// Initialize and manage shipments database on disk
let serverShipments = [];
try {
  if (fs.existsSync(SHIPMENTS_FILE)) {
    serverShipments = JSON.parse(fs.readFileSync(SHIPMENTS_FILE, "utf-8"));
    console.log("Shipments database loaded from disk. Total:", serverShipments.length);
  } else {
    serverShipments = DEFAULT_SHIPMENTS;
    fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify(serverShipments, null, 2), "utf-8");
  }
} catch (e) {
  console.error("Error loading shipments database from disk:", e);
  serverShipments = DEFAULT_SHIPMENTS;
}

// Initialize and manage branding database on disk
let serverBranding = {};
try {
  if (fs.existsSync(BRANDING_FILE)) {
    serverBranding = JSON.parse(fs.readFileSync(BRANDING_FILE, "utf-8"));
    console.log("Branding settings loaded from disk.");
  } else {
    serverBranding = DEFAULT_BRANDING;
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(serverBranding, null, 2), "utf-8");
  }
} catch (e) {
  console.error("Error loading branding from disk:", e);
  serverBranding = DEFAULT_BRANDING;
}

// Initialize and manage announcements database on disk
let serverAnnouncements = [];
try {
  if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
    serverAnnouncements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8"));
    console.log("Announcements loaded from disk. Total:", serverAnnouncements.length);
  } else {
    serverAnnouncements = DEFAULT_ANNOUNCEMENTS;
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(serverAnnouncements, null, 2), "utf-8");
  }
} catch (e) {
  console.error("Error loading announcements from disk:", e);
  serverAnnouncements = DEFAULT_ANNOUNCEMENTS;
}

// API endpoint to retrieve active credentials
app.get("/api/credentials", (req, res) => {
  res.json({ username: adminUsername, password: adminPassword });
});

// API endpoints for Shipments
app.get("/api/shipments", (req, res) => {
  res.json(serverShipments);
});

app.post("/api/shipments", (req, res) => {
  const shipmentsData = req.body;
  if (!Array.isArray(shipmentsData)) {
    return res.status(400).json({ error: "Invalid data format. Expected an array of shipments." });
  }
  serverShipments = shipmentsData;
  try {
    fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify(serverShipments, null, 2), "utf-8");
    console.log("Shipments database written to disk. Total:", serverShipments.length);
  } catch (e) {
    console.error("Error saving shipments database to disk:", e);
  }
  res.json({ success: true, count: serverShipments.length });
});

// API endpoints for Branding
app.get("/api/branding", (req, res) => {
  res.json(serverBranding);
});

app.post("/api/branding", (req, res) => {
  const brandingData = req.body;
  if (!brandingData || typeof brandingData !== 'object') {
    return res.status(400).json({ error: "Invalid data format. Expected a branding settings object." });
  }
  serverBranding = brandingData;
  try {
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(serverBranding, null, 2), "utf-8");
    console.log("Branding written to disk.");
  } catch (e) {
    console.error("Error saving branding to disk:", e);
  }
  res.json({ success: true });
});

// API endpoints for Announcements
app.get("/api/announcements", (req, res) => {
  res.json(serverAnnouncements);
});

app.post("/api/announcements", (req, res) => {
  const announcementsData = req.body;
  if (!Array.isArray(announcementsData)) {
    return res.status(400).json({ error: "Invalid data format. Expected an array of announcements." });
  }
  serverAnnouncements = announcementsData;
  try {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(serverAnnouncements, null, 2), "utf-8");
    console.log("Announcements written to disk. Total:", serverAnnouncements.length);
  } catch (e) {
    console.error("Error saving announcements to disk:", e);
  }
  res.json({ success: true, count: serverAnnouncements.length });
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
