import React, { useState, useEffect } from 'react';
import { Search, Ship, Plane, Truck, Clipboard, MapPin, Sparkles, Navigation } from 'lucide-react';
import { useLogistics } from '../LogisticsContext';

interface HeroSectionProps {
  onSearchTrack: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}

const SLIDES = [
  {
    tag: 'Global Ocean Freight',
    title: 'Global Cargo Shipping Without Borders',
    description: 'Optimized maritime container ocean liner arrangements crossing primary seafaring trade routes. Secure telemetry seals protect ultra-high value cargoes.',
    accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    stat: '126 Lines',
    statLabel: 'Open navigation pathways',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=1600'
  },
  {
    tag: 'Express Air Cargo',
    title: 'Fast Air Freight & Express Logistics',
    description: 'Guaranteed urgent aircraft weight-and-space allocations, real-time climatized cargo monitoring, and immediate customs clearing files pre-submitted.',
    accent: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    stat: '99.8%',
    statLabel: 'On-Time flight rating',
    image: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&q=80&w=1600'
  },
  {
    tag: 'Intelligent Warehouse depot',
    title: 'Smart Warehouse & Distribution Management',
    description: 'Autonomous automated layout optimization, precision robotic sorting systems, and continuous real-time inventory scan auditing desks.',
    accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    stat: '<18 min',
    statLabel: 'Average terminal release',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600'
  },
  {
    tag: 'Overland Road Dispatch',
    title: 'Reliable Ground Transport Solutions',
    description: 'Continuous heavy-class commercial road dispatch lanes crossing arterial highway vectors with real-time GPS coordinates and secure receiver signatures.',
    accent: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    stat: '-20°C',
    statLabel: 'Active cargo chillers',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1600'
  },
  {
    tag: 'Integrated Global Network',
    title: 'Worldwide Logistics & Supply Chain Network',
    description: 'Custom bespoke cross-dock distribution arrangements, multi-mode shipping transits, and rapid customs brokerage crossings crossing forty-two sovereign boundaries.',
    accent: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    stat: '140 Hubs',
    statLabel: 'Primary logistics centers',
    image: 'https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&q=80&w=1600'
  }
];
export const HeroSection: React.FC<HeroSectionProps> = ({ onSearchTrack, setCurrentTab }) => {
  const { branding } = useLogistics();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [searchError, setSearchError] = useState('');

  // Counters simulation for an animated stats experience
  const [stats, setStats] = useState({
    ports: 140,
    countries: 42,
    delivered: 483000,
    transitTime: 18 // minutes average clearance
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Soft stats counter increment simulator
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        delivered: prev.delivered + Math.floor(Math.random() * 3) + 1
      }));
    }, 3000);
    return () => clearInterval(statsTimer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setSearchError('Please fill in a tracking sequence.');
      return;
    }
    onSearchTrack(searchValue.trim());
  };

  const handleQuickKeyClick = (id: string) => {
    setSearchValue(id);
    onSearchTrack(id);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 lg:py-28 font-sans">
      {/* Background slide elements with smooth cross-fading and parallax zoom */}
      <div className="absolute inset-0 select-none">
        {SLIDES.map((slide, i) => (
          <img
            key={i}
            src={slide.image}
            alt="Logistics Scenario"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[4000ms] ease-out ${
              i === currentSlide ? 'opacity-35 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transform`}
          />
        ))}
        {/* Soft dual-layer dark cinematic overlay for premium high readability of texts */}
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Slide Content Box with Key for Triggering Subtle Fade-In-Up On Load */}
        <div key={currentSlide} className="lg:col-span-7 flex flex-col items-start gap-4 text-left animate-fade-in-up">
          {/* Tagline */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${SLIDES[currentSlide].accent}`}>
            <Sparkles className="h-3 w-3 animate-spin" />
            {SLIDES[currentSlide].tag}
          </span>

          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {currentSlide === 0 ? branding.heroBrandingText : SLIDES[currentSlide].title}
          </h1>

          <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-xl font-light leading-relaxed">
            {currentSlide === 0 ? branding.websiteBrandingDetails : SLIDES[currentSlide].description}
          </p>

          {/* Quick Info Badge */}
          <div className="mt-2 flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3.5 pr-6 max-w-md backdrop-blur-md">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Navigation className="h-5 w-5 rotate-45 animate-pulse" />
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-white leading-none">
                {SLIDES[currentSlide].stat}
              </div>
              <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase mt-1">
                {SLIDES[currentSlide].statLabel}
              </div>
            </div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex gap-2.5 mt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  i === currentSlide ? 'w-8 bg-sky-400' : 'w-2.5 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Search tracking terminal card */}
        <div className="lg:col-span-5 bg-white/10 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-0 right-6 h-1 w-20 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-b-full"></div>
          
          <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-400" />
            <span>Interactive Cargo Tracking</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-light leading-relaxed">
            Enter your air waybill, road reference, or marine container tracking sequence for microscopic logistics status.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-5 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Cargo / Tracking Identifier"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSearchError('');
                }}
                className="w-full h-13 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-slate-600 focus:border-sky-500 px-4 py-2 text-white font-mono placeholder-slate-500 focus:outline-none transition-all pl-11 shadow-inner text-sm tracking-wider"
              />
              <div className="absolute left-4 top-4 text-slate-500">
                <Search className="h-5 w-5" />
              </div>
            </div>

            {searchError && (
              <p className="text-[11px] text-orange-400 font-semibold tracking-wide">
                {searchError}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
            >
              <span>Track/Scan Base</span>
              <Navigation className="h-4 w-4 rotate-95" />
            </button>
          </form>
        </div>
      </div>

      {/* Statistics Section inside the Hero Backdrop wrapping */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center md:text-left">
          
          <div className="p-2 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <Ship className="h-4.5 w-4.5 text-sky-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Ports & Depots</span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.ports}+
            </div>
            <p className="text-[11px] text-slate-400 font-light mt-1">Managed international gateways</p>
          </div>

          <div className="p-2 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <Plane className="h-4.5 w-4.5 text-sky-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Sovereignties</span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.countries}+
            </div>
            <p className="text-[11px] text-slate-400 font-light mt-1">Global customs agreements</p>
          </div>

          <div className="p-2 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <Clipboard className="h-4.5 w-4.5 text-sky-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Completed Cargoes</span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.delivered.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-light mt-1">Micro-tracked flawless releases</p>
          </div>

          <div className="p-2 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <Truck className="h-4.5 w-4.5 text-sky-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Broker Clearances</span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              15 <span className="text-sm font-sans font-normal text-slate-500">mins avg</span>
            </div>
            <p className="text-[11px] text-slate-400 font-light mt-1">Autonomous digital declarations</p>
          </div>

        </div>
      </div>
    </div>
  );
};
