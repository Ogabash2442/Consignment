import React from 'react';
import { Shield, Radio, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { useLogistics } from '../LogisticsContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openChat }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { chats, branding } = useLogistics();

  // Highlight any unread chats to show that updates are occurring
  const unreadChatsCount = chats.filter((c) => c.status === 'unread').length;

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Our Services' },
    { id: 'track', label: 'Shipment Tracking' },
    { id: 'about', label: 'About Elite' },
    { id: 'contact', label: 'Contact Us' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      {/* Top micro Announcement ticker */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-[11px] font-medium tracking-wider text-slate-300 uppercase flex items-center justify-center gap-2">
        <span className="flex h-1.5 w-1.5 items-center rounded-full bg-emerald-400"></span>
        <span>{branding.siteName} Satellite Network: Active 100% Connectivity</span>
        <span className="hidden md:inline text-slate-500">|</span>
        <span className="hidden md:inline">Global customs clearance delays: 0hr</span>
      </div>

      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <button
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sky-400 font-bold font-mono text-sm shadow-md transition-transform group-hover:rotate-6 select-none">
            {branding.headerLogo || "A"}
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-450 bg-sky-400"></div>
          </div>
          <div>
            <span className="block font-heading text-base font-bold tracking-tight text-slate-900">
              {branding.siteName}
            </span>
            <span className="block text-[9px] font-semibold tracking-widest text-sky-600 uppercase leading-none">
              Terminal Node
            </span>
          </div>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative py-2 text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                  isActive ? 'text-sky-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Login Access Button */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold leading-normal transition-all cursor-pointer shadow-xs border ${
              currentTab === 'dashboard'
                ? 'bg-sky-50 border-sky-200 text-sky-700 font-extrabold'
                : 'bg-slate-900 border-slate-950 text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-sky-400" />
            <span>Login Access</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                currentTab === item.id
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="h-px bg-slate-100 my-3"></div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setCurrentTab('dashboard');
            }}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-400" />
              <span>Login Access</span>
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
};
