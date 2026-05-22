/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, signOut as fbSignOut, User,
  updatePassword, updateEmail, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Shipment, ContactMessage, AdminActivityLog, PortalSettings, ShipmentStatus, ShipmentType,
  ChatMessage, Chat, SupportSession 
} from './types';

// Let's check if we are in demo mode
export const isDemoMode = !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('placeholder') || 
  firebaseConfig.apiKey === '';

let dbInstance: any = null;
let authInstance: any = null;

if (!isDemoMode) {
  try {
    const app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    authInstance = getAuth(app);
    console.log("Firebase initialized successfully in Production Mode.");
    
    // Validate connection to Firestore as requested by the skill instructions
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(dbInstance, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase client is currently offline.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Failed to initialize Firebase config. Falling back to Demo Mode.", error);
  }
} else {
  console.log("Firebase configuration is missing or inactive. Running in Local Storage Demo Mode.");
}

export const db = dbInstance;
export const auth = authInstance;

// --- Error Handling as defined in SKILL.md ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Pre-seeded Initial Data (Local Storage Demo Fallback) ---
const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'CSG928374',
    trackingId: 'CSG928374',
    sender: {
      name: 'Dieter Muller',
      email: 'muller.d@deutsch-mfg.de',
      phone: '+49 69 9876543',
      address: 'Industriestrasse 12, Frankfurt Am Main, Germany'
    },
    receiver: {
      name: 'Sarah Jenkins',
      email: 'sjenkins@apexsystems.com',
      phone: '+1 212 555 0199',
      address: '450 Lexington Ave, New York, NY 10017, USA'
    },
    origin: 'Frankfurt, Germany (FRA)',
    destination: 'New York, USA (JFK)',
    currentLocation: 'London Heathrow Gateway (LHR)',
    weight: 4.5,
    dimensions: { length: 30, width: 20, height: 15 },
    shipmentType: 'Express Delivery',
    shipmentStatus: 'Departed Facility',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    progress: 35,
    shippingCost: 89.50,
    carrierNote: 'Priority express document pouch. Expedited customs clearance processed at Frankfurt Hub.',
    routeHistory: [
      { location: 'Frankfurt Hub, Germany', lat: 50.1109, lng: 8.6821, timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), status: 'Pending' },
      { location: 'Frankfurt Hub Airport Terminal', lat: 50.0379, lng: 8.5622, timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), status: 'Departed Facility' },
      { location: 'London Heathrow Gateway, UK', lat: 51.4700, lng: -0.4543, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), status: 'Arrived Facility' }
    ],
    shipmentTimeline: [
      {
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:20',
        location: 'London Heathrow HUB (LHR)',
        status: 'Departed Facility',
        description: 'Shipment dispatched from London Heathrow HUB. Transit flight to New York JFK in progress.'
      },
      {
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:15',
        location: 'London Heathrow Airport (LHR)',
        status: 'Arrived Facility',
        description: 'Consignment sorted at London Heathrow airport facility and placed in transit cargo container.'
      },
      {
        date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '04:30',
        location: 'Frankfurt Hub (FRA)',
        status: 'Departed Facility',
        description: 'Departed Frankfurt central facility on board freight aircraft flight LH450.'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '21:00',
        location: 'Frankfurt Facility (FRA)',
        status: 'Processing',
        description: 'Shipment received, weighted, and dimension-verified. Labeled and packaged for express transport.'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '18:15',
        location: 'Frankfurt, Germany',
        status: 'Pending',
        description: 'Booking requested. Consignment collected from sender facility by local courier.'
      }
    ],
    shipmentImages: []
  },
  {
    id: 'TRK583920',
    trackingId: 'TRK583920',
    sender: {
      name: 'Yuki Takahashi',
      email: 'takahashi@tokyo-precision.co.jp',
      phone: '+81 3 1234 5678',
      address: '2-chome Otemachi, Chiyoda City, Tokyo, Japan'
    },
    receiver: {
      name: 'Francois Dubois',
      email: 'dubois@paris-electronique.fr',
      phone: '+33 1 4567 8910',
      address: '15 Rue de la Paix, Paris, France'
    },
    origin: 'Tokyo, Japan (NRT)',
    destination: 'Paris, France (CDG)',
    currentLocation: 'Roissy CDG Customs Office, Paris',
    weight: 142.0,
    dimensions: { length: 120, width: 80, height: 95 },
    shipmentType: 'Air Freight',
    shipmentStatus: 'Customs Clearance',
    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    progress: 75,
    shippingCost: 1425.00,
    carrierNote: 'Delicate electronic calibration units. Keep dry and store in temperature-controlled zone.',
    routeHistory: [
      { location: 'Tokyo Narita Airport, Japan', lat: 35.7720, lng: 140.3929, timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Departed Facility' },
      { location: 'Paris Roissy CDG Airport, France', lat: 49.0097, lng: 2.5479, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), status: 'Arrived Facility' }
    ],
    shipmentTimeline: [
      {
        date: new Date().toISOString().split('T')[0],
        time: '15:40',
        location: 'Paris Charles de Gaulle (CDG)',
        status: 'Customs Clearance',
        description: 'Entering regulatory customs check. Handing over declaration paperwork and certifications.'
      },
      {
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:30',
        location: 'Paris Charles de Gaulle Airport (CDG)',
        status: 'Arrived Facility',
        description: 'Aircraft landed safely at CDG air freight terminal. Sorting process underway.'
      },
      {
        date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '23:10',
        location: 'Tokyo Narita Hub',
        status: 'Departed Facility',
        description: 'Cargo packed and successfully loaded onto container flight JL8021.'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        location: 'Tokyo Precision Labs',
        status: 'Pending',
        description: 'Shipment created, secured on wooden pallet, ready for airport dispatch.'
      }
    ],
    shipmentImages: []
  },
  {
    id: 'LOG284756',
    trackingId: 'LOG284756',
    sender: {
      name: 'Wang Wei',
      email: 'w.wei@china-logistics.cn',
      phone: '+86 21 6543 2100',
      address: '888 Pudong Avenue, Pudong New Area, Shanghai, China'
    },
    receiver: {
      name: 'Robert Miller',
      email: 'r.miller@cal-distributors.com',
      phone: '+1 310 987 6543',
      address: '2200 Terminal Way, Port of Los Angeles, San Pedro, CA 90731, USA'
    },
    origin: 'Port of Shanghai, China (CNSHA)',
    destination: 'Port of Los Angeles, USA (USLAX)',
    currentLocation: 'Recipient Warehouse, CA, USA',
    weight: 1250.0,
    dimensions: { length: 240, width: 120, height: 160 },
    shipmentType: 'Sea Freight',
    shipmentStatus: 'Delivered',
    estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    shippingCost: 3840.00,
    carrierNote: 'Full LCL load container. Delivery complete. Signed off by representative R. Miller.',
    routeHistory: [
      { location: 'Shanghai Deepwater Port, China', lat: 30.6231, lng: 122.0628, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'Departed Facility' },
      { location: 'Port of Los Angeles, CA, USA', lat: 33.7292, lng: -118.2620, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Arrived Facility' }
    ],
    shipmentTimeline: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '16:30',
        location: 'Los Angeles, USA',
        status: 'Delivered',
        description: 'Successfully unloaded and signed for at the recipient primary distribution center warehouse.'
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '08:00',
        location: 'Port of Los Angeles (USLAX)',
        status: 'Out for Delivery',
        description: 'Dispatched for last-mile freight delivery via local carrier truck heavy liner.'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:15',
        location: 'Port of Los Angeles terminal customs',
        status: 'Customs Clearance',
        description: 'Customs cleared successfully, released from sea terminal yard to harbor freight dispatch.'
      },
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '19:40',
        location: 'Yangshan Shanghai Terminal',
        status: 'Departed Facility',
        description: 'Cargo vessel COSCO PACIFIC departed Shanghai port carrying LCL crate.'
      }
    ],
    shipmentImages: []
  },
  {
    id: 'HLD193740',
    trackingId: 'HLD193740',
    sender: {
      name: 'Charlotte Dubois',
      email: 'charlotte@luxe-paris.fr',
      phone: '+33 1 8976 5432',
      address: '75 Avenue des Champs-Elysées, Paris, France'
    },
    receiver: {
      name: 'Aiden Smith',
      email: 'aiden.s@aus-retail.com',
      phone: '+61 2 9876 5432',
      address: '100 George St, Sydney, NSW 2000, Australia'
    },
    origin: 'Paris, France (CDG)',
    destination: 'Sydney, Australia (SYD)',
    currentLocation: 'Sydney Airport customs checkpoint',
    weight: 1.2,
    dimensions: { length: 25, width: 25, height: 10 },
    shipmentType: 'Express Delivery',
    shipmentStatus: 'Held',
    estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    progress: 50,
    shippingCost: 110.00,
    carrierNote: 'Held by customs agency for mandatory quarantine inspection certificate review.',
    routeHistory: [
      { location: 'Paris Charles de Gaulle Hub, France', lat: 49.0097, lng: 2.5479, timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Departed Facility' },
      { location: 'Sydney Kingsford Smith Airport, Australia', lat: -33.9461, lng: 151.1772, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Arrived Facility' }
    ],
    shipmentTimeline: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        location: 'Sydney (SYD) Airport',
        status: 'Held',
        description: 'Shipment held at Sydney airport customs facility. Quarantine inspection pending paperwork for imported goods.'
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '04:15',
        location: 'Sydney Kingsford Smith Cargo Terminal',
        status: 'Arrived Facility',
        description: 'Air cargo plane touched down. Transferred to secure sorting warehouse.'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '19:30',
        location: 'Paris CDG Airport',
        status: 'Departed Facility',
        description: 'Dispatched on flight QF142 bound for Sydney.'
      }
    ],
    shipmentImages: []
  }
];

