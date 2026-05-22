/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { getShipmentByTrackingId } from '../firebase';
import { Shipment, ShipmentStatus } from '../types';
import { 
  Search, Calendar, Anchor, MapPin, Scale, Box, Timer, Landmark, ShieldCheck, Ship, AlertTriangle, PlayCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const Tracking: React.FC = () => {
  const { trackingQueryId, setTrackingQueryId, showToast } = usePortal();
  const [inputId, setInputId] = useState(trackingQueryId);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInputId(trackingQueryId);
    if (trackingQueryId.trim()) {
      handleSearch(trackingQueryId);
    }
  }, [trackingQueryId]);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const queryId = inputId.trim().toUpperCase();
    if (!queryId) {
      showToast('Please type a valid consignment reference ID.', 'error');
      return;
    }
    setTrackingQueryId(queryId);
  };

  const handleSearch = async (tid: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await getShipmentByTrackingId(tid);
      setShipment(data);
      if (data) {
        showToast(`Consignment ${data.trackingId} successfully retrieved.`, 'success');
      } else {
        showToast(`Could not find shipment with reference ${tid}`, 'error');
      }
    } catch {
      showToast('Error connecting to cargo operations server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Colors Helper
  const getStatusBadge = (status: ShipmentStatus) => {
    const configs: Record<ShipmentStatus, { bg: string; text: string; dot: string }> = {
      'Pending': { bg: 'bg-slate-800 text-slate-400 border border-slate-700', text: 'text-slate-400', dot: 'bg-slate-500' },
      'Processing': { bg: 'bg-blue-950/45 text-blue-400 border border-blue-900/30', text: 'text-blue-400', dot: 'bg-blue-400' },
      'Departed Facility': { bg: 'bg-violet-950/45 text-violet-400 border border-violet-900/30', text: 'text-violet-400', dot: 'bg-violet-400' },
      'Arrived Facility': { bg: 'bg-sky-950/45 text-sky-400 border border-sky-900/30', text: 'text-sky-400', dot: 'bg-sky-400' },
      'Customs Clearance': { bg: 'bg-amber-950/45 text-amber-500 border border-amber-900/30', text: 'text-amber-500', dot: 'bg-amber-500' },
      'Border Check': { bg: 'bg-purple-950/45 text-purple-400 border border-purple-900/30', text: 'text-purple-400', dot: 'bg-purple-400' },
      'In Transit': { bg: 'bg-cyan-950/45 text-cyan-400 border border-cyan-900/30', text: 'text-cyan-400', dot: 'bg-cyan-400' },
      'Out for Delivery': { bg: 'bg-orange-950/45 text-orange-400 border border-orange-900/30', text: 'text-orange-400', dot: 'bg-orange-400' },
      'Delivered': { bg: 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
      'Held': { bg: 'bg-rose-950/45 text-rose-400 border border-rose-900/30', text: 'text-rose-400', dot: 'bg-rose-500' },
      'Delayed': { bg: 'bg-red-950/60 text-red-400 border border-red-900/40', text: 'text-red-400', dot: 'bg-red-500' }
    };
    const c = configs[status] || configs.Pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${c.bg}`}>
        <span className={`h-1.8 w-1.8 rounded-full ${c.dot} animate-pulse`} />
        <span>{status}</span>
      </span>
    );
  };

  const { setCurrentPage } = usePortal();

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Search Segment */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enterprise Cargo Tracking
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Ping the global maritime shipping & airway logistics registers. Instantly fetch active coordinates, customs clearance checkpoints, and transport histories.
          </p>

          <form onSubmit={handleSearchClick} className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex max-w-xl mx-auto shadow-2xl">
            <div className="flex-1 flex items-center px-3 gap-2.5 bg-slate-950/70 rounded-xl border border-slate-850">
              <Search className="h-5 w-5 text-[#ff3c00]" />
              <input
                type="text"
                placeholder="Enter Consignment Tracking ID..."
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                className="bg-transparent text-sm text-white w-full py-3 focus:outline-none placeholder-slate-600 font-mono focus:text-[#ff3c00]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#ff3c00] hover:bg-[#e03500] text-white px-5 rounded-xl font-bold text-sm transition-colors cursor-pointer ml-2"
            >
              Track
            </button>
          </form>
        </section>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-10 w-10 border-4 border-slate-850 border-t-[#ff3c00] rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-mono">RETRIEVING ENCRYPTED CARGO COGNATES...</p>
          </div>
        )}

        {/* Empty Search Prompt */}
        {!loading && !searched && (
          <div className="text-center py-16 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center space-y-3">
            <Anchor className="h-10 w-10 text-slate-600" />
            <p className="text-slate-400 text-sm">Please input a valid logistics routing ID or container reference to initialize telemetry scans.</p>
          </div>
        )}

        {/* Not Found Screen */}
        {!loading && searched && !shipment && (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center space-y-4 max-w-xl mx-auto">
            <AlertTriangle className="h-12 w-12 text-[#ff3c00]" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg font-sans">REFERENCE ID UNREGISTERED</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                No active cargo or parcel manifests are indexable under reference "{trackingQueryId}". Verify documentation for spelling errors or contact regional carrier dispatchers.
              </p>
            </div>
            <div className="pt-2">
              <button 
                onClick={() => setCurrentPage('contact')}
                className="bg-slate-950 border border-slate-850 text-white hover:border-slate-705 px-4.5 py-2.5 rounded-xl font-mono text-xs cursor-pointer"
              >
                CONTACT CARRIER HELPDESK
              </button>
            </div>
          </div>
        )}

        {/* Found: Shipment Informational Dashboard */}
        {!loading && searched && shipment && (
          <div className="space-y-8">
            
            {/* Upper Dashboard Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Corner Glowing Ambient Circle */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-orange-500/5 filter blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase">GLOBAL CARRIAGE MANIFEST</span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white font-mono">{shipment.trackingId}</h2>
                    {getStatusBadge(shipment.shipmentStatus)}
                  </div>
                </div>

                {/* Futurist Button for live telemetry Status Page */}
                <button
                  onClick={() => setCurrentPage('live-status')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 shadow animate-pulse cursor-pointer"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>LAUNCH LIVE RADAR</span>
                </button>
              </div>

              {/* Transit Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-450">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#ff3c00]" />
                    <span>ORIGIN: <strong className="text-white text-[11px] font-sans">{shipment.origin}</strong></span>
                  </span>
                  <span className="text-right text-[#ff3c00] font-bold">{shipment.progress}%</span>
                  <span className="flex items-center gap-1 justify-end">
                    <Landmark className="h-3.5 w-3.5 text-[#ff3c00]" />
                    <span>DEST: <strong className="text-white text-[11px] font-sans">{shipment.destination}</strong></span>
                  </span>
                </div>

                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-[#ff3c00] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${shipment.progress}%` }}
                  />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex items-center space-x-3">
                  <Scale className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-[#8a99ad] text-[10px] uppercase">GROSS WEIGHT</p>
                    <p className="text-white font-bold text-sm mt-0.5">{shipment.weight} KG</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex items-center space-x-3">
                  <Box className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-[#8a99ad] text-[10px] uppercase">CARRIAGE METHOD</p>
                    <p className="text-white font-bold text-xs mt-0.5 whitespace-nowrap">{shipment.shipmentType}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-[#8a99ad] text-[10px] uppercase">ESTIMATED ETA</p>
                    <p className="text-white font-bold text-xs mt-0.5">{shipment.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex items-center space-x-3">
                  <Timer className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-[#8a99ad] text-[10px] uppercase">LAST SENSOR UP</p>
                    <p className="text-[#ff3c00] font-bold text-[10px] mt-0.5">
                      {new Date(shipment.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sender/receiver panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs border-t border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-slate-500 uppercase font-mono block text-[10px]">CONSIGNOR (SENDER)</span>
                  <p className="text-white font-bold text-sm">{shipment.sender.name}</p>
                  <p className="text-slate-400 font-sans leading-relaxed">{shipment.sender.address}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-500 uppercase font-mono block text-[10px]">CONSIGNEE (RECIPIENT)</span>
                  <p className="text-white font-bold text-sm">{shipment.receiver.name}</p>
                  <p className="text-slate-400 font-sans leading-relaxed">{shipment.receiver.address}</p>
                </div>
              </div>

              {/* Carrier Note */}
              {shipment.carrierNote && (
                <div className="bg-[#ff3c00]/5 p-3.5 rounded-xl border border-[#ff3c00]/10 text-xs text-slate-350 leading-relaxed max-w-none">
                  <span className="font-bold text-white block mb-1">CONSIGNMENT DISPATCH NOTES:</span>
                  {shipment.carrierNote}
                </div>
              )}

            </div>

            {/* Split Section: Timeline & Route Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Chronological Vertical Timeline (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6.5 space-y-6 shadow-2xl">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">Chain of Custody Events</h3>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">Chronologically ordered tracking events checklist</p>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-800 space-y-8 py-2">
                  {shipment.shipmentTimeline.map((step, idx) => (
                    <div key={idx} className="relative space-y-1.5">
                      
                      {/* Timeline Bullet shape */}
                      <span className={`absolute -left-[30px] top-1.5 h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 ${
                        idx === 0 
                          ? 'bg-[#ff3c00] border-slate-900 shadow shadow-[#ff3c00]' 
                          : 'bg-slate-900 border-slate-750'
                      }`}>
                        {idx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                      </span>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="font-bold text-slate-300">{step.date}</span>
                        <span>•</span>
                        <span>{step.time}</span>
                        <span>•</span>
                        <span className="text-[#ff3c00] font-bold uppercase text-[10px]">{step.status}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-white font-sans">{step.location}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed font-sans">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit Map Mock Points Visual (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6.5 space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-sans">Transit Waypoints</h3>
                  <p className="text-slate-500 text-xs font-mono">Computed physical route checkpoints</p>
                </div>

                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 flex-1 my-4 flex flex-col justify-between py-6 space-y-8 font-mono">
                  {shipment.routeHistory.map((point, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-3 w-3 bg-cyan-400 rounded-full flex-shrink-0 animate-pulse border border-slate-900" />
                        <div>
                          <p className="text-white text-xs font-bold leading-none">{point.location}</p>
                          <p className="text-[10px] text-slate-500 mt-1">LAT {point.lat.toFixed(4)} | LNG {point.lng.toFixed(4)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {point.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#ff3c00]/5 p-3.5 rounded-xl border border-[#ff3c00]/10 text-[11px] text-slate-400 leading-relaxed font-mono flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>All waypoint milestones have TLS integrity handshakes.</span>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
