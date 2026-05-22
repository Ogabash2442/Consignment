/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { submitContactMessage } from '../firebase';
import { 
  Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck, HeartHandshake, Globe
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast, setCurrentPage } = usePortal();
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Consignment Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name,
        email,
        subject,
        message
      });
      showToast('Inquiry logged successfully. Our dispatcher will email you in 2 hours!', 'success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      showToast('Failed to log contact inquiry in database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const supportCards = [
    { title: 'Global Carrier Desk', details: settings.companyPhone, label: 'TELEPHONE REACH', icon: Phone },
    { title: 'Operations Email', details: settings.companyEmail, label: 'CORRESPONDENCE', icon: Mail },
    { title: 'Corporate Headquarters', details: settings.officeAddress, label: 'HEAD OFFICE LOCATION', icon: MapPin }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Title */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#ff3c00] text-xs font-mono font-bold tracking-widest uppercase">
            CARRIER CONSOLE ESCALATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Logistics Operations
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Need urgent route diversions, bulk cargo pricing, or legal transit documentation? Open an administrative support ticket below.
          </p>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all font-mono">
                <div className="space-y-3">
                  <div className="h-9 w-9 rounded bg-slate-950 border border-slate-850 flex items-center justify-center text-[#ff3c00]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-white text-sm font-sans font-bold">{card.title}</h4>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{card.details}</p>
                </div>
                <span className="text-[9px] text-slate-500 font-extrabold block mt-4 uppercase">
                  {card.label}
                </span>
              </div>
            );
          })}
        </section>

        {/* Bottom Split: Input Form and Map representation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Inquiry form (7 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6.5 shadow-2xl space-y-5">
            
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <Mail className="h-5 w-5 text-[#ff3c00]" />
              <h3 className="font-bold text-white text-base">Administrative Support Ticket</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full name */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <label className="font-semibold block font-mono">YOUR FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-sans text-xs focus:border-[#ff3c00] focus:outline-none placeholder-slate-700"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <label className="font-semibold block font-mono">CORPORATE EMAIL *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. corporate@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-sans text-xs focus:border-[#ff3c00] focus:outline-none placeholder-slate-700"
                />
              </div>

            </div>

            {/* Subject Select */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <label className="font-semibold block font-mono">TOPIC CATEGORY</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-sans text-xs focus:border-[#ff3c00] focus:outline-none"
              >
                <option value="General Consignment Inquiry">General Consignment Inquiry</option>
                <option value="Volumetric Pricing & Bulk Sourcing">Volumetric Pricing & Bulk Cargo Sourcing</option>
                <option value="Border clearance delay escalation">Border Quarantine Clearance delay escalation</option>
                <option value="Technical Admin Panel support">Technical Portal support / Feedback</option>
              </select>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <label className="font-semibold block font-mono">EXPLANATORY STATEMENT *</label>
              <textarea
                required
                rows={5}
                placeholder="Elaborate details of routing references, containers, weights, dimensions, or specific tariff questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-sans text-xs focus:border-[#ff3c00] focus:outline-none placeholder-slate-700 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ff3c00] hover:bg-[#e03500] disabled:bg-[#ff3c00]/60 text-white font-bold py-3.5 rounded-xl text-center text-sm shadow-xl shadow-[#ff3c00]/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Submit Ticket</span>
              <Send className="h-4 w-4" />
            </button>

          </form>

          {/* Graphical Map (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-orange-500/5 filter blur-3xl pointer-events-none" />

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase">TACTICAL DISPATCH RADAR</span>
                <h3 className="font-bold text-white text-base">Office Terminal Centers</h3>
              </div>

              {/* Radar Graphical Coordinate Interface */}
              <div className="h-44 bg-slate-950 border border-slate-850 rounded-xl my-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#ff3c00]/4 rounded-full border border-[#ff3c00]/10 h-32 w-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                <div className="absolute inset-0 bg-slate-950/40 w-full h-full flex flex-col justify-center items-center text-[10px] font-mono text-slate-500 p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <Globe className="h-3.5 w-3.5 text-[#ff3c00]" />
                      <span>GATEWAY LHR-FRANKFURT</span>
                    </span>
                    <span>ONLINE SHIELD</span>
                  </div>
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <span className="flex items-center gap-1.5">
                      <HeartHandshake className="h-3.5 w-3.5 text-[#ff3c00]" />
                      <span>GATEWAY JFK-NEWYORK</span>
                    </span>
                    <span>STANDBY</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-805">
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <ShieldCheck className="h-4 w-4 text-[#ff3c00]" />
                  <span>Verified ISO 9001 Logistics Carrier</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <HelpCircle className="h-4 w-4 text-[#ff3c00]" />
                  <span>24/7 Security Escort Hotline active</span>
                </div>
              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
};