const INITIAL_SETTINGS: PortalSettings = {
  websiteName: 'SwiftCarrier Global',
  companyEmail: 'support@swiftcarrier-global.com',
  companyPhone: '+1 (800) 555-SWIFT',
  officeAddress: '100 Gateway Boulevard, Dallas, TX 75201, USA',
  supportHours: '24/7 Global Client Operations Support'
};

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg_001',
    name: 'Johnathan Crane',
    email: 'johnathan.crane@gmail.com',
    subject: 'Bulk shipping quotation request',
    message: 'Hello, our pharmaceutical manufacturing plant requires weekly shipping of active reagents from Cologne, Germany (CGN) to Chicago O\'Hare (ORD). Typical container payloads are roughly 350KG requiring dry ice packing. Looking to request a freight quote.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'unread'
  },
  {
    id: 'msg_002',
    name: 'Melissa Vance',
    email: 'mvance@fashionoutlet.co.uk',
    subject: 'Delayed shipment tracking ID HLD193740',
    message: 'Greetings, my package has been marked as Held in Sydney Airport for quarantine inspection. Can you advise if you require any declarations from my company to expedite release?',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    status: 'replied'
  }
];

const INITIAL_LOGS: AdminActivityLog[] = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    action: 'UPDATE_STATUS',
    trackingId: 'CSG928374',
    details: 'Status updated from Arrived Facility to Departed Facility in London Heathrow HUB.',
    adminEmail: 'myown2442@gmail.com'
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    action: 'CREATE_SHIPMENT',
    trackingId: 'HLD193740',
    details: 'New Express shipment created from Paris to Sydney (Weight: 1.2 KG).',
    adminEmail: 'myown2442@gmail.com'
  }
];

