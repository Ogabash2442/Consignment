/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import { 
  Plane, Ship, Truck, Package, Warehouse, Landmark, RotateCcw, FlameKindling, ShieldAlert, ArrowRight, Calculator
} from 'lucide-react';
import { motion } from 'motion/react';

export const Services: React.FC = () => {
  const { setCurrentPage } = usePortal();

  const services = [
    {
      id: 'air',
      title: 'Air Freight Cargo',
      desc: 'Expedited airport-to-airport freight shipping using leading cargo flights. Features optimized flight tracking, temperature sensors, and rapid priority dispatch gates.',
      icon: Plane,
      metrics: { speed: '1-3 Business Days', capacity: 'Up to 50 Tons / pallet', routes: 'Global Airport Gates' }
    },
    {
      id: 'sea',
      title: 'Ocean Container Freight',
      desc: 'Full Container Load (FCL) and Less than Container Load (LCL) consolidation services across major transboundary maritime channels. Managed via primary safe shipping liners.',
      icon: Ship,
      metrics: { speed: '12-25 Business Days', capacity: 'Unbounded container tons', routes: 'All Deepwater Harbors' }
    },
    {
      id: 'road',
      title: 'Heavy Roadways Trucking',
      desc: 'Domestic and cross-border long-haul trailer distribution. Fleets equipped with air-ride stabilizers, secondary shock-guards, and active GPS telemetry.',
      icon: Truck,
      metrics: { speed: '2-5 Business Days', capacity: 'Up to 24 Tons / trailer', routes: 'Continental Road Nets' }
    },
    {
      id: 'express',
      title: 'Expedited Express Delivery',
      desc: 'Overnight and time-definite courier hand-off under lock and security guard seal. Ideal for critical scientific parts, priority legal papers, or premium tech samples.',
      icon: FlameKindling,
      metrics: { speed: 'Next-Day Priority', capacity: 'Up to 25 KG / parcel', routes: 'Global City Hubs' }
    },
    {
      id: 'warehouse',
      title: 'Climate Warehousing',
      desc: 'Safe, temperature-regulated inventory depots. Features absolute backup cooling engines, remote climate alerts, real-time stock scanning terminals.',
      icon: Warehouse,
      metrics: { speed: 'Immediate Ingest', capacity: '1.2M Sq. Feet available', routes: 'Located near major hubs' }
    },
    {
      id: 'customs',
      title: 'Customs Regulatory Brokerage',
      desc: 'Filing, tax calculations, HTS codes matching, quarantine clearance documents. Pre-clearance structures trim border terminal stay time to a minimum.',
      icon: Landmark,
      metrics: { speed: 'Same-day filing', capacity: 'Unified legal compliance', routes: 'All primary border ports' }
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#ff3c00] text-xs font-mono font-bold tracking-widest uppercase">
            CARRIAGE DISCIPLINES
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
            Multimodal Shipping Solutions
          </h1>
          <p className="text-slate-400 text-sm">
            We provide deepware logistics and heavy-duty cargo transportation under rigorous operations control. Search details of each transit category.
          </p>
        </div>

        {/* Services Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 border border-slate-850 text-[#ff3c00] group-hover:bg-[#ff3c00] group-hover:text-white transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#ff3c00] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {/* Sub-metrics Dashboard */}
                <div className="pt-6 mt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 uppercase block">TRANSIT SPEED</span>
                    <span className="text-white font-bold block mt-0.5">{s.metrics.speed}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">NET CAPACITY</span>
                    <span className="text-white font-bold block mt-0.5">{s.metrics.capacity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">CHANNELS</span>
                    <span className="text-white font-bold block mt-0.5">{s.metrics.routes}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </section>

        {/* Informational Callout */}
        <section className="bg-slate-900 border border-slate-820 rounded-3xl p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/5 filter blur-3xl" />
          
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 border border-cyan-850 rounded-full text-xs font-mono text-cyan-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              100% CARRIAGE VALUE INSURED POLICY
            </span>
            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Need custom weight freight logistics or cold-chain solutions?
            </h4>
            <p className="text-slate-400 text-xs">
              Our engineering team designs bespoke shipping paths for pharmaceutical payloads, military parts packing, and sensitive microprocessing chips. Reach our operations desk 24 hours a day.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentPage('calculator')}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calculator className="h-4 w-4 text-[#ff3c00]" />
              <span>Cost Calculator</span>
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="bg-[#ff3c00] hover:bg-[#e03500] text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff3c00]/20"
            >
              <span>Contact Dispatcher</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
