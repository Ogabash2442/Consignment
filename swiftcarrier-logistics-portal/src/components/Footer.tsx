/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { Page } from '../types';
import { 
  Ship, Mail, Phone, MapPin, Send, HelpCircle, Linkedin, Twitter, Facebook, ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, setTrackingQueryId, settings, showToast } = usePortal();
  const [quickTrackingId, setQuickTrackingId] = useState('');
  const [emailSub, setEmailSub] = useState('');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handleQuickTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackingId.trim()) return;
    setTrackingQueryId(quickTrackingId.trim().toUpperCase());
    setCurrentPage('tracking');
    setQuickTrackingId('');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub.trim() || !emailSub.includes('@')) {
      showToast('Please provide a valid corporate email.', 'error');
      return;
    }
    showToast(`Successfully subscribed ${emailSub} to Global Liner Newsletter!`, 'success');
    setEmailSub('');
  };

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment: Brand & Quick Search */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-900">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="bg-[#ff3c00] p-2 rounded">
                <Ship className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight uppercase">
                {settings.websiteName}
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              We operate an extensive modern global shipping network managing thousands of cargo planes, distribution trucks, and ocean containers. Securing Supply Chains with Pristine Tracking Intelligence.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="h-8 w-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#ff3c00] hover:border-[#ff3c00] transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#ff3c00] hover:border-[#ff3c00] transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#ff3c00] hover:border-[#ff3c00] transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-mono text-[#ff3c00]">
              Quick Console Tracking
            </h4>
            <p className="text-slate-400 text-xs">
              Directly ping our global operations server for active shipment locations.
            </p>
            <form onSubmit={handleQuickTrackingSearch} className="flex">
              <input
                type="text"
                placeholder="Enter Consignment ID..."
                value={quickTrackingId}
                onChange={(e) => setQuickTrackingId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-l p-2.5 text-sm text-white focus:outline-none focus:border-[#ff3c00] w-full placeholder-slate-600 font-mono"
              />
              <button
                type="submit"
                className="bg-[#ff3c00] hover:bg-[#ff3c00]/90 text-white px-4 rounded-r font-semibold text-sm transition-colors cursor-pointer"
              >
                Track
              </button>
            </form>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-mono">
              Newsletter Core
            </h4>
            <p className="text-slate-400 text-xs">
              Subscribe to standard trade tariff updates and carrier notifications.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="corporate@domain.com"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-l p-2.5 text-sm text-white focus:outline-none focus:border-[#ff3c00] w-full placeholder-slate-600"
              />
              <button
                type="submit"
                className="bg-slate-800 border-t border-r border-b border-slate-750 hover:bg-slate-700 hover:text-white text-slate-300 p-2.5 rounded-r transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Middle Segment: Structured Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-sm border-b border-slate-900">
          <div>
            <h5 className="text-white font-semibold mb-4 uppercase font-mono text-xs tracking-wider text-slate-300">
              Core Network
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-white transition-colors cursor-pointer">
                  Air Freight Logistics
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-white transition-colors cursor-pointer">
                  Ocean Container Cargo
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-white transition-colors cursor-pointer">
                  Roadway Trailer Transit
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-white transition-colors cursor-pointer">
                  Warehousing Solutions
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4 uppercase font-mono text-xs tracking-wider text-slate-300">
              Online Terminals
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => navigateTo('tracking')} className="hover:text-white transition-colors cursor-pointer">
                  Consignment Tracker
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('calculator')} className="hover:text-white transition-colors cursor-pointer">
                  Interactive Tariff Calculator
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors cursor-pointer">
                  Frequently Answered
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Support Center
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4 uppercase font-mono text-xs tracking-wider text-slate-300">
              Support Center
            </h5>
            <div className="text-slate-400 space-y-2 text-xs">
              <span className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#ff3c00] flex-shrink-0" />
                <span className="leading-relaxed">{settings.officeAddress}</span>
              </span>
              <span className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#ff3c00] flex-shrink-0" />
                <span>{settings.companyPhone}</span>
              </span>
              <span className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#ff3c00] flex-shrink-0" />
                <span>{settings.companyEmail}</span>
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4 uppercase font-mono text-xs tracking-wider text-slate-300">
              Regulatory Compliance
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Carriage (Lading)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Protection Code
                </button>
              </li>
              <li>
                <span className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 p-2 rounded mt-2 select-none">
                  <HelpCircle className="h-4 w-4 text-emerald-500" />
                  <span>{settings.supportHours}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Segment: Copyright & Tech */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[#8a99ad] text-xs font-mono">
          <p>© 2026 {settings.websiteName} Inc. All rights to global cargo transit reserved under international maritime code.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Settings
            </button>
            <span>•</span>
            <span className="text-emerald-500 font-semibold flex items-center space-x-0.5 select-none">
              <ExternalLink className="h-3 w-3" />
              <span>SSL SHA-256</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
