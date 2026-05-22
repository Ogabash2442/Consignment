/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { Page } from '../types';
import { 
  Menu, X, Ship, Clock, Globe, ArrowRight, ShieldAlert, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { currentPage, setCurrentPage, adminEmail, settings } = usePortal();
  const [isOpen, setIsOpen] = useState(false);
  const [utcTime, setUtcTime] = useState<string>('');

  // Update real-time global clock in UTC
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const stringTime = now.getUTCHours().toString().padStart(2, '0') + ':' + 
                         now.getUTCMinutes().toString().padStart(2, '0') + ':' + 
                         now.getUTCSeconds().toString().padStart(2, '0') + ' UTC';
      setUtcTime(stringTime);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks: { name: string; page: Page }[] = [
    { name: 'Home', page: 'home' },
    { name: 'Services', page: 'services' },
    { name: 'Tracking', page: 'tracking' },
    { name: 'Cost Estimator', page: 'calculator' },
    { name: 'FAQ', page: 'faq' },
    { name: 'About Us', page: 'about' },
    { name: 'Contact', page: 'contact' },
  ];

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/90 border-b border-slate-800/85 backdrop-blur-md text-white">
      {/* Top Utility Bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs font-mono flex flex-wrap justify-between items-center text-slate-400 border-b border-slate-900">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-[#ff3c00] animate-pulse">
            <span className="h-2 w-2 rounded-full bg-[#ff3c00] mr-1.5" />
            GLOBAL HUB SYSTEM ONLINE
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            Transit Operations Ingest: Active
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-slate-300 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{utcTime}</span>
          </div>
          {adminEmail && (
            <span className="text-amber-500 font-semibold hidden sm:flex items-center gap-1 text-[11px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30">
              <ShieldAlert className="h-3 w-3" />
              Admin: {adminEmail}
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Corporate Brand Identity */}
          <div className="flex items-center cursor-pointer space-x-2" onClick={() => handleNavigate('home')}>
            <div className="bg-gradient-to-tr from-[#ff3c00] to-orange-500 p-2 rounded-lg shadow-lg">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-lg tracking-tight text-white leading-none">
                {settings.websiteName.split(' ')[0]}
                <span className="text-[#ff3c00] font-medium font-mono text-sm uppercase block tracking-widest mt-0.5 font-sans">
                  {settings.websiteName.split(' ')[1] || 'Global'}
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex space-x-1 items-center">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNavigate(link.page)}
                className={`px-3.5 py-2 rounded-md font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentPage === link.page
                    ? 'text-white bg-slate-800/80 border border-slate-700/50 shadow-sm shadow-[#ff3c00]/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40 hover:border hover:border-transparent'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Call-to-action button */}
          <div className="hidden lg:flex items-center space-x-4">
            {adminEmail ? (
              <button
                onClick={() => handleNavigate('admin')}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold px-4.5 py-1.8 rounded-full shadow-lg transition-all duration-180 flex items-center space-x-1 border border-amber-400 cursor-pointer"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="bg-[#ff3c00] hover:bg-[#e03500] text-white text-xs font-semibold px-5  py-2 rounded-full shadow-md shadow-[#ff3c00]/25 transition-all duration-200 flex items-center space-x-1 transform hover:translate-x-0.5 cursor-pointer"
              >
                <span>Login Access</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-850 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-800 bg-slate-900"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavigate(link.page)}
                  className={`w-full text-left block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    currentPage === link.page
                      ? 'text-white bg-[#ff3c00]/15 border-l-4 border-[#ff3c00]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-800 px-3">
                {adminEmail ? (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-600 text-[#0c1424] font-bold py-2.5 px-4 rounded-xl shadow-lg"
                  >
                    <Laptop className="h-5 w-5" />
                    <span>Go to Admin Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate('login')}
                    className="w-full flex items-center justify-center space-x-2 bg-[#ff3c00] text-white font-bold py-2.5 px-4 rounded-xl shadow-lg"
                  >
                    <span>Login Access</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
