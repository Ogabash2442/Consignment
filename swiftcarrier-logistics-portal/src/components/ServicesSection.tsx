import React, { useState } from 'react';
import { Plane, Ship, Truck, HardDrive, Anchor, Zap, Globe, ArrowRight, Calculator, CheckCircle, Flame } from 'lucide-react';

interface ServicesSectionProps {
  onQuoteInquiry: (msg: string) => void;
}

const SERVICES = [
  {
    icon: Plane,
    title: 'Aviation Air Freight',
    description: 'Priority space allocations on key cargo air corridors. Servicing timezone-sensitive cargo, sensitive biotech, microchips, and luxury timepieces.',
    features: ['High-precision climate pods', 'Secure biometric cell cages', 'Direct custom liaison'],
    accent: 'bg-sky-50 text-sky-600 border-sky-100'
  },
  {
    icon: Ship,
    title: 'Precision Maritime Cargo',
    description: 'High-volume container freight across major shipping routes. Ideal for chemical payloads, vehicles, dry agricultural bulk, and retail distribution chains.',
    features: ['Moisture-controlled steel boxes', 'FCL and LCL integrations', 'Hull safety monitoring'],
    accent: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  },
  {
    icon: Truck,
    title: 'Thermoregulated Road Ground',
    description: 'Continuous active-cooling long-haul truck liners. Equipt with satellite coordinate tracking and automated temperature logs.',
    features: ['Constant active chilling (-20°C)', 'Multi-driver fast sleeper lines', 'Tailgate hydraulic unloading'],
    accent: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  },
  {
    icon: HardDrive,
    title: 'Climatized Warehouse Hubs',
    description: 'A-grade warehouse hubs near strategic airports and docks. Features autonomous shelving, robotic sorting, and secure storage.',
    features: ['Robotic cargo pick lines', 'Secured high-value safe-rooms', 'Custom stock APIs'],
    accent: 'bg-teal-50 text-teal-600 border-teal-100'
  },
  {
    icon: Anchor,
    title: 'Smart Cargo Handling',
    description: 'Fast terminal container staging, dual RFID barcode labeling, and heavy crane operations at major harbors.',
    features: ['Live RFID tracking stickers', '24/7 security surveillance', 'Strict weight safety clearance'],
    accent: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  {
    icon: Zap,
    title: 'Localized Express Couriers',
    description: 'Same-day inner-city localized van and eco-friendly bike delivery lines for critical documentation, contracts, and parcels.',
    features: ['Under 2-hour suburban delivery', 'Digital signature proofing', 'Photo evidence capture'],
    accent: 'bg-rose-50 text-rose-600 border-rose-100'
  },
  {
    icon: Globe,
    title: 'Global Customs brokerage',
    description: 'Full-service international trade consultation. Processing electronic manifest declarations, tariff codes, and VAT bonding.',
    features: ['Paperless customs entry clearance', 'BONDED tax locker solutions', 'Trade law attorney reviews'],
    accent: 'bg-purple-50 text-purple-600 border-purple-100'
  }
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onQuoteInquiry }) => {
  const [origin, setOrigin] = useState('Europe');
  const [destination, setDestination] = useState('North America');
  const [weight, setWeight] = useState(25);
  const [serviceType, setServiceType] = useState('Air Freight');
  const [prioritySpeed, setPrioritySpeed] = useState('Express');

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Formulate cost prediction logic
  const calculateEstimate = () => {
    let basePricePerKg = 4.5;
    if (serviceType === 'Air Freight') basePricePerKg = 12.0;
    else if (serviceType === 'Ocean Cargo') basePricePerKg = 2.2;
    else if (serviceType === 'Thermal Biotech') basePricePerKg = 24.5;
    else if (serviceType === 'Road Express') basePricePerKg = 5.5;

    let distanceRate = 1.0;
    if (origin === destination) distanceRate = 0.5; // domestic
    else if ((origin === 'Asia Pacific' && destination === 'Europe') || (origin === 'Europe' && destination === 'Asia Pacific')) {
      distanceRate = 1.6;
    } else if (origin === 'Europe' && destination === 'North America') {
      distanceRate = 1.25;
    } else {
      distanceRate = 1.5;
    }

    let speedRate = 1.0;
    if (prioritySpeed === 'Thermal critical') speedRate = 1.8;
    else if (prioritySpeed === 'Express') speedRate = 1.35;

    const netPrice = weight * basePricePerKg * distanceRate * speedRate;
    return Math.max(75, Math.ceil(netPrice));
  };

  const calculatedCost = calculateEstimate();

  const handleBookNow = () => {
    const inquiryText = `Hello Apex Dispatch! I would like to book a cargo consignment from ${origin} to ${destination}. Estimated cargo details: Type: ${serviceType}, Weight: ${weight} kg, Speed: ${prioritySpeed}. Quote Estimate: $${calculatedCost} USD.`;
    onQuoteInquiry(inquiryText);
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-sky-200/25 blur-3xl" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase bg-sky-100/50 border border-sky-100 rounded-full px-3 py-1">
            Global Infrastructure
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-3">
            Elite International Freight Capabilities
          </h2>
          <p className="mt-4 text-base text-slate-500 font-light leading-relaxed">
            Operating specialized, secure trade grids across five continents. Whether high-value Swiss jewels requiring biometric lockers or medical therapies requiring strict dry-ice thermal integrity.
          </p>
        </div>

        {/* Services Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((srv, idx) => {
            const IconComponent = srv.icon;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={srv.title}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:border-sky-500/10 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Visual hover background accent */}
                <div className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-slate-50 -mr-6 -mt-6 transition-all duration-300 ${isHovered ? 'scale-[2.5] bg-sky-50/40' : ''}`} />

                <div className="relative z-10">
                  {/* Service Icon */}
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center p-2.5 shadow-sm border ${srv.accent} mb-6`}>
                    <IconComponent className="h-6 w-6" />
                  </div>

                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-3 group-hover:text-sky-600">
                    {srv.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 leading-relaxed font-light mb-6">
                    {srv.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {srv.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer">
                  <span>Explore service specs</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Quote Calculator Area */}
        <div className="mt-20 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-indigo-500/10" />
          <div className="absolute right-10 bottom-0 h-48 w-48 rounded-full bg-sky-500/5 blur-2xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Calc Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold">Consignment Cost Estimator</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Micro-budgeting quotes based on current carrier allocations.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Origin */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Origin Grid</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-sky-500 px-3.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-medium"
                  >
                    {['North America', 'Europe', 'Asia Pacific', 'South America', 'Middle East'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Destination Grid</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-sky-500 px-3.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-medium"
                  >
                    {['North America', 'Europe', 'Asia Pacific', 'South America', 'Middle East'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cargo Type */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Cargo Category</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-sky-500 px-3.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-medium"
                  >
                    {['Air Freight', 'Ocean Cargo', 'Road Express', 'Thermal Biotech'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Speed Priority */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Service Speed Priority</label>
                  <select
                    value={prioritySpeed}
                    onChange={(e) => setPrioritySpeed(e.target.value)}
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-sky-500 px-3.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-medium"
                  >
                    {['Standard', 'Express', 'Thermal critical'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Gross Weight</label>
                  <span className="font-mono text-xs font-semibold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md">
                    {weight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5000"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 kg (Envelope)</span>
                  <span>1000 kg (Pallet)</span>
                  <span>5000 kg (Heavy Multi-Load)</span>
                </div>
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full backdrop-blur-md">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-300 border border-sky-400/25 uppercase tracking-wide">
                  Real-time Rates
                </span>
                
                <div>
                  <span className="block text-xs uppercase font-medium text-slate-400 tracking-wider">Estimated Billing</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      ${calculatedCost.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">USD</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-light text-slate-300 pt-3 border-t border-white/5">
                  <div className="flex justify-between">
                    <span>Base Freight Fee:</span>
                    <span className="font-mono">${Math.round(calculatedCost * 0.75)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority Speed Premium:</span>
                    <span className="font-mono">${Math.round(calculatedCost * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regulatory Customs Booking:</span>
                    <span className="font-mono">${Math.round(calculatedCost * 0.05)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleBookNow}
                  className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Book Consignment Quote</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <span className="block text-center text-[10px] text-slate-500 mt-2">
                  This quote is integrated directly with support channels.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
