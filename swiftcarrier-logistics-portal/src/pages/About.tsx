/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import { 
  Building, Target, ShieldCheck, Milestone, Users, Anchor, ChevronRight, BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { SafeImage } from '../components/SafeImage';

export const About: React.FC = () => {
  const { setCurrentPage } = usePortal();

  const values = [
    {
      title: 'Safety Invariance',
      desc: 'We operate under structural safety rules. Whether handling complex bio-containments or bulky engine parts, your cargo is locked in security guards.',
      icon: ShieldCheck
    },
    {
      title: 'Targeted Velocity',
      desc: 'We map optimal maritime and air channels to trim transit and clearance times by multi-hours. Zero compromise on accuracy.',
      icon: Target
    },
    {
      title: 'Pristine Transparency',
      desc: 'Providing real-time telemetry coordinates, climate sensors, and explicit administrative logs so clients are never left with opaque statuses.',
      icon: BarChart3
    }
  ];

  const milestones = [
    { year: '2012', title: 'Carriage Foundations', desc: 'Acquired 12 medium cargo planes in Dallas, serving localized freight channels.' },
    { year: '2016', title: 'Transatlantic Expand', desc: 'Established Frankfurt and Heathrow airway gateways. Expanded fleet to sea cargo carriers.' },
    { year: '2020', title: 'Digital Telemetry Ingest', desc: 'Launched the central web portal with active GPS and temperature cargo sensors.' },
    { year: '2026', title: 'Autonomous Fleet Trials', desc: 'Initiating self-routing cargo vessels to further suppress carbon emissions and ocean fuel waste.' }
  ];

  const team = [
    { name: 'Klaus Fischer', role: 'Chief Executive Officer', origin: 'Hamburg Office' },
    { name: 'Nathalie DuPont', role: 'Director of Oceanic Operations', origin: 'Marseille Port Office' },
    { name: 'Sarah Jenkins', role: 'Head of Regulatory Customs', origin: 'New York JFK Hub' }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Editorial Title Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[#ff3c00] text-xs font-mono font-semibold tracking-widest uppercase">
            ESTABLISHED IN 2012
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
            Corporate Integrity. <br />
            <span className="text-[#ff3c00]">Global Distribution.</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            SwiftCarrier Global manages major intercontinental cargo lanes with absolute physical security and precise digital transparency. For 14 years, we have escorted supply lines across unforeseen conditions.
          </p>
        </section>

        {/* Storytelling Splitted Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-emerald-500 font-mono text-xs uppercase font-extrabold">
              OUR MISSION & PURPOSE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bridging continents through secure logistics engineering
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We do not simply pick up and drop off crates. We engineer safe delivery procedures. We analyze sea swell patterns, airspace densities, and border congestion times so each consignment remains on its computed speed track.
            </p>
            <p className="text-[#ff3c00] text-sm font-semibold italic border-l-2 border-[#ff3c00] pl-3">
              "We measure operational success not by the volumes handled, but by the on-time fulfillment down to the minute."
            </p>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setCurrentPage('services')}
                className="bg-[#ff3c00] hover:bg-[#e03500] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Carriage Fleets</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group aspect-[21/9] sm:aspect-video">
              <SafeImage 
                src="/src/assets/images/warehouse_operations_1779474916748.png" 
                alt="SwiftCarrier High-Tech Smart Warehouse Center"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                fallbackType="warehouse"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono font-bold text-slate-300">CENTRAL HUB #9 • INTELLIGENT ROUTING DEPOT</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl grid grid-cols-2 gap-6 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#ff3c00]/5 filter blur-2xl" />
            
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
              <Building className="h-6 w-6 text-[#ff3c00] mb-2" />
              <p className="text-2xl font-bold text-white font-mono">180+</p>
              <p className="text-slate-400 text-xs">Direct Logistics Depots</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
              <Anchor className="h-6 w-6 text-cyan-500 mb-2" />
              <p className="text-2xl font-bold text-white font-mono">2,400</p>
              <p className="text-slate-400 text-xs">Port Dispatch Agents</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
              <Users className="h-6 w-6 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-white font-mono">9,800</p>
              <p className="text-slate-400 text-xs">FTE Transport Operators</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
              <Milestone className="h-6 w-6 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-white font-mono">100%</p>
              <p className="text-slate-400 text-xs">Carriers Insured Policy</p>
            </div>
          </div>
          </div>
        </section>

        {/* Corporate Core Values */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Values We Command Daily
            </h3>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Our code of operation prevents systemic errors and prioritizes cargo safety above all else.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative hover:border-slate-700 transition-all">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#ff3c00]/10 border border-[#ff3c00]/30 text-[#ff3c00] mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{v.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Historical Roadmap Chronology */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#ff3c00] font-mono text-xs font-bold uppercase">THE TIMELINE</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">How We Scaled Our Footprint</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-slate-800 z-0" />
            {milestones.map((milestone, idx) => (
              <div key={idx} className="bg-slate-900/40 p-6 rounded-xl border border-slate-850 text-center space-y-3 relative z-10 hover:border-slate-700 transition-colors">
                <span className="inline-block bg-[#ff3c00] text-slate-950 font-bold font-mono text-xs px-3 py-1 rounded-full shadow">
                  {milestone.year}
                </span>
                <h5 className="font-bold text-white text-base">{milestone.title}</h5>
                <p className="text-slate-400 text-xs leading-relaxed">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Showcase */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[#ff3c00] font-mono text-xs uppercase font-extrabold">EXECUTIVE BOARD</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Our Leadership Bench</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:border-slate-700 transition-colors">
                <div className="h-16 w-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-lg text-slate-400 shadow-inner font-mono">
                  {t.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h5 className="font-bold text-white text-base font-sans">{t.name}</h5>
                  <p className="text-[#ff3c00] text-xs font-mono">{t.role}</p>
                  <p className="text-slate-500 text-[10px] uppercase font-mono mt-2 tracking-widest">{t.origin}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
