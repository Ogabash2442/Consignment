import React, { useState } from 'react';
import { Mail, PhoneCall, Building, Clock, CheckCircle, Sparkles, Navigation } from 'lucide-react';
import { useLogistics } from '../LogisticsContext';

export const ContactSection: React.FC<{ onContactRegistered: () => void }> = ({ onContactRegistered }) => {
  const { sendUserMessage } = useLogistics();

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMsg) return;

    // Send the message directly into our live chat logs so it appears instantly for operator previewing in real-time!
    const generatedUserId = `inquirer_${formName.replace(/\s+/g, '_').toLowerCase()}_${Math.floor(Math.random() * 900 + 100)}`;
    sendUserMessage(
      generatedUserId, 
      `Inquiry message: From Corporate Contact Form (${formCompany || 'N/A'}). Message: ${formMsg}`, 
      formName, 
      formEmail
    );

    setSubmitted(true);
    setTimeout(() => {
      onContactRegistered();
      // Back to default states
      setFormName('');
      setFormEmail('');
      setFormCompany('');
      setFormMsg('');
      setSubmitted(false);
    }, 4500); // 4.5 seconds showcase alert success banner before routing
  };

  return (
    <section className="py-20 bg-slate-50 font-sans text-left relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-slate-200/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Header headings */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase bg-sky-100/50 border border-sky-100 rounded-full px-3 py-1">
            24/7 Global Liaison
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2.5">
            Connect with our Dispatch Offices
          </h2>
          <p className="text-sm font-light text-slate-500 mt-3 leading-relaxed">
            Reach out to our air or marine cargo controllers, broker desks, or coordinate immediate cold-chain custom retrievals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left panel: Info directories & SVG map */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Contact methods */}
            <div className="space-y-4">
              
              <div className="flex items-start gap-4 p-4 bg-white border border-slate-150/50 rounded-2xl shadow-xs">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 border flex-shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide">Hotline Routing Phone</h4>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-1">+41 44 200 4880</p>
                  <span className="text-[10px] text-slate-400 font-light block mt-0.5">Zurich Control Station Desk</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white border border-slate-150/50 rounded-2xl shadow-xs">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 border flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide">Secure Broker Queries</h4>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-1">dispatch@apex-logistics.ch</p>
                  <span className="text-[10px] text-slate-400 font-light block mt-0.5">Customs electronic broker queue</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white border border-slate-150/50 rounded-2xl shadow-xs">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 border flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide">Operating Clearances</h4>
                  <p className="text-sm font-semibold text-slate-700 mt-1">24 hours / 365 days continuous</p>
                  <span className="text-[10px] text-slate-400 font-light block mt-0.5">Satellite controllers on shift rotation</span>
                </div>
              </div>

            </div>

            {/* Strategic Office Locations Cards */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Main hub offices</h4>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-light text-slate-650">
                <div className="p-3.5 bg-white border rounded-xl">
                  <strong className="block font-bold text-slate-800">Zurich Terminal (HQ)</strong>
                  <span className="block mt-1 font-sans text-[11px] leading-relaxed">Kloten Airport Freight Zone 4, Switzerland</span>
                </div>
                <div className="p-3.5 bg-white border rounded-xl">
                  <strong className="block font-bold text-slate-800">Tokyo Terminal</strong>
                  <span className="block mt-1 font-sans text-[11px] leading-relaxed">Ohi Container Yard Staging, Japan</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Modern Contact Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative">
            <div className="absolute top-0 right-10 h-1 w-20 bg-emerald-500 rounded-b-full"></div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Message Dispatched Securely</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Excellent, <strong className="font-semibold text-slate-800">{formName}</strong>. Your inquiry has been routed as an active Support Thread inside our Dispatcher dashboard and queued for immediate telemetry review.
                </p>
                <div className="text-[10px] text-sky-600 font-mono animate-pulse font-bold mt-2 uppercase tracking-widest flex items-center justify-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading Dispatch Live Board...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5 text-xs text-left">
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">Liaison Request Form</h3>
                <p className="text-xs text-slate-500 leading-normal font-light">Fields are instantly synchronized into our Support desk system so controllers can review without reload wait times.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Officer Calling Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Robert Vance"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 px-3.5 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. r.vance@vance.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 px-3.5 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Company / Organization name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Vance Refrigeration"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 px-3.5 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Message Description</label>
                  <textarea
                    required
                    placeholder="Describe your cargo, priority speed requirements, or billing inquiries..."
                    value={formMsg}
                    onChange={(e) => setFormMsg(e.target.value)}
                    className="w-full h-24 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 p-3.5 outline-none resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-805 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Submit Inquiry Profile</span>
                  <Navigation className="h-4.5 w-4.5 text-sky-400 rotate-90" />
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