// Helper to initialize Local Storage
const initLocalStorage = () => {
  if (!localStorage.getItem('sc_shipments')) {
    localStorage.setItem('sc_shipments', JSON.stringify(INITIAL_SHIPMENTS));
  }
  if (!localStorage.getItem('sc_settings')) {
    localStorage.setItem('sc_settings', JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem('sc_messages')) {
    localStorage.setItem('sc_messages', JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem('sc_logs')) {
    localStorage.setItem('sc_logs', JSON.stringify(INITIAL_LOGS));
  }
};

if (typeof window !== 'undefined') {
  initLocalStorage();
}

// --- Dynamic Database Methods (Auto-Routing Firestore vs LocalStorage) ---

export const getPortalSettings = async (): Promise<PortalSettings> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_settings');
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  const path = 'settings';
  try {
    const docRef = doc(db, path, 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PortalSettings;
    } else {
      // Seed initial
      await setDoc(docRef, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${path}/global`);
  }
};

export const updatePortalSettings = async (settings: PortalSettings, adminEmail: string): Promise<void> => {
  if (isDemoMode) {
    localStorage.setItem('sc_settings', JSON.stringify(settings));
    addAdminActivityLog('UPDATE_SETTINGS', undefined, `Updated website branding details in settings.`, adminEmail);
    return;
  }

  const path = 'settings';
  try {
    const docRef = doc(db, path, 'global');
    await setDoc(docRef, settings);
    await addAdminActivityLog('UPDATE_SETTINGS', undefined, `Updated website branding details in settings.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/global`);
  }
};

export const getShipmentByTrackingId = async (trackingId: string): Promise<Shipment | null> => {
  const tid = trackingId.trim().toUpperCase();
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_shipments');
      const shipments: Shipment[] = data ? JSON.parse(data) : INITIAL_SHIPMENTS;
      const found = shipments.find(s => s.trackingId.toUpperCase() === tid);
      return found || null;
    } catch {
      return null;
    }
  }

  const path = 'shipments';
  try {
    const docRef = doc(db, path, tid);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Shipment) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${path}/${tid}`);
  }
};

export const getAllShipments = async (): Promise<Shipment[]> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_shipments');
      return data ? JSON.parse(data) : INITIAL_SHIPMENTS;
    } catch {
      return INITIAL_SHIPMENTS;
    }
  }

  const path = 'shipments';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Shipment[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Shipment);
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveShipment = async (shipment: Shipment, adminEmail: string): Promise<void> => {
  const trackingId = shipment.trackingId.toUpperCase();
  shipment.trackingId = trackingId;
  shipment.id = trackingId;
  shipment.updatedAt = new Date().toISOString();

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_shipments');
      const shipments: Shipment[] = data ? JSON.parse(data) : INITIAL_SHIPMENTS;
      const index = shipments.findIndex(s => s.trackingId === trackingId);
      
      let action = 'UPDATE_SHIPMENT';
      let details = `Modified shipment ${trackingId} destination: ${shipment.destination}.`;

      if (index > -1) {
        shipments[index] = shipment;
      } else {
        shipments.unshift(shipment);
        action = 'CREATE_SHIPMENT';
        details = `New shipment initiated with ID ${trackingId} from ${shipment.origin} to ${shipment.destination}.`;
      }
      localStorage.setItem('sc_shipments', JSON.stringify(shipments));
      addAdminActivityLog(action, trackingId, details, adminEmail);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'shipments';
  try {
    const docRef = doc(db, path, trackingId);
    const snap = await getDoc(docRef);
    const isNew = !snap.exists();

    await setDoc(docRef, shipment);

    const action = isNew ? 'CREATE_SHIPMENT' : 'UPDATE_SHIPMENT';
    const details = isNew 
      ? `New shipment initiated with ID ${trackingId} from ${shipment.origin} to ${shipment.destination}.`
      : `Modified shipment ${trackingId} destination: ${shipment.destination}.`;

    await addAdminActivityLog(action, trackingId, details, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${trackingId}`);
  }
};

export const deleteShipment = async (trackingId: string, adminEmail: string): Promise<void> => {
  const tid = trackingId.toUpperCase();
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_shipments');
      let shipments: Shipment[] = data ? JSON.parse(data) : INITIAL_SHIPMENTS;
      shipments = shipments.filter(s => s.trackingId !== tid);
      localStorage.setItem('sc_shipments', JSON.stringify(shipments));
      addAdminActivityLog('DELETE_SHIPMENT', tid, `Deleted shipment ${tid} fully from records.`, adminEmail);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'shipments';
  try {
    const docRef = doc(db, path, tid);
    await deleteDoc(docRef);
    await addAdminActivityLog('DELETE_SHIPMENT', tid, `Deleted shipment ${tid} fully from records.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${tid}`);
  }
};

export const submitContactMessage = async (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<void> => {
  const id = 'msg_' + Math.floor(Math.random() * 900000 + 100000).toString();
  const fullMessage: ContactMessage = {
    ...message,
    id,
    createdAt: new Date().toISOString(),
    status: 'unread'
  };

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_messages');
      const messages: ContactMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
      messages.unshift(fullMessage);
      localStorage.setItem('sc_messages', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'contact_messages';
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, fullMessage);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${id}`);
  }
};

