/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { usePortal } from '../context/PortalContext';

export const FAQ: React.FC = () => {
  const { setCurrentPage } = usePortal();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How is Volumetric (Dimensional) weight computed?',
      a: 'Volumetric weight is calculated using the physical package dimensions length, width, and height. To determine this, follow the trade-standard formula: (Length x Width x Height in cm) / 5000. Under IATA rules, our transport ledger bills the higher value of either the real weight or the Volumetric Weight to balance space and lift parameters in flights/containers.'
    },
    {
      q: 'What triggers custom checks, and how does the portal guide release?',
      a: 'Custom clearances are governed by bilateral tariff agreements and trade declarations. If a package is marked as "Held" or "Customs Clearance," it implies custom authorities are inspecting documentation, certificates, or applying duties. Our Brokerage team files digital paperwork same-day. If documents are missing, dispatchers email the consignor/consignee immediately with guidelines to speed up release.'
    },
    {
      q: 'Can a shipment be tracked in real-time on all transit modes?',
      a: 'Yes. Every shipment is labeled with a digital transponder barcoding index and (for high-value cargoes) an active telemetry sensor. Sensor logs stream GPS coordinates, environmental temperature readings, and shock stats directly to our live terminal boards, allowing users to track progress percentages visually.'
    },
    {
      q: 'What does "On-Time Precision" guarantee include?',
      a: 'Our operations prioritize an optimal routing path. In the rare event of major natural disasters, roadway closures, or aircraft issues, we instantly trigger automated backup plans, routing cargo onto alternate flights or trailers to minimize transit deviations as much as possible.'
    },
    {
      q: 'Does SwiftCarrier insure high-value cargos?',
      a: 'Absolutely. All multimodal transportation operates under uniform carrier liability codes. High-value parcels, pharmaceutical reagents, and expensive electronics can be supplemented with tailored cargo value safety guarantees up to $500,000 to suppress liability risks.'
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header */}
        <section className="text-center space-y-3">
          <span className="text-[#ff3c00] text-xs font-mono font-bold tracking-widest uppercase">
            REGULATORY & OPERATIONS FAQ
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Answered Concerns
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Read details about global dimensions formulas, customs protocols, insurance coverage, and live telemetry integrations.
          </p>
        </section>

        {/* Collapsible Accordions List */}
        <section className="bg-slate-905 bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6.5 shadow-2xl divide-y divide-slate-800">
          {faqs.map((f, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-white hover:text-[#ff3c00] py-2 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base flex items-start gap-2.5">
                    <HelpCircle className="h-5 w-5 text-[#ff3c00] mt-0.5 flex-shrink-0" />
                    <span>{f.q}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#ff3c00]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="pl-7 pb-2 pt-1 text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Help Out Box */}
        <section className="bg-[#ff3c00]/5 p-6 rounded-2xl border border-[#ff3c00]/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-white text-base">Still searching for custom freight quotes?</h4>
            <p className="text-slate-400 text-xs">Reach out to our operations room instantly for deep container arrangements.</p>
          </div>
          <button
            onClick={() => setCurrentPage('contact')}
            className="bg-[#ff3c00] hover:bg-[#e03500] text-white text-xs font-bold px-4.5 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Open Ticket</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

      </div>
    </div>
  );
};
