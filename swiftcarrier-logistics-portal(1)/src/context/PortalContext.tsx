/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Page, PortalSettings } from '../types';
import { getPortalSettings } from '../firebase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PortalContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  trackingQueryId: string;
  setTrackingQueryId: (id: string) => void;
  adminEmail: string | null;
  setAdminEmail: (email: string | null) => void;
  settings: PortalSettings;
  setSettings: (settings: PortalSettings) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const DEFAULT_SETTINGS: PortalSettings = {
  websiteName: 'SwiftCarrier Global',
  companyEmail: 'support@swiftcarrier-global.com',
  companyPhone: '+1 (800) 555-SWIFT',
  officeAddress: '100 Gateway Boulevard, Dallas, TX 75201, USA',
  supportHours: '24/7 Global Client Operations Support'
};

export const PortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<Page>('home');
  const [trackingQueryId, setTrackingQueryId] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    // Check if session remains logged in locally
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sc_admin_email');
    }
    return null;
  });
  const [settings, setSettings] = useState<PortalSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Wrap setCurrentPage to handle scroll reset
  const setCurrentPage = (page: Page) => {
    setCurrentPageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch Portal branding info on boot
    const fetchSettings = async () => {
      try {
        const data = await getPortalSettings();
        setSettings(data);
      } catch (err) {
        console.error("Using default portal configuration settings.");
      }
    };
    fetchSettings();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setAdminSession = (email: string | null) => {
    setAdminEmail(email);
    if (email) {
      localStorage.setItem('sc_admin_email', email);
    } else {
      localStorage.removeItem('sc_admin_email');
    }
  };

  return (
    <PortalContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        trackingQueryId,
        setTrackingQueryId,
        adminEmail,
        setAdminEmail: setAdminSession,
        settings,
        setSettings,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
