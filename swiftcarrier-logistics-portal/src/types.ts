export type ShipmentStatus = 'Pending' | 'Processed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception';

export interface ShipmentMilestone {
  id: string;
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  description: string;
  isCompleted: boolean;
}

export interface Shipment {
  trackingId: string;
  status: ShipmentStatus;
  origin: {
    city: string;
    country: string;
    sender: string;
    address: string;
  };
  destination: {
    city: string;
    country: string;
    receiver: string;
    address: string;
  };
  details: {
    weight: string;
    type: string; // e.g. Air Freight, Ocean Cargo, Express Courier
    dimensions: string;
    value: string;
    serviceLevel: string; // e.g. Express Saver, Priority Ground, Intercontinental Premium
    estimatedDelivery: string;
    shippingDate: string;
  };
  timeline: ShipmentMilestone[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface SupportChat {
  userId: string;
  userName: string;
  userEmail: string;
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'unread';
  lastUpdated: string;
  subject?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'info' | 'delay' | 'success';
  timestamp: string;
  active: boolean;
}

export interface BrandingSettings {
  siteName: string;
  websiteLogo: string;
  headerLogo: string;
  footerLogo: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  footerInformation: string;
  websiteBrandingDetails: string;
  heroBrandingText: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialInstagram: string;
}

