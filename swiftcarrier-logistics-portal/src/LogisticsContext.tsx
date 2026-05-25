import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { Shipment, SupportChat, Announcement, ChatMessage, ShipmentStatus, BrandingSettings } from './types';

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
  loginAdmin: () => Promise<void>;
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

const DEFAULT_BRANDING: BrandingSettings = {
  siteName: "APEX GLOBAL",
  websiteLogo: "APEX GLOBAL",
  headerLogo: "A",
  footerLogo: "APEX GLOBAL",
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
    const saved = localStorage.getItem('apx_shipments');
    return saved ? JSON.parse(saved) : DEFAULT_SHIPMENTS;
  });

  const [chats, setChats] = useState<SupportChat[]>(() => {
    const saved = localStorage.getItem('apx_chats');
    return saved ? JSON.parse(saved) : DEFAULT_CHATS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('apx_admin_logged_in') === 'true';
  });
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('apx_announcements');
    return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
  });

  const [branding, setBranding] = useState<BrandingSettings>(() => {
    const saved = localStorage.getItem('apx_branding');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDING;
  });

  // Synchronized Firebase Auth persistence & master root collection listener for admins
  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
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

    if (auth) {
      console.log("Subscribing to Firebase onAuthStateChanged authentication observer.");
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        const adminFlag = localStorage.getItem('apx_admin_logged_in') === 'true';

        if (user && adminFlag) {
          console.log("Admin persistent session verified: UID =", user.uid);
          setIsAuthenticated(true);
          setIsAdminLoading(false);

          // Admin remains authenticated: Initialize ONE stable root listener on 'chats' collection
          if (db) {
            console.log("Active Admin: Starting stable master real-time Firestore synchronization for chats. (onSnapshot-based).");
            const chatsColRef = collection(db, "chats");

            if (unsubscribeChats) unsubscribeChats();

            unsubscribeChats = onSnapshot(chatsColRef, (chatsSnapshot) => {
              const chatHeaderList: SupportChat[] = [];

              chatsSnapshot.docs.forEach((chatsDoc) => {
                const data = chatsDoc.data();
                const userId = data.userId || chatsDoc.id;

                chatHeaderList.push({
                  userId,
                  userName: data.userName || 'Inquirer',
                  userEmail: data.userEmail || '',
                  status: data.status || 'unread',
                  lastUpdated: data.lastUpdated || new Date().toISOString(),
                  subject: data.subject || 'General Support Request',
                  messages: data.messages || [] // Start with messages from root field if present
                });
              });

              // Sort chats descending by lastUpdated
              chatHeaderList.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

              // We want to merge updates into chats state without wiping out messages fetched by active subcollection listener
              setChats((prevChats) => {
                return chatHeaderList.map((headerItem) => {
                  const existingChat = prevChats.find(c => c.userId === headerItem.userId);
                  if (existingChat && existingChat.messages.length > 0) {
                    return {
                      ...headerItem,
                      messages: existingChat.messages // Preserves full detailed messages from the subcollection listener if it has been loaded
                    };
                  }
                  return headerItem;
                });
              });
            }, (error) => {
              console.warn("Firestore master root chats listen failed. Transitioning to fallback API.", error);
              startPollingFallback();
            });
          } else {
            startPollingFallback();
          }
        } else if (!user && adminFlag) {
          console.log("Admin flag is active in local storage, but current auth state is empty. Rebuilding session anonymously.");
          signInAnonymously(auth)
            .then((res) => {
              console.log("Authentication session automatically restored. Anonymous UID: ", res.user.uid);
            })
            .catch((e) => {
              console.error("Authentication automatic restoration failed. Defaulting to local offline fallback.", e);
              setIsAuthenticated(true);
              setIsAdminLoading(false);
              startPollingFallback();
            });
        } else {
          console.log("No authenticated admin session flag or active user context.");
          setIsAuthenticated(false);
          setIsAdminLoading(false);

          if (unsubscribeChats) {
            unsubscribeChats();
            unsubscribeChats = null;
          }
          startPollingFallback();
        }
      });
    } else {
      console.warn("Firebase Auth is offline or disabled. Running offline polling state.");
      setIsAuthenticated(localStorage.getItem('apx_admin_logged_in') === 'true');
      setIsAdminLoading(false);
      startPollingFallback();
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeChats) unsubscribeChats();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  // Synchronized subcollection listener for the active chat room selected by the admin
  useEffect(() => {
    if (!db || !isAuthenticated || !activeChatId) return;

    console.log("Admin: Initializing active chat subcollection stream for user:", activeChatId);
    
    // Subscribe directly to the messages subcollection of the currently highlighted user chat
    const messagesColRef = collection(db, "chats", activeChatId, "messages");
    
    const unsubscribeActiveMsg = onSnapshot(messagesColRef, (snapshot) => {
      const messagesList: ChatMessage[] = [];
      snapshot.docs.forEach((msgDoc) => {
        const msgData = msgDoc.data();
        messagesList.push({
          id: msgDoc.id,
          sender: msgData.sender || 'user',
          text: msgData.text || '',
          timestamp: msgData.timestamp || ''
        });
      });

      // Sort messages chronologically by actual timestamp
      messagesList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
    }, (error) => {
      console.error("Admin active subcollection listener failed:", activeChatId, error);
    });

    return () => {
      console.log("Admin: Cleaning up message subcollection stream for user:", activeChatId);
      unsubscribeActiveMsg();
    };
  }, [activeChatId, isAuthenticated, db]);

  // Dedicated customer-side subscription for the active user's personal thread
  useEffect(() => {
    if (!db || isAuthenticated) return;

    // Retrieve local user session unique ID
    const myUniqueUserId = localStorage.getItem('chat_user_id');
    if (!myUniqueUserId) return;

    console.log("Customer: Initiating personal chat stream subscription for user: ", myUniqueUserId);
    const chatDocRef = doc(db, "chats", myUniqueUserId);
    const submsgsColRef = collection(db, "chats", myUniqueUserId, "messages");

    // 1. Listen directly to parent metadata increments
    const unsubDoc = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChats((prev) => {
          const existing = prev.find((c) => c.userId === myUniqueUserId);
          if (existing) {
            return prev.map((c) => {
              if (c.userId === myUniqueUserId) {
                return {
                  ...c,
                  userName: data.userName || c.userName,
                  userEmail: data.userEmail || c.userEmail,
                  status: data.status || c.status,
                  lastUpdated: data.lastUpdated || c.lastUpdated
                };
              }
              return c;
            });
          } else {
            return [{
              userId: myUniqueUserId,
              userName: data.userName || localStorage.getItem('chat_user_name') || 'Inquirer',
              userEmail: data.userEmail || localStorage.getItem('chat_user_email') || '',
              status: data.status || 'unread',
              lastUpdated: data.lastUpdated || new Date().toISOString(),
              subject: data.subject || 'General Support Request',
              messages: []
            }, ...prev];
          }
        });
      }
    });

    // 2. Listen to message updates from their specific direct subcollection
    const unsubMsgs = onSnapshot(submsgsColRef, (snapshot) => {
      const msgsList: ChatMessage[] = [];
      snapshot.docs.forEach((mDoc) => {
        const mData = mDoc.data();
        msgsList.push({
          id: mDoc.id,
          sender: mData.sender || 'user',
          text: mData.text || '',
          timestamp: mData.timestamp || ''
        });
      });
      msgsList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setChats((prev) => {
        const existing = prev.find((c) => c.userId === myUniqueUserId);
        if (existing) {
          return prev.map((c) => {
            if (c.userId === myUniqueUserId) {
              return {
                ...c,
                messages: msgsList
              };
            }
            return c;
          });
        } else {
          return [{
            userId: myUniqueUserId,
            userName: localStorage.getItem('chat_user_name') || 'Inquirer',
            userEmail: localStorage.getItem('chat_user_email') || '',
            status: 'unread',
            lastUpdated: new Date().toISOString(),
            subject: 'General Support Request',
            messages: msgsList
          }, ...prev];
        }
      });
    });

    return () => {
      unsubDoc();
      unsubMsgs();
    };
  }, [isAuthenticated, db]);

  const loginAdmin = async () => {
    localStorage.setItem('apx_admin_logged_in', 'true');
    if (auth) {
      setIsAdminLoading(true);
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Firebase signInAnonymously failed:", err);
        setIsAuthenticated(true);
        setIsAdminLoading(false);
      }
    } else {
      setIsAuthenticated(true);
      setIsAdminLoading(false);
    }
  };

  const logoutAdmin = async () => {
    localStorage.removeItem('apx_admin_logged_in');
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase signOut failed:", err);
      }
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
    setShipments((prev) => [shipment, ...prev]);
  };

  const updateShipment = (updatedShipment: Shipment) => {
    setShipments((prev) =>
      prev.map((s) => (s.trackingId === updatedShipment.trackingId ? updatedShipment : s))
    );
  };

  const deleteShipment = (trackingId: string) => {
    setShipments((prev) => prev.filter((s) => s.trackingId !== trackingId));
  };

  const getShipment = (trackingId: string) => {
    return shipments.find((s) => s.trackingId.toUpperCase().trim() === trackingId.toUpperCase().trim());
  };

  // Support Chat Actions
  const sendUserMessage = async (userId: string, text: string, userName?: string, userEmail?: string) => {
    const nowStr = new Date().toISOString();
    const timestampStr = nowStr.slice(0, 10) + ' ' + nowStr.slice(11, 16);
    const msgId = Math.random().toString(36).substring(7);

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
          subject: 'General Support Request',
          messages: [newMessage]
        };
        return [newChat, ...prev];
      }
    });

    try {
      // 1. Send update to central Express server backup store
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

      // 2. Synchronize with real-time Firestore (if enabled/available)
      if (db) {
        const chatDocRef = doc(db, "chats", userId);
        const currentChat = chats.find(c => c.userId === userId);
        const existingMessages = currentChat ? [...currentChat.messages] : [];
        const updatedMessages = [...existingMessages, newMessage];

        // Save root document metadata & messages array
        await setDoc(chatDocRef, {
          userId,
          userName: userName || (currentChat ? currentChat.userName : 'Inquirer'),
          userEmail: userEmail || (currentChat ? currentChat.userEmail : 'anonymous@logistics.com'),
          status: 'unread',
          lastUpdated: nowStr,
          subject: 'General Support Request',
          messages: updatedMessages
        }, { merge: true });

        // Save nested duplicate to satisfy chats/{chatId}/messages/{messageId} sub-collection requirement
        const messageDocRef = doc(db, "chats", userId, "messages", msgId);
        await setDoc(messageDocRef, {
          id: msgId,
          sender: 'user',
          text,
          timestamp: timestampStr,
          readStatus: 'unread'
        });
      }
    } catch (err) {
      console.error('Failed to sync user message to Firestore:', err);
    }
  };

  const sendAgentResponse = async (userId: string, text: string) => {
    const nowStr = new Date().toISOString();
    const timestampStr = nowStr.slice(0, 10) + ' ' + nowStr.slice(11, 16);
    const msgId = Math.random().toString(36).substring(7);

    const newMessage: ChatMessage = {
      id: msgId,
      sender: 'agent',
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
      await fetch('/api/chats/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text,
          sender: 'agent'
        })
      });

      // 2. Synchronize with real-time Firestore (if enabled)
      if (db) {
        const chatDocRef = doc(db, "chats", userId);
        const currentChat = chats.find(c => c.userId === userId);
        const existingMessages = currentChat ? [...currentChat.messages] : [];
        const updatedMessages = [...existingMessages, newMessage];

        // Update root doc metadata & messages list
        await setDoc(chatDocRef, {
          status: 'active',
          lastUpdated: nowStr,
          messages: updatedMessages
        }, { merge: true });

        // Save nested duplicate to satisfy chats/{chatId}/messages/{messageId} sub-collection requirement
        const messageDocRef = doc(db, "chats", userId, "messages", msgId);
        await setDoc(messageDocRef, {
          id: msgId,
          sender: 'agent',
          text,
          timestamp: timestampStr,
          readStatus: 'read'
        });
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
  };

  const updateAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcement.id ? announcement : a))
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const updateBranding = (updatedBranding: BrandingSettings) => {
    setBranding(updatedBranding);
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