export const getAllContactMessages = async (): Promise<ContactMessage[]> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_messages');
      return data ? JSON.parse(data) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  const path = 'contact_messages';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: ContactMessage[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as ContactMessage);
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const updateContactMessageStatus = async (id: string, status: 'unread' | 'read' | 'replied', adminEmail: string): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_messages');
      const messages: ContactMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
      const index = messages.findIndex(m => m.id === id);
      if (index > -1) {
        messages[index].status = status;
        localStorage.setItem('sc_messages', JSON.stringify(messages));
        addAdminActivityLog('UPDATE_CONTACT_STATUS', undefined, `Marked contact message ${id} as ${status}.`, adminEmail);
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'contact_messages';
  try {
    const docRef = doc(db, path, id);
    await updateDoc(docRef, { status });
    await addAdminActivityLog('UPDATE_CONTACT_STATUS', undefined, `Marked contact message ${id} as ${status}.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${id}`);
  }
};

export const getAdminActivityLogs = async (): Promise<AdminActivityLog[]> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_logs');
      return data ? JSON.parse(data) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  }

  const path = 'admin_logs';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: AdminActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as AdminActivityLog);
    });
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const addAdminActivityLog = async (
  action: string, 
  trackingId: string | undefined, 
  details: string, 
  adminEmail: string
): Promise<void> => {
  const id = 'log_' + Math.floor(Math.random() * 900000 + 100000).toString();
  const log: AdminActivityLog = {
    id,
    timestamp: new Date().toISOString(),
    action,
    trackingId,
    details,
    adminEmail
  };

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_logs');
      const logs: AdminActivityLog[] = data ? JSON.parse(data) : INITIAL_LOGS;
      logs.unshift(log);
      localStorage.setItem('sc_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'admin_logs';
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, log);
  } catch (error) {
    // Non-blocking log failures to avoid halting operations
    console.error('Failed to log admin action', error);
  }
};

