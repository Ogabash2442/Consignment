import React from 'react';
import { ShieldCheck, Crosshair, Award, Eye, Globe2, Sparkles, Building2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white font-sans text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase bg-sky-100/50 border border-sky-100 rounded-full px-3 py-1">
              About Apex Global
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Bridging International Trade with Unlocked Velocity & IoT Security
            </h2>
            <p className="text-sm font-light text-slate-500 leading-relaxed">
              Founded at Zurich Kloten in 2012, Apex Global Logistics has pioneered cloud-native, micro-tracked transit lines combining biometric container lockers, dual thermal insulation panels, and active IoT sensors to guard high-value assets across maritime and air trade guilds.
            </p>
            <p className="text-sm font-light text-slate-500 leading-relaxed">
              We manage more than 140 terminal distribution facilities spanning 42 sovereign borders. Our focus is absolute performance and accountability, resolving custom border clearances in under 18 minutes on average.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Globe2 className="h-5 w-5 text-sky-500" />
                <span className="block font-heading font-bold text-sm text-slate-800 mt-2">126 Corridors</span>
                <span className="block text-xs text-slate-400 font-light mt-0.5">Maritime and aviation lanes</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Building2 className="h-5 w-5 text-sky-500" />
                <span className="block font-heading font-bold text-sm text-slate-800 mt-2">140 Facilities</span>
                <span className="block text-xs text-slate-400 font-light mt-0.5">Climatized premium depots</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl relative">
              {/* High-quality warehouse logistics visual */}
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
                alt="Apex smart warehousing"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center opacity-70 mix-blend-multiply transition-transform hover:scale-102 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {/* Interactive sticker overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-white text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">Zurich Aviation staging terminal</span>
                <p className="text-xs font-light mt-1 text-slate-200">Daily trans-continental charters depart directly with computerized customs pre-audits.</p>
              </div>
            </div>

            {/* Glowing background decor circles */}
            <div className="absolute -z-10 -right-6 -bottom-6 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl" />
          </div>
        </div>

        {/* Corporate core vision & values */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 sm:p-12">
          <div className="max-w-2xl text-left space-y-3 mb-10">
            <span className="text-[10px] font-bold tracking-widest text-sky-600 uppercase">Operational tenets</span>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Our Anchor Commitments</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                icon: ShieldCheck,
                title: 'High-Value Integrity',
                desc: 'Utilizing biometric locker seals and continuous dual tracking checklists on all priority sky waybills.'
              },
              {
                icon: Crosshair,
                title: 'Precision Dispatch',
                desc: 'Conserving transit schedules within ±15 minute release windows across overland networks.'
              },
              {
                icon: Award,
                title: 'Professional Bonded Broker',
                desc: 'Autonomous customs integration API lines bypass slow physical border clearance queues.'
              },
              {
                icon: Eye,
                title: 'Absolute Transparency',
                desc: 'Providing micro-data telemetry on core temperature, humidity, and location coordinate readouts.'
              }
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="space-y-3.5 bg-white p-5 rounded-2xl border border-slate-100/50 hover:shadow-md transition-shadow">
                  <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center p-2 border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-slate-850 text-sm">{v.title}</h4>
                    <p className="text-xs font-light text-slate-500 mt-1 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone historic progression */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-heading text-xl font-bold text-slate-900 inline-flex items-center gap-1.5 justify-center">
              <Sparkles className="h-4.5 w-4.5 text-sky-500" />
              <span>Expansion Timeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Twelve years of specialized logistics development hubs.</p>
          </div>

          <div className="relative border-l border-slate-100 pl-6 space-y-6 max-w-2xl mx-auto text-left">
            {[
              { year: '2012', title: 'Foundation Staging Kloten', desc: 'Bootstrap air freight sorting center next to Zurich ZRH Terminal Airport.' },
              { year: '2016', title: 'Maritime Liners Alliance', desc: 'Secure ocean freight shipping agreement across Rotterdam, HK, and LA ports.' },
              { year: '2021', title: 'IoT Core Telemetry Launch', desc: 'Active container sensor tracking system with biometric verification launches.' },
              { year: '2026', title: 'Omnipresent Bond Broker Connect', desc: 'Paperless clearance protocols clearance, deploying global micro service APIs.' }
            ].map((time) => (
              <div key={time.year} className="relative">
                <span className="absolute -left-10 top-0 text-xs font-heading font-bold text-sky-600 font-mono bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-md">
                  {time.year}
                </span>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">{time.title}</h4>
                <p className="text-xs font-light text-slate-500 leading-relaxed mt-1">{time.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Cards Section */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-heading text-xl font-bold text-slate-900">Founding Board of Directors</h3>
            <p className="text-xs text-slate-450 mt-1 font-light">Combining sixty years of trade, aviation, and cold-chain compliance experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Klementina Vane',
                role: 'Chief Navigation Officer',
                bio: 'Ex-Aviation Cargo Lead CDG CDG/AMS terminals.',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
              },
              {
                name: 'Dr. Beat Werner',
                role: 'Laison Control Director',
                bio: 'Biologist & trade attorney Zurich customs board.',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
              },
              {
                name: 'Yukihiro Sato',
                role: 'Maritime Fleet Dispatcher',
                bio: 'Former Harbor Master staging lines Keihin Port Tokyo.',
                image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
              }
            ].map((lead) => (
              <div key={lead.name} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 text-center flex flex-col items-center">
                <img
                  src={lead.image}
                  alt={lead.name}
                  referrerPolicy="no-referrer"
                  className="h-18 w-18 rounded-full object-cover object-center border-2 border-white shadow-md mb-4 bg-slate-350"
                />
                <h4 className="font-heading text-sm font-bold text-slate-900 leading-tight">{lead.name}</h4>
                <span className="text-[10px] text-sky-650 font-semibold uppercase block mt-1 tracking-wider">{lead.role}</span>
                <p className="text-xs text-slate-450 font-light mt-3 leading-normal px-2">{lead.bio}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
