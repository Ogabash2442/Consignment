/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ShipmentStatus =
  | 'Pending'
  | 'Processing'
  | 'Departed Facility'
  | 'Arrived Facility'
  | 'Customs Clearance'
  | 'Border Check'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Held'
  | 'Delayed';

export type ShipmentType = 'Air Freight' | 'Sea Freight' | 'Road Freight' | 'Express Delivery' | 'Cargo Delivery';

export interface TimelineEvent {
  id?: string;
  date: string;
  time: string;
  location: string;
  status: ShipmentStatus;
  description: string;
}

export interface RoutePoint {
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: ShipmentStatus;
}

export interface PersonContact {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Shipment {
  id: string; // The Firestore document ID is also stored as trackingId
  trackingId: string;
  sender: PersonContact;
  receiver: PersonContact;
  origin: string;
  destination: string;
  currentLocation: string;
  weight: number; // in KG
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shipmentType: ShipmentType;
  shipmentStatus: ShipmentStatus;
  estimatedDelivery: string; // Date string (YYYY-MM-DD)
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  shipmentTimeline: TimelineEvent[];
  shipmentImages: string[];
  routeHistory: RoutePoint[];
  progress: number; // 0 to 100
  shippingCost?: number;
  carrierNote?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  action: string;
  trackingId?: string;
  details: string;
  adminEmail: string;
}

export interface PortalSettings {
  websiteName: string;
  companyEmail: string;
  companyPhone: string;
  officeAddress: string;
  supportHours: string;
}

export type Page =
  | 'home'
  | 'about'
  | 'services'
  | 'tracking'
  | 'calculator'
  | 'contact'
  | 'faq'
  | 'login'
  | 'admin'
  | 'terms'
  | 'live-status';

export interface ChatMessage {
  sender: 'user' | 'admin';
  message: string;
  timestamp: string; // ISO string
  readStatus: 'unread' | 'read';
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
}

export interface Chat {
  chatId: string;
  userName: string;
  userEmail: string;
  messages: ChatMessage[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: 'open' | 'closed' | 'resolved' | 'archived';
  unreadCount: number;
  lastMessage: string;
  adminAssigned: string | null;
  userTyping?: boolean;
  adminTyping?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: string;
  isBlocked?: boolean;
}

export interface SupportSession {
  sessionId: string;
  chatId: string;
  userId: string;
  userName: string;
  userEmail: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'closed';
  duration?: number; // in seconds
}