// ==========================================
// ====== ADVANCED CHAT & SECURITY SYSTEMS ======
// ==========================================

const chatListeners = new Set<(chats: Chat[]) => void>();
const singleChatListeners = new Map<string, Set<(chat: Chat | null) => void>>();

export const triggerChatChange = () => {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem('sc_chats');
    const chats: Chat[] = data ? JSON.parse(data) : [];
    chatListeners.forEach(listener => {
      try { listener(chats); } catch (e) { console.error(e); }
    });
    singleChatListeners.forEach((listenerSet, chatId) => {
      const chat = chats.find(c => c.chatId === chatId) || null;
      listenerSet.forEach(listener => {
        try { listener(chat); } catch (e) { console.error(e); }
      });
    });
  } catch (err) {
    console.error('Error triggering local chat fallback change', err);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'sc_chats') {
      triggerChatChange();
    }
  });
}

// User-Side: Start support chat without signup
export const startSupportChat = async (userName: string, userEmail: string): Promise<string> => {
  const chatId = 'chat_' + Math.floor(Math.random() * 100000000).toString();
  const newChat: Chat = {
    chatId,
    userName,
    userEmail,
    messages: [
      {
        sender: 'admin',
        message: `Hello ${userName}! Welcome to SwiftCarrier Support. How can we assist you with your freight or shipment operations today?`,
        timestamp: new Date().toISOString(),
        readStatus: 'read'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'open',
    unreadCount: 0,
    lastMessage: 'Welcome to SwiftCarrier Support.',
    adminAssigned: null,
    userTyping: false,
    adminTyping: false,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser',
    deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop'
  };

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      chats.unshift(newChat);
      localStorage.setItem('sc_chats', JSON.stringify(chats));
      triggerChatChange();
    } catch (e) {
      console.error(e);
    }
    return chatId;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    await setDoc(docRef, newChat);
    return chatId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${chatId}`);
  }
};

// Real-Time Listener for a Single Active Chat
export const listenToChat = (chatId: string, callback: (chat: Chat | null) => void): () => void => {
  if (isDemoMode) {
    if (!singleChatListeners.has(chatId)) {
      singleChatListeners.set(chatId, new Set());
    }
    singleChatListeners.get(chatId)!.add(callback);
    
    // Initial emission
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const chat = chats.find(c => c.chatId === chatId) || null;
      callback(chat);
    } catch {
      callback(null);
    }

    return () => {
      const sets = singleChatListeners.get(chatId);
      if (sets) {
        sets.delete(callback);
        if (sets.size === 0) {
          singleChatListeners.delete(chatId);
        }
      }
    };
  }

  const path = 'chats';
  const docRef = doc(db, path, chatId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Chat);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${path}/${chatId}`);
  });

  return unsubscribe;
};

