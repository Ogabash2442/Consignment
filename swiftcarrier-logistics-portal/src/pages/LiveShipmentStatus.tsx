/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../context/PortalContext';
import { getAllShipments } from '../firebase';
import { Shipment, ShipmentStatus } from '../types';
import { 
  Play, Pause, RefreshCw, Terminal, Globe, Navigation, Compass, AlertCircle, ShieldCheck
} from 'lucide-react';

export const LiveShipmentStatus: React.FC = () => {
  const { showToast, adminEmail } = usePortal();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch on load
  const fetchActiveShipments = async () => {
    setLoading(true);
    try {
      const data = await getAllShipments();
      setShipments(data);
      if (data && data.length > 0) {
        setSelectedShipment(data[0]);
        // Seeding initial terminal logs
        setTerminalLogs([
          `[${new Date().toLocaleTimeString()}] INGESTION: Global operations coordinates sync'd.`,
          `[${new Date().toLocaleTimeString()}] CRYPTO_GATE: TLS Integrity validation status: GREEN.`,
          `[${new Date().toLocaleTimeString()}] SENSOR_NET: 12,400 active transponders reporting packets.`
        ]);
      }
    } catch {
      showToast('Error syncing live telemetry registers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveShipments();
  }, []);

  // Set up ticker for console logging live simulation
  useEffect(() => {
    if (!isSimulating || !selectedShipment) return;

    const interval = setInterval(() => {
      const airlineCodes = ['LH', 'UA', 'QA', 'SQ', 'EK'];
      const actions = [
        `PING: Transponder registered coordinates at LAT ${selectedShipment.routeHistory[0]?.lat.toFixed(4) || '50.11'} | LNG ${selectedShipment.routeHistory[0]?.lng.toFixed(4) || '8.68'}`,
        `TELEMETRY: Volumetric index verified. Temperature envelope bounds stable.`,
        `ADMIN_AUDIT: Operations ledger checksum verified online.`,
        `CARGO_FLOW: Dispatched container routing index check. Speed offset: 0.00%`,
        `PORT_INGEST: Pre-clearance customs documents uploaded for border gates.`,
        `FLIGHT_COORD: Multi-transit airway flight corridor LH${Math.floor(Math.random()*9000+1000)} cleared.`
      ];

      const rAction = actions[Math.floor(Math.random() * actions.length)];
      setTerminalLogs((prev) => {
        const next = [...prev, `[${new Date().toLocaleTimeString()}] ${rAction}`];
        if (next.length > 30) next.shift(); // prune logs
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, selectedShipment]);

  // Handle log auto scrolling
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Color mappings
  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered': return 'text-emerald-400';
      case 'Held': return 'text-rose-450 text-rose-500';
      case 'Delayed': return 'text-red-500';
      case 'In Transit': return 'text-cyan-400';
      default: return 'text-orange-400';
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900">
          <div className="space-y-1">
            <span className="text-[#ff3c00] text-xs font-mono font-bold tracking-widest block uppercase">TACTICAL MULTIMODAL RADAR</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Live Shipment Status cockpit</h1>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-2.5 rounded-lg border flex items-center space-x-1.5 transition-all text-xs font-bold cursor-pointer ${
                isSimulating 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 animate-pulse' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isSimulating ? 'LIVE STREAM ACTIVE' : 'STREAM PAUSED'}</span>
            </button>

            <button
              onClick={fetchActiveShipments}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-705 rounded-lg text-slate-350 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Rescan</span>
            </button>
          </div>
        </section>

        {loading && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 border-4 border-slate-800 border-t-[#ff3c00] rounded-full animate-spin" />
            <p className="text-slate-500 text-xs font-mono">CONNECTING TO TRANSIT REGISTERS...</p>
          </div>
        )}

        {!loading && shipments.length === 0 && (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-[#ff3c00] mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No active shipments registered in your system. Navigate to the Admin Dashboard to initiate shipments.</p>
          </div>
        )}

        {!loading && shipments.length > 0 && selectedShipment && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Shipment Registry List (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-2xl overflow-y-auto max-h-[80vh]">
              <h3 className="text-slate-450 font-mono text-xs uppercase text-slate-400 border-b border-slate-800/80 pb-3 block">Carriage Registry</h3>
              
              <div className="space-y-2">
                {shipments.map((ship) => {
                  const isCurSelected = selectedShipment.trackingId === ship.trackingId;
                  return (
                    <div
                      key={ship.trackingId}
                      onClick={() => {
                        setSelectedShipment(ship);
                        setTerminalLogs((prev) => [
                          ...prev,
                          `[${new Date().toLocaleTimeString()}] INSPECTION: Selected consignment ${ship.trackingId}.`
                        ]);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isCurSelected 
                          ? 'bg-[#ff3c00]/15 border-[#ff3c00]' 
                          : 'bg-slate-950/60 border-slate-850 hover:bg-slate-950 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-white text-sm">{ship.trackingId}</span>
                        <span className={`font-mono text-[10px] font-bold uppercase ${getStatusColor(ship.shipmentStatus)}`}>
                          {ship.shipmentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-550 mt-1 font-sans text-slate-400 flex items-center justify-between">
                        <span>{ship.origin.split(' ')[0]} ➔ {ship.destination.split(' ')[0]}</span>
                        <span className="font-mono text-[10px] bg-slate-900 px-1 rounded text-slate-500 leading-none py-0.5">{ship.progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Console & Telemetry (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              
              {/* Telemetry Visual Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Active radar overlay */}
                <div className="absolute top-4 right-4 h-24 w-24 rounded-full border border-cyan-500/10 pointer-events-none md:flex items-center justify-center hidden">
                  <div className="h-16 w-16 rounded-full border border-cyan-555 border-cyan-500/20" />
                  <Compass className="h-6 w-6 text-cyan-500 absolute animate-pulse" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#ff3c00] font-mono tracking-widest block uppercase">TELEMETRY INGEST</span>
                    <h2 className="text-xl font-bold text-white font-mono">{selectedShipment.trackingId} Checkpoint Status</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-slate-500 text-[9px] block">ORIGIN GATEWAY</span>
                      <span className="text-white font-bold block mt-0.5 mt-1">{selectedShipment.origin.split(' ')[0]}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-slate-500 text-[9px] block">DESTINATION GATEWAY</span>
                      <span className="text-white font-bold block mt-0.5 mt-1">{selectedShipment.destination.split(' ')[0]}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-slate-500 text-[9px] block">SENSORY STATUS</span>
                      <span className={`font-bold block mt-0.5 mt-1 uppercase ${getStatusColor(selectedShipment.shipmentStatus)}`}>
                        {selectedShipment.shipmentStatus}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-slate-500 text-[9px] block">COORDINATE SCAN</span>
                      <span className="text-cyan-400 font-bold block mt-0.5 mt-1">
                        {selectedShipment.routeHistory[0]?.lat.toFixed(2) || '48.10'} N / {selectedShipment.routeHistory[0]?.lng.toFixed(2) || '11.50'} E
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Radar Progress Area */}
                <div className="bg-slate-950 rounded-xl p-4.5 border border-slate-850 font-mono text-xs text-slate-400 leading-relaxed relative my-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Transit Telemetry Report</span>
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-[#ff3c00] animate-bounce" />
                    <span>Active carriage: <strong className="text-white font-sans">{selectedShipment.shipmentType}</strong>. Current tracking percentage is at <strong className="text-cyan-400">{selectedShipment.progress}%</strong>. Safe delivery estimation set to <strong className="text-white">{selectedShipment.estimatedDelivery}</strong>.</span>
                  </div>
                </div>

              </div>

              {/* Scrolling Terminal Console Ingest (futuristic masterpiece) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-2xl flex flex-col h-48 justify-between relative overflow-hidden">
                <div className="absolute top-3.5 right-4 flex items-center space-x-1 font-mono text-[9px] text-[#ff3c00] bg-slate-950 p-1 rounded border border-slate-850 select-none">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>STD_ERR/STD_LOG COGNATES</span>
                </div>
                
                {/* Scrolling text area */}
                <div className="flex-1 overflow-y-auto space-y-1 text-[11px] font-mono p-3 bg-slate-950/80 rounded-lg border border-slate-850 h-32 scrollbar-none scroll-smooth">
                  {terminalLogs.map((log, idx) => (
                    <p key={idx} className="text-emerald-500 leading-relaxed font-semibold">
                      <span className="text-slate-600 mr-1 opacity-70">➔</span> {log}
                    </p>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
