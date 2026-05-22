/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, BookOpen, Scale } from 'lucide-react';

export const TermsPrivacy: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Title */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#ff3c00] text-xs font-mono font-bold tracking-widest uppercase">
            REGULATORY COMPLIANCE LEDGERS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Carriage & Privacy
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Regulatory conditions of lading, cargo storage protection guidelines, and client security standards.
          </p>
        </section>

        {/* Legal block */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 md:p-8 space-y-8 shadow-2xl divide-y divide-slate-805">
          
          {/* Section 1 */}
          <div className="space-y-4 pb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans uppercase text-[#ff3c00] tracking-wider text-xs font-mono">
              <Scale className="h-4.5 w-4.5 text-[#ff3c00]" />
              <span>1. Waybill & Bill of Lading (Contract of Carriage)</span>
            </h3>
            <p className="text-slate-450 text-slate-400 text-xs sm:text-sm leading-relaxed">
              By submitting a consignment layout or booking transport in our portal, you agree that your package/cargo is governed under standard maritime codes and civil aviation guidelines. Limits of liability for damage, delay, or total cargo loss are capped in standard alignment with Warsaw/Montreal conventions, unless high-value coverage supplements are registered at time of purchase.
            </p>
            <p className="text-slate-450 text-slate-400 text-xs sm:text-sm leading-relaxed">
              Cargo owners are solely liable for completing precise custom declarations, certifying non-hazardous materials, and paying required regional landing tariffs and local cross-border quarantines.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4 py-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans uppercase text-[#ff3c00] tracking-wider text-xs font-mono">
              <BookOpen className="h-4.5 w-4.5 text-[#ff3c00]" />
              <span>2. Client Information Protection (Data Privacy)</span>
            </h3>
            <p className="text-slate-450 text-slate-400 text-xs sm:text-sm leading-relaxed">
              In adherence to regional privacy frameworks (including GDPR, HIPAA, and CCPA), all sender/recipient addresses, emails, customs invoices, and physical telephone parameters are isolated on encrypted Firestore partitions.
            </p>
            <p className="text-slate-450 text-slate-400 text-xs sm:text-sm leading-relaxed">
              We never dispense customer profiles, logistics histories, or package parameters to third-party marketing companies. Coordinates of GPS transponders and tracking logs are purged from the live register tables 45 days post-delivery validation.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans uppercase text-[#ff3c00] tracking-wider text-xs font-mono">
              <ShieldAlert className="h-4.5 w-4.5 text-[#ff3c00]" />
              <span>3. Prohibited Goods & Quarantine Restrictions</span>
            </h3>
            <p className="text-slate-455 text-slate-400 text-xs sm:text-sm leading-relaxed">
              SwiftCarrier strictly bans transport of unstable bio-ingredients, unlicensed armaments, or dangerous heavy explosives unless escorted under military authorization sheets. Our airport sorting hub scanning arrays will tag and hold violate consignments instantly, routing logs to state customs agencies.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
};