// Real-Time Listener for All Conversations (Admin Cockpit)
export const listenAllChats = (callback: (chats: Chat[]) => void): () => void => {
  if (isDemoMode) {
    chatListeners.add(callback);
    // Initial emission
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      callback(chats);
    } catch {
      callback([]);
    }

    return () => {
      chatListeners.delete(callback);
    };
  }

  const path = 'chats';
  const chatsQuery = query(collection(db, path), orderBy('updatedAt', 'desc'));
  const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
    const chatsList: Chat[] = [];
    snapshot.forEach((doc) => {
      chatsList.push(doc.data() as Chat);
    });
    callback(chatsList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });

  return unsubscribe;
};

// Send message in current active conversation
export const sendChatMessage = async (
  chatId: string,
  sender: 'user' | 'admin',
  messageText: string,
  attachment?: { url: string; type: string; name: string }
): Promise<void> => {
  const newMessage: ChatMessage = {
    sender,
    message: messageText,
    timestamp: new Date().toISOString(),
    readStatus: sender === 'admin' ? 'read' : 'unread',
    attachmentUrl: attachment?.url,
    attachmentType: attachment?.type,
    attachmentName: attachment?.name
  };

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const index = chats.findIndex(c => c.chatId === chatId);
      if (index > -1) {
        const chat = chats[index];
        chat.messages.push(newMessage);
        chat.updatedAt = new Date().toISOString();
        chat.lastMessage = messageText || (attachment ? `Attachment: ${attachment.name}` : '');
        if (sender === 'user') {
          chat.unreadCount += 1;
        } else {
          // Admin replies mark admin messages as read, and resets user unread count as admin is actively inspecting
          chat.unreadCount = 0;
        }
        chats[index] = chat;
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const chat = docSnap.data() as Chat;
      const updatedMessages = [...chat.messages, newMessage];
      const updates: Partial<Chat> = {
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
        lastMessage: messageText || (attachment ? `Attachment: ${attachment.name}` : ''),
      };
      if (sender === 'user') {
        updates.unreadCount = (chat.unreadCount || 0) + 1;
      } else {
        updates.unreadCount = 0;
      }
      await updateDoc(docRef, updates);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${chatId}`);
  }
};

// Mark conversation messages as read
export const markChatAsRead = async (chatId: string, actor: 'user' | 'admin'): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const index = chats.findIndex(c => c.chatId === chatId);
      if (index > -1) {
        const chat = chats[index];
        chat.messages = chat.messages.map(m => {
          if (actor === 'admin' && m.sender === 'user') {
            return { ...m, readStatus: 'read' };
          }
          if (actor === 'user' && m.sender === 'admin') {
            return { ...m, readStatus: 'read' };
          }
          return m;
        });
        if (actor === 'admin') {
          chat.unreadCount = 0;
        }
        chats[index] = chat;
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const chat = docSnap.data() as Chat;
      const updatedMessages = chat.messages.map(m => {
        if (actor === 'admin' && m.sender === 'user') {
          return { ...m, readStatus: 'read' as const };
        }
        if (actor === 'user' && m.sender === 'admin') {
          return { ...m, readStatus: 'read' as const };
        }
        return m;
      });
      const updates: Partial<Chat> = {
        messages: updatedMessages
      };
      if (actor === 'admin') {
        updates.unreadCount = 0;
      }
      await updateDoc(docRef, updates);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${chatId}`);
  }
};

// Set dynamic typing indicators
export const setChatTypingStatus = async (chatId: string, sender: 'user' | 'admin', isTyping: boolean): Promise<void> => {
  const updateKey = sender === 'user' ? 'userTyping' : 'adminTyping';

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const index = chats.findIndex(c => c.chatId === chatId);
      if (index > -1) {
        chats[index][updateKey] = isTyping;
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
      }
    } catch {
      // Ignored
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    await updateDoc(docRef, { [updateKey]: isTyping });
  } catch (error) {
    // Avoid interrupting fast typing processes
    console.warn("Typing status update failed", error);
  }
};

