import React, { useState, useEffect, useRef } from 'react';
import { useLogistics } from '../LogisticsContext';
import { Shipment, ShipmentStatus } from '../types';
import { 
  Search, Shield, MapPin, Printer, Download, Sparkles, Navigation, CheckCircle, 
  Clock, AlertCircle, Droplets, Thermometer, Lock, Scale, User, Calendar, QrCode, FileCheck 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface TrackingSystemProps {
  searchedId?: string;
  onClearSearch?: () => void;
}

export const TrackingSystem: React.FC<TrackingSystemProps> = ({ searchedId = '', onClearSearch }) => {
  const { getShipment, shipments, branding } = useLogistics();
  const [query, setQuery] = useState(searchedId);
  const [currentShipment, setCurrentShipment] = useState<Shipment | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [printFocused, setPrintFocused] = useState(false);

  // IoT Sensor simulation fluctuation
  const [sensorStatus, setSensorStatus] = useState({
    temperature: 18.5,
    humidity: 42,
    lockSecure: true,
    sealId: 'SEAL-APX-90082'
  });

  // Track if search query changes or master shipments array updates
  useEffect(() => {
    const fetchSearchedOrSynced = async () => {
      if (searchedId) {
        const cleanId = searchedId.trim().toUpperCase();
        setQuery(searchedId);
        setHasSearched(true);
        
        if (db) {
          try {
            const docRef = doc(db, "shipments", cleanId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setCurrentShipment(docSnap.data() as Shipment);
              return;
            }
          } catch (err) {
            console.warn("[TrackingSystem] Direct search read fail, trying context fallback:", err);
          }
        }
        const ship = getShipment(searchedId);
        setCurrentShipment(ship);
      } else if (hasSearched && query) {
        // Keep manual searches synced with real-time updates from Dashboard!
        const cleanId = query.trim().toUpperCase();
        if (db) {
          try {
            const docRef = doc(db, "shipments", cleanId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setCurrentShipment(docSnap.data() as Shipment);
              return;
            }
          } catch (err) {
            console.warn("[TrackingSystem] Direct sync query failed, trying context fallback:", err);
          }
        }
        const ship = getShipment(query);
        setCurrentShipment(ship);
      }
    };

    fetchSearchedOrSynced();
  }, [searchedId, shipments, hasSearched, query]);

  // Fluctuating temperature based on cargo type
  useEffect(() => {
    if (!currentShipment) return;

    let targetTemp = 19.5;
    let targetHumid = 45;

    if (currentShipment.details.type.toLowerCase().includes('thermal') || currentShipment.notes?.toLowerCase().includes('temperature')) {
      targetTemp = -21.2;
      targetHumid = 12;
    } else if (currentShipment.origin.city === 'Tokyo') {
      targetTemp = 15.2;
      targetHumid = 55;
    }

    setSensorStatus({
      temperature: targetTemp,
      humidity: targetHumid,
      lockSecure: true,
      sealId: `SEAL-${currentShipment.trackingId}-0182`
    });

    const sensorInterval = setInterval(() => {
      setSensorStatus((prev) => ({
        ...prev,
        temperature: parseFloat((targetTemp + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        humidity: Math.min(100, Math.max(0, targetHumid + Math.floor(Math.random() * 4 - 2)))
      }));
    }, 4000);

    return () => clearInterval(sensorInterval);
  }, [currentShipment]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = query.trim().toUpperCase();
    if (!cleanId) return;

    setHasSearched(true);

    if (db) {
      try {
        const docRef = doc(db, "shipments", cleanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCurrentShipment(docSnap.data() as Shipment);
          return;
        }
      } catch (err) {
        console.warn("[TrackingSystem] Direct search request failed, using context", err);
      }
    }

    const ship = getShipment(query);
    setCurrentShipment(ship);
  };

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'Processed': return 'bg-blue-500 text-blue-50';
      case 'In Transit': return 'bg-sky-500 text-sky-50';
      case 'Out for Delivery': return 'bg-amber-500 text-amber-50';
      case 'Delivered': return 'bg-emerald-500 text-emerald-50';
      case 'Pending': return 'bg-slate-500 text-slate-50';
      case 'Exception': return 'bg-rose-500 text-rose-50';
      case 'HOLD': return 'bg-red-600 text-white';
      default: return 'bg-slate-500 text-slate-50';
    }
  };

  const handleQuickKeyClick = async (id: string) => {
    const cleanId = id.trim().toUpperCase();
    setQuery(id);
    setHasSearched(true);

    if (db) {
      try {
        const docRef = doc(db, "shipments", cleanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCurrentShipment(docSnap.data() as Shipment);
          return;
        }
      } catch (err) {
        console.warn("[TrackingSystem] Quick key direct load failed, using context", err);
      }
    }

    const ship = getShipment(id);
    setCurrentShipment(ship);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen font-sans">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Printable view wrapping handler */}
        {/* Search header, hidden on print */}
        <div className="print:hidden space-y-6">
          <div className="text-center max-w-xl mx-auto flex flex-col items-center">
            {branding?.headerLogo && (branding.headerLogo.startsWith('data:') || branding.headerLogo.startsWith('http')) ? (
              <img 
                src={branding.headerLogo} 
                alt={branding.siteName} 
                referrerPolicy="no-referrer"
                className="max-h-16 max-w-[200px] object-contain mb-4 h-auto w-auto"
              />
            ) : null}
            <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase bg-sky-100/50 border border-sky-100 rounded-full px-3 py-1">
              Sat-Telemetry System
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 mt-2.5">
              Live Consignment Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-light">
              Enter your tracking identifier to observe shipping vectors and environmental sensors.
            </p>
          </div>

          {/* Core tracking input form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter Tracking ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 px-4 py-2 text-slate-800 font-mono text-sm tracking-wider focus:outline-none pl-11 shadow-sm transition-all"
              />
              <div className="absolute left-4 top-3.5 text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </div>
            </div>
            <button
              type="submit"
              className="h-12 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-xl px-6 transition-all shadow-sm cursor-pointer uppercase tracking-wider"
            >
              Track/Scan Base
            </button>
          </form>
        </div>

        {/* Tracking Details Display */}
        {hasSearched && currentShipment ? (
          <div className="mt-8 space-y-6">
            
            {/* Header Status Bar (Print: Simple plain bar) */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg print:bg-white print:text-black print:border print:border-slate-200 print:shadow-none">
              <div>
                <span className="text-[10px] uppercase font-semibold text-sky-400 tracking-widest block">Active Telemetry AWB</span>
                <h2 className="font-heading text-2xl font-bold tracking-tight font-mono text-white print:text-black mt-0.5">
                  {currentShipment.trackingId}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 print:text-slate-600">
                  <span>Service: <strong className="text-slate-200 print:text-black font-semibold">{currentShipment.details.type}</strong></span>
                  <span>•</span>
                  <span>System Stamp: <span className="text-emerald-400 print:text-black font-semibold font-mono">Synchronized</span></span>
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end gap-2.5 w-full sm:w-auto">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(currentShipment.status)} print:bg-slate-100 print:text-black print:border`}>
                  {currentShipment.status}
                </span>
                <span className="text-[11px] text-slate-400 print:text-slate-600 font-light block">
                  Est. Delivery: <strong>{currentShipment.details.estimatedDelivery}</strong>
                </span>
              </div>
            </div>

            {/* Quick GPS Vector / IoT Telemetry Dashboard, hidden on print unless thermal critical */}
            <div className="print:hidden grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Origin-Destination Visual Vector */}
              <div className="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400 tracking-wider mb-6">
                  <span>Consignment Vector Routes</span>
                  <span className="text-sky-600 font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping"></span>
                    Live GPS link
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center relative">
                  
                  {/* Origin */}
                  <div className="sm:col-span-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center p-1.5 flex-shrink-0 mt-0.5">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">Origin Dep.</span>
                      <h4 className="font-heading text-sm font-bold text-slate-800 leading-tight">
                        {currentShipment.origin.city}, {currentShipment.origin.country}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1">{currentShipment.origin.sender}</p>
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  <div className="sm:col-span-3 flex flex-col items-center justify-center py-2">
                    <div className="relative w-full flex items-center justify-center">
                      <div className="w-full h-0.5 bg-dashed border-t border-slate-200 border-dashed absolute top-2.5"></div>
                      <Navigation className="h-5 w-5 text-sky-500 rotate-90 relative z-10 bg-white px-0.5" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1.5">TRANS-HUB</span>
                  </div>

                  {/* Destination */}
                  <div className="sm:col-span-4 bg-emerald-50/20 border border-emerald-100/50 p-4 rounded-2xl flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center p-1.5 flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-emerald-600 tracking-wider">Final Dest.</span>
                      <h4 className="font-heading text-sm font-bold text-slate-850 leading-tight">
                        {currentShipment.destination.city}, {currentShipment.destination.country}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-tight mt-1">{currentShipment.destination.receiver}</p>
                    </div>
                  </div>

                </div>

                <div className="h-px bg-slate-100 my-6"></div>

                {/* Sender/Receiver Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Shipper Warehouse Address</h5>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <strong>{currentShipment.origin.sender}</strong><br />
                      {currentShipment.origin.address}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Consignee Unload Address</h5>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <strong>{currentShipment.destination.receiver}</strong><br />
                      {currentShipment.destination.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* IoT Dynamic Telemetry Sensors */}
              <div className="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center justify-between">
                    <span>IoT Sensor Beacon</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </h3>

                  <div className="space-y-4">
                    {/* Temperature */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Thermometer className="h-4.5 w-4.5 text-sky-500" />
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide">Core Temp</span>
                          <span className="block font-mono text-sm font-semibold text-slate-700 mt-0.5">{sensorStatus.temperature}°C</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sensorStatus.temperature < 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {sensorStatus.temperature < 0 ? 'CO-COOL' : 'NORMAL'}
                      </span>
                    </div>

                    {/* Humidity */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Droplets className="h-4.5 w-4.5 text-sky-500" />
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide">Rel. Humidity</span>
                          <span className="block font-mono text-sm font-semibold text-slate-700 mt-0.5">{sensorStatus.humidity}% RH</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">STABLE</span>
                    </div>

                    {/* Seal lock */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Lock className="h-4.5 w-4.5 text-sky-500" />
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide">Lock Chassis</span>
                          <span className="block font-sans text-xs font-semibold text-slate-700 mt-0.5">Active Secured</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">LOCKED</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono leading-relaxed">
                  RF Seal Verification: <br />
                  <strong className="text-slate-600 font-bold">{sensorStatus.sealId}</strong>
                </div>
              </div>
            </div>

            {/* Tracking Progress Timeline */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm print:shadow-none print:border print:border-slate-305">
              <h3 className="font-heading text-sm font-bold uppercase text-slate-400 tracking-wider mb-6">
                Chain of Custody Timeline
              </h3>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {currentShipment.timeline.map((mile, i) => (
                  <div key={mile.id || i} className="relative group">
                    {/* Ring indicator */}
                    <div className={`absolute -left-6.5 top-1.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                      mile.isCompleted 
                        ? 'border-sky-500 bg-sky-500' 
                        : 'border-slate-200'
                    }`}>
                      {mile.isCompleted && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
                      {/* Meta */}
                      <div className="md:col-span-1">
                        <span className="block text-xs font-semibold text-slate-500 font-mono">{mile.timestamp}</span>
                        <span className="block text-[11px] font-bold text-sky-600 uppercase tracking-wide mt-1">{mile.location}</span>
                      </div>

                      {/* Content */}
                      <div className="md:col-span-3">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold tracking-tight ${mile.isCompleted ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
                            {mile.status}
                          </h4>
                          {mile.isCompleted && i === currentShipment.timeline.filter(t => t.isCompleted).length - 1 && (
                            <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md animate-pulse">
                              Last Registered Node
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed font-light">
                          {mile.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          hasSearched && (
            <div className="mt-8 max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center sm:p-12">
              <div className="h-12 w-12 rounded-full bg-red-150 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">AWB Code Unregistered</h3>
              <p className="text-xs text-slate-500 mt-1 font-light leading-relaxed max-w-sm mx-auto">
                No active cargo entry matches keyword <strong className="text-slate-850 font-semibold">"{query}"</strong>. Double-check your shipping document sequence.
              </p>
              <button
                type="button"
                onClick={() => setHasSearched(false)}
                className="mt-6 text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                Return to terminal search
              </button>
            </div>
          )
        )}

      </div>
    </div>
  );
};
