import React, { useState } from 'react';
import { LogisticsProvider, useLogistics } from './LogisticsContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { TrackingSystem } from './components/TrackingSystem';
import { LiveChatSystem } from './components/LiveChatSystem';
import { LoginAccessDashboard } from './components/LoginAccessDashboard';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { 
  Building2, Ship, MapPin, Globe, Sparkles, Anchor, Plane, ShieldCheck, 
  ChevronRight, Star, Quote, ArrowUpRight, Megaphone, Info 
} from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
  const [activeSearchId, setActiveSearchId] = useState('');
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  const { announcements, branding } = useLogistics();

  // Highlight any active sitewide announcment alerts
  const activeAlert = announcements.find((a) => a.active);

  const handleHeroSearch = (id: string) => {
    setActiveSearchId(id);
    setCurrentTab('track');
  };

  const handleQuoteInquiry = (quoteMsg: string) => {
    setChatWidgetOpen(true);
    // Automatically trigger support chat with pre-written request
    // This is handled immediately by the chat component listening to global state
    // To do this, we can simulate typing in active user chat, we trigger it inside context.
  };

  const handleContactRegistered = () => {
    // Navigate straight to dashboard after short contact form delay to see it in mailbox live!
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-sky-500 selection:text-white">
      {/* Navbar Container */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'track') setActiveSearchId(''); // Clear search state when switching views
        }}
        openChat={() => setChatWidgetOpen(!chatWidgetOpen)}
      />

      {/* Sitewide Announcement Ticker bar */}
      {activeAlert && (
        <div id="apex-announcement-bar" className={`relative w-full text-xs font-semibold flex items-center overflow-hidden border-b transition-all select-none h-10 ${
          activeAlert.category === 'delay' 
            ? 'bg-amber-500 text-slate-950 border-amber-400' 
            : activeAlert.category === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-900 text-slate-100 border-slate-800'
        }`}>
          {/* Fixed Badge on left */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/20 ml-3 mr-3 z-10 flex-shrink-0 border border-current/10 whitespace-nowrap">
            <Megaphone className="h-3 w-3 flex-shrink-0 animate-bounce" />
            <span className="uppercase tracking-wider text-[9px] font-bold">Local Issue Bulletin</span>
          </div>

          {/* Marquee Ticker Container */}
          <div className="flex-grow overflow-hidden relative flex items-center select-none h-full">
            <div className="animate-marquee hover:[animation-play-state:paused] flex items-center whitespace-nowrap h-full">
              {/* Part 1 */}
              <div className="flex items-center gap-12 pr-12 flex-shrink-0 whitespace-nowrap h-full">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="font-bold bg-black/15 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">{activeAlert.category}</span>
                  <span>{activeAlert.title}</span>
                  <span className="opacity-80">—</span>
                  <span className="opacity-90">{activeAlert.content}</span>
                  <span className="font-mono text-[9px] opacity-75 bg-black/10 px-1.5 py-0.5 rounded ml-1">{activeAlert.timestamp} UTC</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-current opacity-50 flex-shrink-0"></span>
                <span className="flex items-center gap-1.5 font-medium opacity-90">
                  <span className="font-bold bg-black/15 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Info</span>
                  <span>Apex Global Air & Maritime Carrier Broadcast Protocol Active</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-current opacity-50 flex-shrink-0"></span>
              </div>
              
              {/* Part 2 (Identical Clone for 100% Perfect Seamless Loop transition) */}
              <div className="flex items-center gap-12 pr-12 flex-shrink-0 whitespace-nowrap h-full">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="font-bold bg-black/15 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">{activeAlert.category}</span>
                  <span>{activeAlert.title}</span>
                  <span className="opacity-80">—</span>
                  <span className="opacity-90">{activeAlert.content}</span>
                  <span className="font-mono text-[9px] opacity-75 bg-black/10 px-1.5 py-0.5 rounded ml-1">{activeAlert.timestamp} UTC</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-current opacity-50 flex-shrink-0"></span>
                <span className="flex items-center gap-1.5 font-medium opacity-90">
                  <span className="font-bold bg-black/15 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Info</span>
                  <span>Apex Global Air & Maritime Carrier Broadcast Protocol Active</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-current opacity-50 flex-shrink-0"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Page Swapper View */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME */}
        {currentTab === 'home' && (
          <div className="animate-fade-in">
            {/* Dynamic Slider and Counters integrated on hero */}
            <HeroSection 
              onSearchTrack={handleHeroSearch} 
              setCurrentTab={setCurrentTab}
            />

            {/* Why Choose Us Section */}
            <section className="py-20 bg-white font-sans text-left">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Visual grid layout column */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                  
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 hover:border-sky-500/10 transition-colors">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 border mb-4">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">Secured Bonded Carrier</h4>
                    <p className="text-[11.5px] font-light text-slate-500 mt-2 leading-relaxed">Fully certified security vaults and real-time biometric locks clearance.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 hover:border-sky-500/10 transition-colors mt-6">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border mb-4">
                      <Globe className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">Universal Customs Staging</h4>
                    <p className="text-[11.5px] font-light text-slate-500 mt-2 leading-relaxed">Autonomous paperwork filings in major world airports bypass delays.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 hover:border-sky-500/10 transition-colors">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border mb-4">
                      <Anchor className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">Transoceanic Consolidations</h4>
                    <p className="text-[11.5px] font-light text-slate-500 mt-2 leading-relaxed">FCL/LCL arrangements across 12 ocean lanes at micro-pricing.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 hover:border-sky-500/10 transition-colors mt-6">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 border mb-4">
                      <Plane className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">Next-Day Sky Freight</h4>
                    <p className="text-[11.5px] font-light text-slate-500 mt-2 leading-relaxed">Dedicated cargo charter space with active temperature trackers.</p>
                  </div>

                </div>

                {/* Narrative column */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase bg-sky-100/50 border border-sky-100 rounded-full px-3 py-1">
                    Elite Freight Credentials
                  </span>
                  
                  <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                    Microscopically Monitored Cargo Networks
                  </h2>
                  
                  <p className="text-sm font-light text-slate-500 leading-relaxed">
                    Apex Global Logistics represents the benchmark in modern cargo operations. We combine physical security (hardened vaults) with digital intelligence (interactive temperature and coordinate GPS nodes) to give clients ultimate supply-chain accountability.
                  </p>
                  
                  <p className="text-sm font-light text-slate-500 leading-relaxed">
                    By developing custom border clearances databases and maintaining active relations with 42 sovereignties, we guarantee that items never lay stalled in warehouse backlogs.
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => setCurrentTab('services')}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Explore Services Portfolio</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Testimonials Review Slider */}
            <section className="py-20 bg-slate-900 text-white font-sans text-left relative overflow-hidden">
              <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />
              <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-505/5 blur-3xl" />

              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
                
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <span className="text-[11px] font-bold tracking-wider text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full uppercase border border-sky-400/20">
                    Trusted by Enterprises
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Worldwide Customer Encounters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      name: 'Marcus Brandt',
                      company: 'Chronos Haute Lux AG, Switzerland',
                      text: 'Apex maintains impeccable standards. Shipping highly specialized high-end precision calibers requires active coordinate oversight and secure logistics lockers. Simply the finest cargo service we have vetted.',
                      rating: 5
                    },
                    {
                      name: 'Jean-Luc L.',
                      company: 'Maison Gallia, France',
                      text: 'Outstanding moisture and humidity telemetry alerts! Our imports of luxury raw denim coils require absolute moisture protection. Apex provided instant sensor data on CDG arrival confirming normal scales.',
                      rating: 5
                    },
                    {
                      name: 'Sarah Chen',
                      company: 'HydroGrid Solar Labs, USA',
                      text: 'Consignment rates generated on their cost calculator are precise and matched invoice details perfectly. Heavy truck dispatch with crane tethers occurred on schedule without delays.',
                      rating: 5
                    }
                  ].map((user) => (
                    <div key={user.name} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 backdrop-blur-md hover:border-sky-400/25 transition-colors">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(user.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>

                      <p className="text-xs text-slate-300 font-light leading-relaxed italic">
                        "{user.text}"
                      </p>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <strong className="block text-white text-xs font-bold">{user.name}</strong>
                          <span className="block text-[10px] text-slate-400 font-light mt-0.5">{user.company}</span>
                        </div>
                        <Quote className="h-6 w-6 text-sky-400/20" />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* Worldwide Staging Hub visual presentation */}
            <section className="py-20 bg-white font-sans text-left">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h3 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">Worldwide Cargo Corridors</h3>
                  <p className="text-xs text-slate-400 font-light">Micro-tracked container movements crossing maritime ship lines and jet routes.</p>
                </div>

                <div className="border border-slate-100 rounded-3xl p-6 sm:p-10 bg-slate-50 shadow-inner flex flex-col md:flex-row gap-8 items-center justify-between">
                  
                  <div className="space-y-4 max-w-md text-left">
                    <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Apex Global trade maps</span>
                    <h4 className="font-heading text-xl font-bold tracking-tight text-slate-800 leading-snug">Continuous air & maritime shipping corridors</h4>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      We coordinate complex cargo arrangements across Rotterdam, Singapore, Tokyo Ohi, Los Angeles, Seattle CDG, and Zurich airport depots.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-2 font-medium">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
                        <span>Zurich Central Air Staging Hub (HQ)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
                        <span>Rotterdam Main Maritime Container depot</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
                        <span>Tokyo Keihin Staging Terminal</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex-grow max-w-lg bg-white border border-slate-150 p-6 rounded-2xl flex items-center justify-center">
                    {/* Visual Vector Schematic placeholder */}
                    <div className="text-center space-y-3 py-6">
                      <div className="flex h-12 w-12 items-center justify-center bg-sky-50 text-sky-600 rounded-full mx-auto border">
                        <Globe className="h-6 w-6 animate-spin-slow" style={{ animationDuration: '30s' }} />
                      </div>
                      <h5 className="font-heading font-bold text-sm text-slate-800 leading-tight">Digital Waybill verification gateway</h5>
                      <p className="text-xs text-slate-400 font-light max-w-xs leading-normal">
                        Verify customs declarations by scanning barcodes or pasting container tags in our Sat-Tracking dashboard.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SERVICES */}
        {currentTab === 'services' && (
          <div className="animate-fade-in">
            <ServicesSection onQuoteInquiry={handleQuoteInquiry} />
          </div>
        )}

        {/* VIEW 3: TRACK */}
        {currentTab === 'track' && (
          <div className="animate-fade-in">
            <TrackingSystem 
              searchedId={activeSearchId} 
              onClearSearch={() => setActiveSearchId('')} 
            />
          </div>
        )}

        {/* VIEW 4: ABOUT */}
        {currentTab === 'about' && (
          <div className="animate-fade-in">
            <AboutSection />
          </div>
        )}

        {/* VIEW 5: CONTACT */}
        {currentTab === 'contact' && (
          <div className="animate-fade-in">
            <ContactSection onContactRegistered={handleContactRegistered} />
          </div>
        )}

        {/* VIEW 6: ACCESS DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="animate-fade-in">
            <LoginAccessDashboard />
          </div>
        )}

      </main>

      {/* Floating Active Live Support Chat widget */}
      {chatWidgetOpen && (
        <div className="transition-all animate-fade-in">
          <LiveChatSystem />
        </div>
      )}
      
      {/* Fallback button if chat widget is completely closed on floating screen */}
      <LiveChatSystem />

      {/* Premium Corporate Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-16 text-white font-sans text-left print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
          
          {/* Col 1: Identity */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-400/25">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight">{branding.footerLogo || branding.siteName}</span>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-sm">
              {branding.websiteBrandingDetails}
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              System Release Stamp: <strong className="text-sky-400 font-bold">ACTIVE</strong>
            </div>
          </div>

          {/* Col 2: Services Index */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300">Carrier Methods</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-light">
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('services')}>Aviation Air Cargo</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('services')}>Ocean Marine Liners</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('services')}>Overland Thermoregulated</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('services')}>Robotic Warehouse Hubs</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('services')}>Biometric Custom Lockers</li>
            </ul>
          </div>

          {/* Col 3: Company Link Index */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-light">
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('home')}>Consignment Home</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('services')}>Consignment Cost Estimator</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('track')}>Waybill Tracking Terminal</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('about')}>Corporate Credentials</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setCurrentTab('dashboard')}>Login Access Portal</li>
            </ul>
          </div>

          {/* Col 4: Corporate Registration */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300">Global HQ</h4>
            <p className="text-xs text-slate-400 leading-snug font-light">
              {branding.officeAddress}
            </p>
            <div className="text-[10px] text-slate-500 font-mono mt-2 space-y-1 block">
              <div>P: {branding.contactPhone}</div>
              <div>E: {branding.contactEmail}</div>
            </div>
          </div>

        </div>

        {/* Bottom copy */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px] font-medium tracking-wide">
          <span>{branding.footerInformation}</span>
          <div className="flex gap-4">
            <a href={branding.socialTwitter} target="_blank" rel="noreferrer" className="hover:text-slate-300">Twitter</a>
            <span>•</span>
            <a href={branding.socialLinkedin} target="_blank" rel="noreferrer" className="hover:text-slate-300">LinkedIn</a>
            <span>•</span>
            <a href={branding.socialInstagram} target="_blank" rel="noreferrer" className="hover:text-slate-300">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LogisticsProvider>
      <AppContent />
    </LogisticsProvider>
  );
}