// Mark conversation as resolved, closed, or archived
export const updateChatStatus = async (chatId: string, status: 'open' | 'closed' | 'resolved' | 'archived', adminEmail: string): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const index = chats.findIndex(c => c.chatId === chatId);
      if (index > -1) {
        chats[index].status = status;
        chats[index].updatedAt = new Date().toISOString();
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
        await addAdminActivityLog('CHAT_STATUS_UPDATE', undefined, `Marked chat session ${chatId} as ${status.toUpperCase()}.`, adminEmail);
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    await updateDoc(docRef, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    await addAdminActivityLog('CHAT_STATUS_UPDATE', undefined, `Marked chat session ${chatId} as ${status.toUpperCase()}.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${chatId}`);
  }
};

// Purge single message by exact timestamp identifier
export const deleteChatMessage = async (chatId: string, timestamp: string, adminEmail: string): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const idx = chats.findIndex(c => c.chatId === chatId);
      if (idx > -1) {
        chats[idx].messages = chats[idx].messages.filter(m => m.timestamp !== timestamp);
        chats[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
        await addAdminActivityLog('CHAT_MSG_DELETE', undefined, `Purged single message from chat ${chatId}.`, adminEmail);
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const chat = docSnap.data() as Chat;
      const filtered = chat.messages.filter(m => m.timestamp !== timestamp);
      await updateDoc(docRef, {
        messages: filtered,
        updatedAt: new Date().toISOString()
      });
      await addAdminActivityLog('CHAT_MSG_DELETE', undefined, `Purged single message from chat ${chatId}.`, adminEmail);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${chatId}`);
  }
};

// Delete entire chat thread history messages
export const clearChatHistory = async (chatId: string, adminEmail: string): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const idx = chats.findIndex(c => c.chatId === chatId);
      if (idx > -1) {
        chats[idx].messages = [];
        chats[idx].lastMessage = 'Chat history cleared by administrator.';
        chats[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
        await addAdminActivityLog('CHAT_HISTORY_CLEAR', undefined, `Cleared message history for chat ${chatId}.`, adminEmail);
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    await updateDoc(docRef, {
      messages: [],
      lastMessage: 'Chat history cleared by administrator.',
      updatedAt: new Date().toISOString()
    });
    await addAdminActivityLog('CHAT_HISTORY_CLEAR', undefined, `Cleared message history for chat ${chatId}.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${chatId}`);
  }
};

// Block a spam client email
export const blockUserEmail = async (email: string, adminEmail: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  if (isDemoMode) {
    try {
      const blocked = JSON.parse(localStorage.getItem('sc_blocked_emails') || '[]');
      if (!blocked.includes(cleanEmail)) {
        blocked.push(cleanEmail);
        localStorage.setItem('sc_blocked_emails', JSON.stringify(blocked));
      }
      
      // Also tag existing chats matching this email as blocked
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      let changed = false;
      chats.forEach(c => {
        if (c.userEmail.trim().toLowerCase() === cleanEmail) {
          c.isBlocked = true;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
      }
      
      await addAdminActivityLog('BLOCK_USER', undefined, `Blocked spam user ${cleanEmail}.`, adminEmail);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'blocked_users';
  try {
    const docRef = doc(db, path, cleanEmail);
    await setDoc(docRef, { email: cleanEmail, blockedAt: new Date().toISOString() });
    
    // Search active chats and mark isBlocked true
    const chatDocRef = query(collection(db, 'chats'), where('userEmail', '==', email));
    const chatSnaps = await getDocs(chatDocRef);
    chatSnaps.forEach(async (chatDoc) => {
      await updateDoc(doc(db, 'chats', chatDoc.id), { isBlocked: true });
    });
    
    await addAdminActivityLog('BLOCK_USER', undefined, `Blocked spam user ${cleanEmail}.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${cleanEmail}`);
  }
};

// Check if user is currently blacklisted from support cockpit
export const isUserEmailBlocked = async (email: string): Promise<boolean> => {
  const cleanEmail = email.trim().toLowerCase();
  if (isDemoMode) {
    try {
      const blocked = JSON.parse(localStorage.getItem('sc_blocked_emails') || '[]');
      return blocked.includes(cleanEmail);
    } catch {
      return false;
    }
  }

  const path = 'blocked_users';
  try {
    const docRef = doc(db, path, cleanEmail);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch {
    return false;
  }
};

// Assign admin agent to active chat session
export const assignChatAdmin = async (chatId: string, adminEmail: string | null): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const index = chats.findIndex(c => c.chatId === chatId);
      if (index > -1) {
        chats[index].adminAssigned = adminEmail;
        chats[index].updatedAt = new Date().toISOString();
        localStorage.setItem('sc_chats', JSON.stringify(chats));
        triggerChatChange();
        if (adminEmail) {
          await addAdminActivityLog('CHAT_ASSIGN', undefined, `Assigned chat waybill session ${chatId} to inspector ${adminEmail}.`, adminEmail);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    await updateDoc(docRef, { 
      adminAssigned: adminEmail,
      updatedAt: new Date().toISOString()
    });
    if (adminEmail) {
      await addAdminActivityLog('CHAT_ASSIGN', undefined, `Assigned chat waybill session ${chatId} to inspector ${adminEmail}.`, adminEmail);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${chatId}`);
  }
};

