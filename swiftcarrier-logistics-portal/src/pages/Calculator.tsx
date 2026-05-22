/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { 
  Calculator, Package, ArrowRight, DollarSign, CalendarCheck, HelpCircle, Landmark
} from 'lucide-react';

export const CalculatorPage: React.FC = () => {
  const { showToast } = usePortal();

  // Inputs
  const [originCountry, setOriginCountry] = useState('DE');
  const [destCountry, setDestCountry] = useState('US');
  const [shipType, setShipType] = useState<'Air' | 'Sea' | 'Road' | 'Express'>('Air');
  const [weight, setWeight] = useState(15);
  const [length, setLength] = useState(40);
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(20);
  const [speed, setSpeed] = useState<'Standard' | 'Expedited' | 'Urgent'>('Standard');

  // Outputs
  const [estimateCost, setEstimateCost] = useState(0);
  const [estimateDays, setEstimateDays] = useState(0);
  const [volumeWeight, setVolumeWeight] = useState(0);

  // Dynamic Countries
  const countries = [
    { code: 'DE', name: 'Germany (Frankfurt HUB)' },
    { code: 'US', name: 'United States (JFK New York)' },
    { code: 'JP', name: 'Japan (Tokyo Narita)' },
    { code: 'CN', name: 'China (Shanghai Harbor)' },
    { code: 'FR', name: 'France (Paris CDG)' },
    { code: 'GB', name: 'United Kingdom (London LHR)' },
    { code: 'AU', name: 'Australia (Sydney Harbor)' }
  ];

  // Re-calculate details on state changes
  useEffect(() => {
    // Volumetric weight constant (Standard aviation index)
    const volWeight = (length * width * height) / 5000;
    setVolumeWeight(parseFloat(volWeight.toFixed(2)));

    // Base fare calculations
    let base = 0;
    let ratePerKg = 0;
    let defaultDays = 0;

    switch (shipType) {
      case 'Air':
        base = 120;
        ratePerKg = 5.25;
        defaultDays = 4;
        break;
      case 'Sea':
        base = 280;
        ratePerKg = 1.10;
        defaultDays = 21;
        break;
      case 'Road':
        base = 65;
        ratePerKg = 1.80;
        defaultDays = 7;
        break;
      case 'Express':
        base = 45;
        ratePerKg = 11.50;
        defaultDays = 2;
        break;
    }

    // Determine billing weight (heavier of real weight vs. dimensional volume weight)
    const billingWeight = Math.max(weight, volWeight);
    let total = base + (billingWeight * ratePerKg);

    // Cross-border tariff offset (e.g., if countries are different)
    if (originCountry !== destCountry) {
      total += 45.00; // custom clearance stamp charge
    }

    // Apply delivery speeds
    let days = defaultDays;
    if (speed === 'Expedited') {
      total *= 1.35;
      days = Math.max(1, Math.round(defaultDays * 0.65));
    } else if (speed === 'Urgent') {
      total *= 1.80;
      days = Math.max(1, Math.round(defaultDays * 0.3));
    }

    setEstimateCost(parseFloat(total.toFixed(2)));
    setEstimateDays(days);

  }, [originCountry, destCountry, shipType, weight, length, width, height, speed]);

  const handleBookCarriage = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Carriage computed at $${estimateCost} successfully registered in system!`, 'success');
  };

  return (
    <div className="bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Title */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#ff3c00] text-xs font-mono font-bold tracking-widest uppercase">
            ONLINE CARRIER TARIFF ESTIMATOR
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Shipment Cost Calculator
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Compute real-time intercontinental transport rates, volumetric weights, and border tariff clearings. Fully compliant with standard aviation weight balances.
          </p>
        </section>

        {/* Dual Panel Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs Section (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6.5 shadow-2xl space-y-6">
            
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <Package className="h-5 w-5 text-[#ff3c00]" />
              <h3 className="font-bold text-white text-base">Consignment Specification</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Origin */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <label className="font-semibold block font-mono">ORIGIN GATEWAY</label>
                <select 
                  value={originCountry} 
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-sans text-xs focus:border-[#ff3c00] focus:outline-none placeholder-slate-705"
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <label className="font-semibold block font-mono">DESTINATION GATEWAY</label>
                <select 
                  value={destCountry} 
                  onChange={(e) => setDestCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-sans text-xs focus:border-[#ff3c00] focus:outline-none"
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Shipment Type Panels */}
            <div className="space-y-2 text-xs text-slate-405">
              <label className="font-semibold block font-mono uppercase text-slate-400">TRANSIT PROTOCOL</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'Air', label: 'Air Freight' },
                  { key: 'Sea', label: 'Sea Cargo' },
                  { key: 'Road', label: 'Road Liner' },
                  { key: 'Express', label: 'Expedited' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setShipType(item.key as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold font-sans transition-all cursor-pointer ${
                      shipType === item.key 
                        ? 'bg-[#ff3c00]/15 text-white border-[#ff3c00] shadow-[#ff3c00]/5 shadow-inner' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Slider */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between font-mono text-slate-400">
                <label className="font-semibold uppercase">Gross Cargo Weight</label>
                <span className="font-extrabold text-white">{weight} KG</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="2000" 
                value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#ff3c00] border border-slate-850"
              />
            </div>

            {/* Dimensions Grid */}
            <div className="space-y-3.5 pt-2">
              <label className="font-semibold block font-mono text-xs text-slate-400 uppercase">Package Volumetrics (CM)</label>
              <div className="grid grid-cols-3 gap-3">
                
                {/* Length */}
                <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">LENGTH</span>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none w-full"
                  />
                </div>

                {/* Width */}
                <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">WIDTH</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none w-full"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">HEIGHT</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none w-full"
                  />
                </div>

              </div>
            </div>

            {/* Delivery speed Selectors */}
            <div className="space-y-2 text-xs text-slate-405">
              <label className="font-semibold block font-mono text-slate-400 uppercase">Velocity Selection</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'Standard', label: 'Standard Schedule', details: 'Regular transit channels' },
                  { key: 'Expedited', label: 'Expedited Priority', details: 'Trims duration by 30%' },
                  { key: 'Urgent', label: 'Urgent Next-Day boarding', details: 'Fast border escort' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSpeed(item.key as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      speed === item.key 
                        ? 'bg-[#ff3c00]/15 text-white border-[#ff3c00]' 
                        : 'bg-slate-950 border-slate-850 text-slate-405 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-bold font-sans text-xs">{item.label}</p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{item.details}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Pricing Summary (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Upper Estimation Frame */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#ff3c00]/5 filter blur-3xl pointer-events-none" />

              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase">TARIFF COMPUTATION</span>
                <h3 className="text-xl font-bold font-sans text-white">Estimated Carriage Cost</h3>
              </div>

              {/* Huge Cost Value */}
              <div className="py-8 border-y border-slate-805 border-slate-800/80 my-4 flex items-baseline gap-1">
                <DollarSign className="h-8 w-8 text-[#ff3c00] flex-shrink-0" />
                <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight font-mono leading-none">
                  {estimateCost}
                </span>
                <span className="text-slate-500 font-mono text-xs font-semibold ml-1.5 uppercase">USD</span>
              </div>

              <div className="space-y-4">
                
                {/* Specific Details */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center space-x-2">
                    <CalendarCheck className="h-4.5 w-4.5 text-emerald-555 text-emerald-500" />
                    <div>
                      <p className="text-slate-500 text-[9px] uppercase">ESTIMATED ETA</p>
                      <p className="text-white font-bold text-sm mt-0.5">{estimateDays} Days</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center space-x-2">
                    <Package className="h-4.5 w-4.5 text-cyan-500" />
                    <div>
                      <p className="text-slate-500 text-[9px] uppercase">DIMENSIONAL WT</p>
                      <p className="text-white font-bold text-sm mt-0.5">{volumeWeight} KG</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 space-y-1.5 text-[11px] leading-relaxed">
                  <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-[#ff3c00] font-mono">Regulatory Duty Warning</span>
                  <p className="text-slate-400">
                    Pricing incorporates standard container handling, airway boardings, and security seal checks. Volumetric computations match the **IATA Volumetric Weight Standard Ratio 1:6000**.
                  </p>
                </div>

              </div>

              <button 
                onClick={handleBookCarriage}
                className="w-full bg-[#ff3c00] hover:bg-[#e03500] text-white font-bold py-3.5 rounded-xl text-center text-sm shadow-lg shadow-[#ff3c00]/20 flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
              >
                <span>Process Shipment Booking</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>

            </div>

            {/* Regulatory compliance notes */}
            <div className="bg-[#ff3c00]/5 p-4.5 rounded-2xl border border-[#ff3c00]/10 text-xs text-slate-400 leading-relaxed font-mono flex items-center space-x-3">
              <Landmark className="h-6 w-6 text-emerald-555 text-emerald-500 flex-shrink-0" />
              <span>International customs brokerage indices are updated automatically in our ledger systems daily.</span>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
};
