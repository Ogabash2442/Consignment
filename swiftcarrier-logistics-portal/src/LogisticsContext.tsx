import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { Shipment, SupportChat, Announcement, ChatMessage, ShipmentStatus, BrandingSettings } from './types';

// @ts-ignore
import { 
  verifyAdminConfig, 
  removeAdminSession, 
  subscribeToAllChats, 
  subscribeToSingleUserChat, 
  sendAdminReplyMessage 
} from './admin';
// @ts-ignore
import { subscribeToUserChat, sendUserChatMessage } from './chat';

interface LogisticsContextType {
  shipments: Shipment[];
  chats: SupportChat[];
  announcements: Announcement[];
  branding: BrandingSettings;
  addShipment: (shipment: Shipment) => void;
  updateShipment: (shipment: Shipment) => void;
  deleteShipment: (trackingId: string) => void;
  getShipment: (trackingId: string) => Shipment | undefined;
  sendUserMessage: (userId: string, text: string, userName?: string, userEmail?: string) => void;
  sendAgentResponse: (userId: string, text: string) => void;
  markChatResolved: (userId: string) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  updateBranding: (branding: BrandingSettings) => void;
  isAuthenticated: boolean;
  isAdminLoading: boolean;
  loginAdmin: (username?: string, password?: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

const DEFAULT_SHIPMENTS: Shipment[] = [
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

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
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

const DEFAULT_CHATS: SupportChat[] = [
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

const DEFAULT_SVG_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%230f172a'/><path d='M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z' fill='none' stroke='%2338bdf8' stroke-width='6' stroke-linejoin='round'/><path d='M50 20 L50 80 M20 35 L50 50 L80 35' fill='none' stroke='%2338bdf8' stroke-width='4' stroke-linejoin='round'/><circle cx='50' cy='50' r='10' fill='%230ea5e9' opacity='0.8'/></svg>";

const DEFAULT_BRANDING: BrandingSettings = {
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

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    try {
      const saved = localStorage.getItem('apx_shipments');
      return saved ? JSON.parse(saved) : DEFAULT_SHIPMENTS;
    } catch (e) {
      console.warn("[LogisticsContext] Failed to parse apx_shipments from localStorage. Reverting to default.", e);
      return DEFAULT_SHIPMENTS;
    }
  });

  const [chats, setChats] = useState<SupportChat[]>(() => {
    try {
      const saved = localStorage.getItem('apx_chats');
      return saved ? JSON.parse(saved) : DEFAULT_CHATS;
    } catch (e) {
      console.warn("[LogisticsContext] Failed to parse apx_chats from localStorage. Reverting to default.", e);
      return DEFAULT_CHATS;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Session is checked purely as raw string value as required by instructions
    const sessionVal = localStorage.getItem('admin_session');
    console.log("[LogisticsContext] [LOCALSTORAGE READ] Initial read of 'admin_session':", sessionVal);
    return sessionVal === 'authenticated';
  });
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [customerUserId, setCustomerUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('chat_user_id');
      console.log("[LogisticsContext] [LOCALSTORAGE READ] Initial read of 'chat_user_id':", saved);
      return saved;
    } catch (e) {
      return null;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('apx_announcements');
      return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
    } catch (e) {
      console.warn("[LogisticsContext] Failed to parse apx_announcements from localStorage. Reverting to default.", e);
      return DEFAULT_ANNOUNCEMENTS;
    }
  });

  const [branding, setBranding] = useState<BrandingSettings>(() => {
    try {
      const saved = localStorage.getItem('apx_branding');
      return saved ? JSON.parse(saved) : DEFAULT_BRANDING;
    } catch (e) {
      console.warn("[LogisticsContext] Failed to parse apx_branding from localStorage. Reverting to default.", e);
      return DEFAULT_BRANDING;
    }
  });

  // Synchronize branding from Firestore globally
  useEffect(() => {
    if (!db) return;

    console.log("[LogisticsContext] Subscribing to branding from Firestore...");
    const brandingDocRef = doc(db, 'branding', 'current');
    
    const unsubscribe = onSnapshot(brandingDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BrandingSettings;
        setBranding(data);
      } else {
        const alreadySeeded = localStorage.getItem('apx_branding_seeded');
        if (!alreadySeeded) {
          console.log("[LogisticsContext] Branding not found in Firestore. Seeding defaults...");
          try {
            await setDoc(brandingDocRef, DEFAULT_BRANDING);
            localStorage.setItem('apx_branding_seeded', 'true');
          } catch (err) {
            console.error("[LogisticsContext] Failed to seed default branding:", err);
          }
        }
      }
    }, (error) => {
      console.warn("[LogisticsContext] Firestore branding subscription error/denied:", error);
    });

    return () => unsubscribe();
  }, [db]);

  // Synchronize announcements from Firestore globally
  useEffect(() => {
    if (!db) return;

    console.log("[LogisticsContext] Subscribing to announcements from Firestore...");
    const announcementsColRef = collection(db, 'announcements');

    const unsubscribe = onSnapshot(announcementsColRef, async (snapshot) => {
      if (!snapshot.empty) {
        const list: Announcement[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Announcement);
        });
        setAnnouncements(list);
      } else {
        const alreadySeeded = localStorage.getItem('apx_announcements_seeded');
        if (!alreadySeeded) {
          console.log("[LogisticsContext] Announcements collection is empty. Seeding defaults...");
          try {
            for (const ann of DEFAULT_ANNOUNCEMENTS) {
              await setDoc(doc(db, 'announcements', ann.id), ann);
            }
            localStorage.setItem('apx_announcements_seeded', 'true');
          } catch (err) {
            console.error("[LogisticsContext] Failed to seed default announcements:", err);
          }
        }
      }
    }, (error) => {
      console.warn("[LogisticsContext] Firestore announcements subscription error/denied:", error);
    });

    return () => unsubscribe();
  }, [db]);

  // Synchronize shipments from Firestore globally
  useEffect(() => {
    if (!db) return;

    console.log("[LogisticsContext] Subscribing to shipments from Firestore...");
    const shipmentsColRef = collection(db, 'shipments');

    const unsubscribe = onSnapshot(shipmentsColRef, async (snapshot) => {
      if (!snapshot.empty) {
        const list: Shipment[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Shipment);
        });
        setShipments(list);
      } else {
        const alreadySeeded = localStorage.getItem('apx_shipments_seeded');
        if (!alreadySeeded) {
          console.log("[LogisticsContext] Shipments collection is empty. Seeding defaults...");
          try {
            for (const s of DEFAULT_SHIPMENTS) {
              await setDoc(doc(db, 'shipments', s.trackingId.toUpperCase().trim()), s);
            }
            localStorage.setItem('apx_shipments_seeded', 'true');
          } catch (err) {
            console.error("[LogisticsContext] Failed to seed default shipments:", err);
          }
        }
      }
    }, (error) => {
      console.warn("[LogisticsContext] Firestore shipments subscription error/denied:", error);
    });

    return () => unsubscribe();
  }, [db]);

  // Synchronized persistent custom session & master root collection listener for admins
  useEffect(() => {
    let unsubscribeChats: (() => void) | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const startPollingFallback = () => {
      if (fallbackInterval) return;
      const fetchChats = async () => {
        try {
          const res = await fetch("/api/chats");
          if (res.ok) {
            const serverData = await res.json();
            setChats(serverData);
          }
        } catch (err) {
          // Silent catch
        }
      };
      fetchChats();
      fallbackInterval = setInterval(fetchChats, 1200);
    };

    const isSessionAuth = localStorage.getItem('admin_session') === 'authenticated';

    if (isSessionAuth) {
      console.log("[LogisticsContext] Admin custom session verified: authenticated.");
      setIsAuthenticated(true);
      setIsAdminLoading(false);

      if (db) {
        console.log("[LogisticsContext] Active Admin: Starting stable master real-time Firestore synchronization for chats from admin.js.");
        
        try {
          unsubscribeChats = subscribeToAllChats((chatList: SupportChat[]) => {
            setChats((prevChats) => {
              return chatList.map((headerItem) => {
                const existingChat = prevChats.find(c => c.userId === headerItem.userId);
                if (existingChat && existingChat.messages.length > 0) {
                  return {
                    ...headerItem,
                    messages: existingChat.messages // Preserves full detailed messages from local state or the active stream
                  };
                }
                return headerItem;
              });
            });
          });
        } catch (err) {
          console.error("[LogisticsContext] Failed to load chats stream:", err);
          startPollingFallback();
        }
      } else {
        startPollingFallback();
      }
    } else {
      console.log("[LogisticsContext] No authenticated admin session found.");
      setIsAuthenticated(false);
      setIsAdminLoading(false);
      startPollingFallback();
    }

    return () => {
      if (unsubscribeChats) unsubscribeChats();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [db]); // Re-subscribe if Firestore instance changes

  // Synchronized detail listener for the active chat room selected by the admin (listening to single doc 'chats/{userId}')
  useEffect(() => {
    if (!db || !isAuthenticated || !activeChatId) return;

    console.log("[LogisticsContext] Admin: Initializing active chat array field stream from admin.js for user:", activeChatId);

    let unsubscribeActiveMsg: (() => void) | null = null;

    try {
      unsubscribeActiveMsg = subscribeToSingleUserChat(activeChatId, (messagesList: ChatMessage[]) => {
        // Update the active chat's messages array inside the central chats state
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.userId === activeChatId) {
              return {
                ...chat,
                messages: messagesList
              };
            }
            return chat;
          });
        });
      });
    } catch (err) {
      console.error("[LogisticsContext] Failed to load active chat details stream:", err);
    }

    return () => {
      if (unsubscribeActiveMsg) {
        console.log("[LogisticsContext] Admin: Cleaning up active chat details stream for user:", activeChatId);
        unsubscribeActiveMsg();
      }
    };
  }, [activeChatId, isAuthenticated, db]);

  // Dedicated customer-side subscription for the active user's personal thread
  useEffect(() => {
    if (!db || !customerUserId) return;

    console.log("[LogisticsContext] Customer: Initiating personal chat stream subscription for user: ", customerUserId);

    let unsubscribeUserChat: (() => void) | null = null;

    try {
      unsubscribeUserChat = subscribeToUserChat(customerUserId, (messagesList: ChatMessage[]) => {
        setChats((prev) => {
          const existing = prev.find((c) => c.userId === customerUserId);
          if (existing) {
            return prev.map((c) => {
              if (c.userId === customerUserId) {
                return {
                  ...c,
                  messages: messagesList
                };
              }
              return c;
            });
          } else {
            return [{
              userId: customerUserId,
              userName: localStorage.getItem('chat_user_name') || 'Inquirer',
              userEmail: localStorage.getItem('chat_user_email') || '',
              status: 'unread',
              lastUpdated: new Date().toISOString(),
              subject: 'In-app Chat Consultation',
              messages: messagesList
            }, ...prev];
          }
        });
      });
    } catch (err) {
      console.error("[LogisticsContext] Failed to load customer chat listener:", err);
    }

    return () => {
      if (unsubscribeUserChat) {
        console.log("[LogisticsContext] Customer: Cleaning up personal chat stream for user:", customerUserId);
        unsubscribeUserChat();
      }
    };
  }, [customerUserId, db]);

  const loginAdmin = async (u?: string, p?: string) => {
    setIsAdminLoading(true);
    try {
      const result = await verifyAdminConfig(u || '', p || '');
      if (result.success) {
        setIsAuthenticated(true);
        setIsAdminLoading(false);
      } else {
        throw new Error(result.error || "Incorrect credentials");
      }
    } catch (err: any) {
      setIsAdminLoading(false);
      throw err;
    }
  };

  const logoutAdmin = async () => {
    try {
      removeAdminSession();
    } catch (err) {
      console.error("Failed to clean up admin session on storage level:", err);
    }
    setIsAuthenticated(false);
  };

  // Save changes to localStorage for local persistent behavior fallback
  useEffect(() => {
    localStorage.setItem('apx_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('apx_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('apx_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('apx_branding', JSON.stringify(branding));
  }, [branding]);

  // Shipment Actions
  const addShipment = (shipment: Shipment) => {
    const cloned = JSON.parse(JSON.stringify(shipment)) as Shipment;
    cloned.trackingId = cloned.trackingId.toUpperCase().trim();
    setShipments((prev) => [cloned, ...prev]);
    if (db) {
      setDoc(doc(db, 'shipments', cloned.trackingId), cloned).catch((err) => {
        console.error("[LogisticsContext] Failed to write new shipment to Firestore:", err);
      });
    }
  };

  const updateShipment = (updatedShipment: Shipment) => {
    const cloned = JSON.parse(JSON.stringify(updatedShipment)) as Shipment;
    cloned.trackingId = cloned.trackingId.toUpperCase().trim();
    setShipments((prev) => {
      return prev.map((s) => {
        if (s.trackingId.toUpperCase().trim() === cloned.trackingId) {
          return cloned;
        }
        return s;
      });
    });
    if (db) {
      setDoc(doc(db, 'shipments', cloned.trackingId), cloned).catch((err) => {
        console.error("[LogisticsContext] Failed to update shipment on Firestore:", err);
      });
    }
  };

  const deleteShipment = (trackingId: string) => {
    const tid = trackingId.toUpperCase().trim();
    setShipments((prev) => prev.filter((s) => s.trackingId.toUpperCase().trim() !== tid));
    if (db) {
      deleteDoc(doc(db, 'shipments', tid)).catch((err) => {
        console.error("[LogisticsContext] Failed to delete shipment from Firestore:", err);
      });
    }
  };

  const getShipment = (trackingId: string) => {
    return shipments.find((s) => s.trackingId.toUpperCase().trim() === trackingId.toUpperCase().trim());
  };

  // Support Chat Actions
  const sendUserMessage = async (userId: string, text: string, userName?: string, userEmail?: string) => {
    // True persistent customer session storage using localStorage
    try {
      localStorage.setItem('chat_user_id', userId);
      if (userName) localStorage.setItem('chat_user_name', userName);
      if (userEmail) localStorage.setItem('chat_user_email', userEmail);
    } catch (e) {
      console.warn("[LogisticsContext] Failed to write user identifiers to localStorage:", e);
    }
    setCustomerUserId(userId);

    const nowStr = new Date().toISOString();
    const timestampStr = nowStr.slice(0, 10) + ' ' + nowStr.slice(11, 16);
    const msgId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().substring(0, 5)
      : Math.random().toString(36).substring(2, 7);

    const newMessage: ChatMessage = {
      id: msgId,
      sender: 'user',
      text,
      timestamp: timestampStr
    };

    // Optimistic state update
    setChats((prev) => {
      const existing = prev.find((c) => c.userId === userId);
      if (existing) {
        return prev.map((c) => {
          if (c.userId === userId) {
            return {
              ...c,
              messages: [...c.messages, newMessage],
              status: 'unread',
              lastUpdated: nowStr
            };
          }
          return c;
        });
      } else {
        const newChat: SupportChat = {
          userId,
          userName: userName || 'Inquirer',
          userEmail: userEmail || 'anonymous@logistics.com',
          status: 'unread',
          lastUpdated: nowStr,
          subject: 'In-app Chat Consultation',
          messages: [newMessage]
        };
        return [newChat, ...prev];
      }
    });

    try {
      // 1. Send update to central Express server backup store
      try {
        await fetch('/api/chats/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            text,
            userName,
            userEmail,
            sender: 'user'
          })
        });
      } catch (e) {
        console.warn("Express backup post failed. Using Firestore primary.", e);
      }

      // 2. Synchronize with real-time Firestore (if enabled/available)
      if (db) {
        await sendUserChatMessage({
          userId,
          userName,
          userEmail,
          text
        });
      }
    } catch (err) {
      console.error('Failed to sync user message to Firestore:', err);
    }
  };

  const sendAgentResponse = async (userId: string, text: string) => {
    const nowStr = new Date().toISOString();
    const timestampStr = nowStr.slice(0, 10) + ' ' + nowStr.slice(11, 16);
    const msgId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().substring(0, 5)
      : Math.random().toString(36).substring(2, 7);

    const newMessage: ChatMessage = {
      id: msgId,
      sender: 'admin',
      text,
      timestamp: timestampStr
    };

    // Optimistic state update
    setChats((prev) => {
      return prev.map((c) => {
        if (c.userId === userId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            status: 'active',
            lastUpdated: nowStr
          };
        }
        return c;
      });
    });

    try {
      // 1. Send update to central Express server backup store
      try {
        await fetch('/api/chats/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            text,
            sender: 'admin'
          })
        });
      } catch (e) {
        console.warn("Express backup post failed. Using Firestore primary.", e);
      }

      // 2. Synchronize with real-time Firestore (if enabled)
      if (db) {
        await sendAdminReplyMessage(userId, text);
      }
    } catch (err) {
      console.error('Failed to sync agent response to Firestore:', err);
    }
  };

  const markChatResolved = async (userId: string) => {
    // Optimistic state update
    setChats((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, status: 'resolved' as const } : c))
    );

    try {
      // 1. Send update to central Express server backup store
      await fetch('/api/chats/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // 2. Real-time Firestore update
      if (db) {
        const chatDocRef = doc(db, "chats", userId);
        await setDoc(chatDocRef, {
          status: 'resolved',
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error('Failed to sync resolved chat status to Firestore:', err);
    }
  };

  // Announcement Actions
  const addAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => [announcement, ...prev]);
    if (db) {
      setDoc(doc(db, 'announcements', announcement.id), announcement).catch((err) => {
        console.error("[LogisticsContext] Failed to write announcement to Firestore:", err);
      });
    }
  };

  const updateAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcement.id ? announcement : a))
    );
    if (db) {
      setDoc(doc(db, 'announcements', announcement.id), announcement).catch((err) => {
        console.error("[LogisticsContext] Failed to update announcement on Firestore:", err);
      });
    }
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (db) {
      deleteDoc(doc(db, 'announcements', id)).catch((err) => {
        console.error("[LogisticsContext] Failed to delete announcement from Firestore:", err);
      });
    }
  };

  const updateBranding = (updatedBranding: BrandingSettings) => {
    setBranding(updatedBranding);
    if (db) {
      setDoc(doc(db, 'branding', 'current'), updatedBranding).catch((err) => {
        console.error("[LogisticsContext] Failed to update branding on Firestore:", err);
      });
    }
  };

  return (
    <LogisticsContext.Provider
      value={{
        shipments,
        chats,
        announcements,
        branding,
        addShipment,
        updateShipment,
        deleteShipment,
        getShipment,
        sendUserMessage,
        sendAgentResponse,
        markChatResolved,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        updateBranding,
        isAuthenticated,
        isAdminLoading,
        loginAdmin,
        logoutAdmin,
        activeChatId,
        setActiveChatId,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