// Permanent deletion of support conversion log
export const deleteChat = async (chatId: string, adminEmail: string): Promise<void> => {
  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_chats');
      const chats: Chat[] = data ? JSON.parse(data) : [];
      const filtered = chats.filter(c => c.chatId !== chatId);
      localStorage.setItem('sc_chats', JSON.stringify(filtered));
      triggerChatChange();
      await addAdminActivityLog('CHAT_DELETE', undefined, `Permanently purged customer support chat log reference ${chatId}.`, adminEmail);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const path = 'chats';
  try {
    const docRef = doc(db, path, chatId);
    await deleteDoc(docRef);
    await addAdminActivityLog('CHAT_DELETE', undefined, `Permanently purged customer support chat log reference ${chatId}.`, adminEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${chatId}`);
  }
};

// Admin Session Tracking Logs for auditing audits
export const addSupportSession = async (
  chatId: string, 
  userName: string, 
  userEmail: string, 
  status: 'active' | 'closed'
): Promise<string> => {
  const sessionId = 'sess_' + Math.floor(Math.random() * 900000 + 100000).toString();
  const session: SupportSession = {
    sessionId,
    chatId,
    userId: userEmail,
    userName,
    userEmail,
    startedAt: new Date().toISOString(),
    status
  };

  if (isDemoMode) {
    try {
      const data = localStorage.getItem('sc_support_sessions');
      const sessions: SupportSession[] = data ? JSON.parse(data) : [];
      sessions.unshift(session);
      localStorage.setItem('sc_support_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
    return sessionId;
  }

  const path = 'support_sessions';
  try {
    const docRef = doc(db, path, sessionId);
    await setDoc(docRef, session);
    return sessionId;
  } catch (error) {
    console.error("Non-blocking fail starting support session record", error);
    return sessionId;
  }
};

// ==========================================
// ====== ADMIN DIRECT SECURE PASSWORD/EMAIL ======
// ==========================================

export const updateAdminEmail = async (newEmail: string, currentPassword?: string): Promise<void> => {
  if (isDemoMode) {
    try {
      // Persist the administrative overrides locally so bypass handles it correctly
      localStorage.setItem('sc_custom_admin_email', newEmail);
      console.log(`Bypass credentials updated locally. Custom Admin Email is now: ${newEmail}`);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  // Live Firebase auth operations
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("No active credentials identified in context.");

  try {
    // Authentication Security Validation: If password provided, validate/reauthenticate
    if (currentPassword && currentUser.email) {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
    }
    await updateEmail(currentUser, newEmail);
  } catch (error: any) {
    throw new Error(error.message || "Failed to edit administrative email credentials.");
  }
};

export const updateAdminPassword = async (newPassword: string, currentPassword?: string): Promise<void> => {
  if (isDemoMode) {
    try {
      localStorage.setItem('sc_custom_admin_pass', newPassword);
      console.log(`Bypass passcode successfully revised.`);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("No active credentials identified in context.");

  try {
    if (currentPassword && currentUser.email) {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
    }
    await updatePassword(currentUser, newPassword);
  } catch (error: any) {
    throw new Error(error.message || "Credential reset rejected by authentication provider.");
  }
};

export const sendAdminPasswordReset = async (email: string): Promise<void> => {
  if (isDemoMode) {
    console.log(`Reset link dispatched in mock demo system to: ${email}`);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || "Reset request rejected by dispatch gateway.");
  }
};

