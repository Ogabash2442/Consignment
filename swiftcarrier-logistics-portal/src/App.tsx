/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveChatWidget } from './components/LiveChatWidget';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Tracking } from './pages/Tracking';
import { CalculatorPage } from './pages/Calculator';
import { ContactPage } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { TermsPrivacy } from './pages/TermsPrivacy';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { LiveShipmentStatus } from './pages/LiveShipmentStatus';
import { ShieldCheck, CalendarRange, Info, AlertTriangle, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPage, toastMessage, toastType, hideToast } = usePortal();

  // Scroll to top on page switches
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  // Global Notification Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Switch between page identifiers
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'services':
        return <Services />;
      case 'tracking':
        return <Tracking />;
      case 'calculator':
        return <CalculatorPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQ />;
      case 'terms':
        return <TermsPrivacy />;
      case 'login':
        return <AdminLogin />;
      case 'admin':
        return <AdminDashboard />;
      case 'live-status':
        return <LiveShipmentStatus />;
      default:
        return <Home />;
    }
  };

  const isCockpit = currentPage === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-[#ff3c00] selection:text-white">
      
      {/* Show navigation except when in the dedicated Admin Dashboard view */}
      {!isCockpit && <Navbar />}

      {/* Primary Page Switch Workspace */}
      <div className="flex-grow">
        {renderPage()}
      </div>

      {/* Show common Footer unless in the dedicated Admin Dashboard view */}
      {!isCockpit && <Footer />}

      {/* FLOATING REAL-TIME CUSTOMER LIVE SUPPORT WIDGET */}
      {!isCockpit && <LiveChatWidget />}

      {/* CUSTOM ENTERPRISE NOTIFICATION TOAST OVERLAY */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-550 max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in-right">
          
          <div className="flex-shrink-0 mt-0.5">
            {toastType === 'success' && <ShieldCheck className="h-5 w-5 text-emerald-450 text-emerald-500" />}
            {toastType === 'error' && <AlertTriangle className="h-5 w-5 text-rose-500" />}
            {toastType === 'info' && <Info className="h-5 w-5 text-cyan-400" />}
          </div>

          <div className="flex-grow space-y-1">
            <p className="font-mono text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">
              {toastType === 'success' ? 'SYSTEM SECURE' : toastType === 'error' ? 'ALERT PROTOCOL' : 'LEDGER NOTIFY'}
            </p>
            <p className="text-slate-200 text-xs leading-relaxed font-sans">{toastMessage}</p>
          </div>

          <button 
            onClick={hideToast}
            className="text-slate-500 hover:text-white flex-shrink-0 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <PortalProvider>
      <AppContent />
    </PortalProvider>
  );
}
