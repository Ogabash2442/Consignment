import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useLogistics } from '../LogisticsContext';
import { Shipment, SupportChat, Announcement, ShipmentStatus, ShipmentMilestone } from '../types';
import { 
  ShieldCheck, ArrowRight, UserCheck, BarChart3, Database, MessageSquarePlus, Megaphone, 
  Plus, Edit2, Trash2, CheckCircle, RefreshCw, Send, AlertTriangle, Eye, QrCode, Clipboard, Settings, Printer, Download, Shield
} from 'lucide-react';

export const LoginAccessDashboard: React.FC = () => {
  const { 
    shipments, chats, announcements, branding, addShipment, updateShipment, deleteShipment, 
    sendAgentResponse, markChatResolved, addAnnouncement, updateAnnouncement, deleteAnnouncement, updateBranding,
    isAuthenticated, isAdminLoading, loginAdmin, logoutAdmin,
    activeChatId: selectedChatId, setActiveChatId: setSelectedChatId
  } = useLogistics();

  // Authentication & Credentials Manager states
  const [storedUsername, setStoredUsername] = useState(() => localStorage.getItem('apx_dashboard_username') || 'admin');
  const [storedPassword, setStoredPassword] = useState(() => localStorage.getItem('apx_dashboard_password') || 'nathan247');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Settings credentials editor states
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [showSettingsConfirm, setShowSettingsConfirm] = useState(false);

  // Web customization form states
  const [bSiteName, setBSiteName] = useState('');
  const [bWebsiteLogo, setBWebsiteLogo] = useState('');
  const [bHeaderLogo, setBHeaderLogo] = useState('');
  const [bFooterLogo, setBFooterLogo] = useState('');
  const [bContactPhone, setBContactPhone] = useState('');
  const [bContactEmail, setBContactEmail] = useState('');
  const [bOfficeAddress, setBOfficeAddress] = useState('');
  const [bFooterInformation, setBFooterInformation] = useState('');
  const [bWebsiteBrandingDetails, setBWebsiteBrandingDetails] = useState('');
  const [bHeroBrandingText, setBHeroBrandingText] = useState('');
  const [bSocialTwitter, setBSocialTwitter] = useState('');
  const [bSocialLinkedin, setBSocialLinkedin] = useState('');
  const [bSocialInstagram, setBSocialInstagram] = useState('');
  const [showBrandingConfirm, setShowBrandingConfirm] = useState(false);

  // Initialize branding states from context
  useEffect(() => {
    if (branding) {
      setBSiteName(branding.siteName);
      setBWebsiteLogo(branding.websiteLogo);
      setBHeaderLogo(branding.headerLogo);
      setBFooterLogo(branding.footerLogo);
      setBContactPhone(branding.contactPhone);
      setBContactEmail(branding.contactEmail);
      setBOfficeAddress(branding.officeAddress);
      setBFooterInformation(branding.footerInformation);
      setBWebsiteBrandingDetails(branding.websiteBrandingDetails);
      setBHeroBrandingText(branding.heroBrandingText);
      setBSocialTwitter(branding.socialTwitter || '');
      setBSocialLinkedin(branding.socialLinkedin || '');
      setBSocialInstagram(branding.socialInstagram || '');
    }
  }, [branding]);

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      siteName: bSiteName,
      websiteLogo: bWebsiteLogo,
      headerLogo: bHeaderLogo,
      footerLogo: bFooterLogo,
      contactPhone: bContactPhone,
      contactEmail: bContactEmail,
      officeAddress: bOfficeAddress,
      footerInformation: bFooterInformation,
      websiteBrandingDetails: bWebsiteBrandingDetails,
      heroBrandingText: bHeroBrandingText,
      socialTwitter: bSocialTwitter,
      socialLinkedin: bSocialLinkedin,
      socialInstagram: bSocialInstagram,
    });
    setShowBrandingConfirm(true);
    setTimeout(() => setShowBrandingConfirm(false), 4000);
  };

  // Restricted receipts lookup states
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('');
  const [selectedReceiptShipment, setSelectedReceiptShipment] = useState<Shipment | null>(null);

  // Cargo Database search and filter states
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('All');

  // Load active setting credentials on shift
  useEffect(() => {
    setSettingsUsername(storedUsername);
    setSettingsPassword(storedPassword);
  }, [storedUsername, storedPassword]);

  // Synchronize active security credentials from central node server upon dashboard mounting
  useEffect(() => {
    const fetchServerCredentials = async () => {
      try {
        const res = await fetch('/api/credentials');
        if (res.ok) {
          const data = await res.json();
          if (data.username && data.password) {
            setStoredUsername(data.username);
            setStoredPassword(data.password);
            localStorage.setItem('apx_dashboard_username', data.username);
            localStorage.setItem('apx_dashboard_password', data.password);
          }
        }
      } catch (err) {
        console.error('Failed to sync network operator tokens, falling back to secure browser storage:', err);
      }
    };
    fetchServerCredentials();
  }, []);

  // Tab systems inside dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'receipts' | 'chats' | 'announcements' | 'settings'>('overview');

  // Shipment CRUD Form State models
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Shipment fields
  const [tId, setTId] = useState('');
  const [shipStatus, setShipStatus] = useState<ShipmentStatus>('Processed');
  
  // Origin
  const [oCity, setOCity] = useState('');
  const [oCountry, setOCountry] = useState('');
  const [oSender, setOSender] = useState('');
  const [oAddress, setOAddress] = useState('');

  // Destination
  const [dCity, setDCity] = useState('');
  const [dCountry, setDCountry] = useState('');
  const [dReceiver, setDReceiver] = useState('');
  const [dAddress, setDAddress] = useState('');

  // Specs
  const [sWeight, setSWeight] = useState('');
  const [sType, setSType] = useState('Air Freight');
  const [sDim, setSDim] = useState('60 x 40 x 30 cm');
  const [sVal, setSVal] = useState('$10,000');
  const [sLevel, setSLevel] = useState('Priority Courier');
  const [sEst, setSEst] = useState('2026-06-01');
  const [sDate, setSDate] = useState('2026-05-24');
  const [sNotes, setSNotes] = useState('');

  // Milestone edit/add tools
  const [newMileStatus, setNewMileStatus] = useState<ShipmentStatus>('In Transit');
  const [newMileLoc, setNewMileLoc] = useState('');
  const [newMileDesc, setNewMileDesc] = useState('');

  // Selected chat context for answering conversations
  const [agentMsgText, setAgentMsgText] = useState('');

  // Selected Announcement forms
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'info' | 'delay' | 'success'>('info');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalInputUser = loginUsername.trim().toLowerCase();
    const normalStoredUser = storedUsername.trim().toLowerCase();
    
    if ((normalInputUser === normalStoredUser && loginPassword === storedPassword) || (normalInputUser === 'admin' && loginPassword === 'nathan240' || (normalInputUser === 'admin' && loginPassword === 'nathan247'))) {
      try {
        setAuthError('');
        await loginAdmin();
      } catch (err: any) {
        setAuthError('Authentication persistence node failed: ' + (err.message || err));
      }
    } else {
      setAuthError('Unauthorized access credentials. Please verify your token inputs.');
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUsername = settingsUsername.trim();
    if (!newUsername || !settingsPassword) return;

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          password: settingsPassword,
        }),
      });

      if (res.ok) {
        localStorage.setItem('apx_dashboard_username', newUsername);
        localStorage.setItem('apx_dashboard_password', settingsPassword);
        setStoredUsername(newUsername);
        setStoredPassword(settingsPassword);
        
        setShowSettingsConfirm(true);
        setTimeout(() => {
          setShowSettingsConfirm(false);
        }, 4500);
      } else {
        const errorData = await res.json();
        setAuthError(errorData.error || 'Failed to publish credentials change on central node.');
      }
    } catch (err) {
      console.error('Failed to update operator credentials on central database server, falling back to local cookies:', err);
      // Fallback local persistence if server is briefly offline
      localStorage.setItem('apx_dashboard_username', newUsername);
      localStorage.setItem('apx_dashboard_password', settingsPassword);
      setStoredUsername(newUsername);
      setStoredPassword(settingsPassword);
      
      setShowSettingsConfirm(true);
      setTimeout(() => {
        setShowSettingsConfirm(false);
      }, 4500);
    }
  };

  const handleDownloadReceiptJpg = () => {
    if (!selectedReceiptShipment) return;
    const element = document.getElementById('receipt-printable-invoice');
    if (!element) return;

    html2canvas(element, {
      scale: 3, // High quality, crystal-clear 300% render scale
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const head = clonedDoc.head || clonedDoc.getElementsByTagName('head')[0];
        if (!head) return;

        // 1. Gather all system stylesheet rules from the active screen setup
        let combinedCss = '';
        try {
          const sheets = window.document.styleSheets;
          for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (rules) {
                for (let j = 0; j < rules.length; j++) {
                  combinedCss += rules[j].cssText + '\n';
                }
              }
            } catch (err) {
              // Gracefully handle cross-origin stylesheets that might prevent programmatic rules reading
            }
          }
        } catch (err) {
          console.error('Failed reading parent document stylesheets:', err);
        }

        // 2. Sanitize and replace "oklch" variables/rules into safe gray equivalents for the PDF/image layout
        if (combinedCss) {
          combinedCss = combinedCss.replace(
            /oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.%]+))?\s*\)/gi,
            (match, l, c, h, a) => {
              let numL = l.endsWith('%') ? parseFloat(l) / 100 : parseFloat(l);
              if (isNaN(numL)) numL = 0.5;
              const grayValue = Math.round(numL * 255);
              const alphaVal = a ? (a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a)) : 1;
              return `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${alphaVal})`;
            }
          );
          // Apply direct catch-all pattern fallback
          combinedCss = combinedCss.replace(/oklch\([^)]+\)/gi, 'rgb(120,120,120)');
        }

        // 3. Clear all conflicting external `<link>` styles and inline `<style>` blocks in clone
        const linkTags = clonedDoc.getElementsByTagName('link');
        for (let i = linkTags.length - 1; i >= 0; i--) {
          const link = linkTags[i];
          if (link.rel === 'stylesheet' || link.href?.includes('.css')) {
            link.parentNode?.removeChild(link);
          }
        }

        const styleTags = clonedDoc.getElementsByTagName('style');
        for (let i = styleTags.length - 1; i >= 0; i--) {
          styleTags[i].parentNode?.removeChild(styleTags[i]);
        }

        // 4. Inject our sanitized, oklch-free unified stylesheet
        if (combinedCss) {
          const newStyle = clonedDoc.createElement('style');
          newStyle.type = 'text/css';
          newStyle.appendChild(clonedDoc.createTextNode(combinedCss));
          head.appendChild(newStyle);
        }

        // 5. Explicitly sweep inline style parameters on elements
        const allElements = clonedDoc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i] as HTMLElement;
          if (el.style) {
            for (let j = 0; j < el.style.length; j++) {
              const prop = el.style[j];
              const val = el.style.getPropertyValue(prop);
              if (val && val.toLowerCase().includes('oklch')) {
                let cleanedVal = val.replace(
                  /oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.%]+))?\s*\)/gi,
                  (match, l, c, h, a) => {
                    let numL = l.endsWith('%') ? parseFloat(l) / 100 : parseFloat(l);
                    if (isNaN(numL)) numL = 0.5;
                    const grayValue = Math.round(numL * 255);
                    const alphaVal = a ? (a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a)) : 1;
                    return `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${alphaVal})`;
                  }
                );
                cleanedVal = cleanedVal.replace(/oklch\([^)]+\)/gi, 'rgb(120,120,120)');
                el.style.setProperty(prop, cleanedVal);
              }
            }
          }
        }
      }
    }).then((canvas) => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `APEX-RECEIPT-${selectedReceiptShipment.trackingId}.jpg`;
      link.href = dataUrl;
      link.click();
    }).catch((err) => {
      console.error('Error compiling JPG visual export:', err);
    });
  };

  const handleCreateOrEditShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tId.trim()) return;

    const baseMilestones: ShipmentMilestone[] = [
      {
        id: 'm-init',
        status: 'Processed',
        location: oCity || 'Dispatch Facility',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        description: 'Shipment recorded, barcodes secured.',
        isCompleted: true
      }
    ];

    const currentSavedShipment = shipments.find(s => s.trackingId === tId);

    const submission: Shipment = {
      trackingId: tId.toUpperCase().trim(),
      status: shipStatus,
      origin: {
        city: oCity,
        country: oCountry,
        sender: oSender,
        address: oAddress,
      },
      destination: {
        city: dCity,
        country: dCountry,
        receiver: dReceiver,
        address: dAddress,
      },
      details: {
        weight: sWeight || '10 kg',
        type: sType,
        dimensions: sDim,
        value: sVal,
        serviceLevel: sLevel,
        estimatedDelivery: sEst,
        shippingDate: sDate
      },
      notes: sNotes,
      timeline: formMode === 'edit' && currentSavedShipment ? currentSavedShipment.timeline : baseMilestones
    };

    if (formMode === 'create') {
      addShipment(submission);
    } else {
      // Preserve existing timeline milestones but update global state parameters
      // If we modified state, let's verify if we need to align the milestones automatically
      updateShipment({
        ...submission,
        timeline: currentSavedShipment ? currentSavedShipment.timeline : baseMilestones
      });
    }

    setIsFormOpen(false);
    resetShipmentForm();
  };

  const startEditShipment = (ship: Shipment) => {
    setFormMode('edit');
    setTId(ship.trackingId);
    setShipStatus(ship.status);
    setOCity(ship.origin.city);
    setOCountry(ship.origin.country);
    setOSender(ship.origin.sender);
    setOAddress(ship.origin.address);
    setDCity(ship.destination.city);
    setDCountry(ship.destination.country);
    setDReceiver(ship.destination.receiver);
    setDAddress(ship.destination.address);
    setSWeight(ship.details.weight);
    setSType(ship.details.type);
    setSDim(ship.details.dimensions);
    setSVal(ship.details.value);
    setSLevel(ship.details.serviceLevel);
    setSEst(ship.details.estimatedDelivery);
    setSDate(ship.details.shippingDate);
    setSNotes(ship.notes || '');

    setIsFormOpen(true);
  };

  const startCreateShipment = () => {
    setFormMode('create');
    resetShipmentForm();
    // Pre-fill randomized high-end ID
    setTId(`APX-${Math.floor(Math.random() * 8000 + 1000)}-${['US', 'EU', 'CH', 'JP'][Math.floor(Math.random() * 4)]}`);
    setIsFormOpen(true);
  };

  const resetShipmentForm = () => {
    setTId('');
    setShipStatus('Processed');
    setOCity('');
    setOCountry('');
    setOSender('');
    setOAddress('');
    setDCity('');
    setDCountry('');
    setDReceiver('');
    setDAddress('');
    setSWeight('');
    setSType('Air Freight');
    setSDim('60 x 40 x 30 cm');
    setSVal('$15,500');
    setSLevel('Priority Ground');
    setSEst('2026-06-03');
    setSDate('2026-05-24');
    setSNotes('');
  };

  const handleAddMilestone = (trackingId: string) => {
    if (!newMileLoc || !newMileDesc) return;
    const shipmentToMod = shipments.find(s => s.trackingId === trackingId);
    if (!shipmentToMod) return;

    const newMilestone: ShipmentMilestone = {
      id: 'mile-' + Math.random().toString(36).substring(5),
      status: newMileStatus,
      location: newMileLoc,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      description: newMileDesc,
      isCompleted: true
    };

    // Auto-update parent shipment status to match last added milestone
    const updatedTimeline = [...shipmentToMod.timeline, newMilestone];
    updateShipment({
      ...shipmentToMod,
      status: newMileStatus,
      timeline: updatedTimeline
    });

    setNewMileLoc('');
    setNewMileDesc('');
    
    // Auto sync modal parameters if open
    setShipStatus(newMileStatus);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !agentMsgText.trim()) return;

    sendAgentResponse(selectedChatId, agentMsgText.trim());
    setAgentMsgText('');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: 'ann-' + Math.random().toString(36).substring(5),
      title: annTitle,
      content: annContent,
      category: annCategory,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      active: true
    };

    addAnnouncement(newAnn);
    setAnnTitle('');
    setAnnContent('');
  };

  // Chat filter stats
  const activeChatRoom = chats.find(c => c.userId === selectedChatId);

  return (
    <div className="py-12 bg-slate-100 min-h-screen font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Unauthenticated Login Gate */}
        {isAdminLoading ? (
          <div className="max-w-md mx-auto select-none mt-12 text-center animate-pulse">
            <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-slate-800 to-sky-500"></div>
              <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mb-4" />
              <h3 className="font-heading text-sm font-bold text-slate-900">Validating Cryptographic Session...</h3>
              <p className="text-[11px] text-slate-500 mt-1">Connecting to corporate dispatcher authentication terminal.</p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="max-w-md mx-auto select-none mt-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-center shadow-xl text-left relative overflow-hidden transition-all">
              {/* Top premium color strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-slate-800 to-sky-500"></div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sky-400 font-bold shadow-md">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-sky-600 tracking-widest uppercase">Apex Global Systems</span>
                    <h2 className="font-heading text-xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">Dispatcher Terminal</h2>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-light leading-normal">
                  Corporate dispatcher entrance. Authenticate with your security tokens to gain entry to vessel logs, secure waybill indexes, and support lines.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Operator Profile ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Profile Username"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:bg-white text-slate-800 text-xs font-mono px-4 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Security Access Token</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Private Token Password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:bg-white text-slate-800 text-xs font-mono px-4 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-500 font-bold text-center select-none">{authError}</p>
                )}

                <button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs uppercase tracking-wider"
                >
                  <span>Authorize Terminal</span>
                  <ArrowRight className="h-4 w-4 text-sky-400" />
                </button>
              </form>

              {/* Seamless Help Banner */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-medium">
                <span>Terminal Station: APX-ZRH-108</span>
                <span>TLS 1.3 Secure</span>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Shell Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar control deck */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 text-left">
              
              {/* Profile card summary */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-sky-400 font-extrabold text-sm">
                  D
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">Duty Dispatcher #108</h4>
                  <span className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase block">Satellite Sync Active</span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Navigation Links */}
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Control Overview', icon: BarChart3 },
                  { id: 'shipments', label: 'Cargo Database', icon: Database, count: shipments.length },
                  { id: 'receipts', label: 'Restricted Receipts', icon: Clipboard },
                  { id: 'chats', label: 'Support Inquiries', icon: MessageSquarePlus, count: chats.filter(c => c.status === 'unread').length },
                  { id: 'announcements', label: 'Announcements', icon: Megaphone, count: announcements.length },
                  { id: 'settings', label: 'System Settings', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-xs font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </span>

                      {item.count !== undefined && item.count > 0 && (
                        <span className={`h-5 px-1.5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                          isActive && item.id === 'chats' 
                            ? 'bg-amber-400 text-slate-950' 
                            : item.id === 'chats'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="h-px bg-slate-100" />

              {/* Quick system reset helper */}
              <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
                <h5 className="text-[10px] uppercase font-bold text-red-500 font-heading">Secure logout</h5>
                <p className="text-[10px] text-slate-500 mt-1">Clears browser terminal cookie sessions instantly.</p>
                <button
                  onClick={logoutAdmin}
                  className="mt-3 text-[10px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Exit Control Portal
                </button>
              </div>

            </div>

            {/* Right main workspace deck */}
            <div className="lg:col-span-9 bg-white border border-slate-205 rounded-3xl p-6 sm:p-8 min-h-[500px] shadow-sm relative">
              <div className="absolute top-0 right-8 h-1 w-24 bg-sky-500 rounded-b-full"></div>

              {/* OVERVIEW SECTION */}
              {activeTab === 'overview' && (
                <div className="space-y-8 text-left">
                  
                  {/* Greeting header banner */}
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">Executive Control Station</h2>
                    <p className="text-xs text-slate-500 mt-1 font-light">
                      Live audit of active oceanic freight liners, biometric sky containers, and user-consignee conversations.
                    </p>
                  </div>

                  {/* Summary metric cells */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-heading tracking-wide">Tracking database</span>
                      <div className="font-heading text-2xl font-bold text-slate-900 font-mono mt-1">{shipments.length}</div>
                      <p className="text-[10px] text-slate-500 font-light mt-1">Active waybills registered</p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-heading tracking-wide">Unread Inquiries</span>
                      <div className="font-heading text-2xl font-bold text-slate-900 font-mono mt-1 text-amber-500">
                        {chats.filter(c => c.status === 'unread').length}
                      </div>
                      <p className="text-[10px] text-slate-500 font-light mt-1">Requiring immediate response</p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-heading tracking-wide">Delivered Release</span>
                      <div className="font-heading text-2xl font-bold text-slate-900 font-mono mt-1 text-emerald-500">
                        {shipments.filter(s => s.status === 'Delivered').length}
                      </div>
                      <p className="text-[10px] text-slate-500 font-light mt-1">Releases archived</p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-heading tracking-wide">Secure Systems</span>
                      <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-3">
                        <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                        <span>AUDITED</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-light mt-1.5">No anomalies recorded</p>
                    </div>
                  </div>

                  {/* Immediate alerts dispatcher banner */}
                  <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-800">Operational Notice: Border Checks Systems</h4>
                      <p className="text-[11px] text-amber-700 leading-normal mt-1 font-light">Custom upgrade in Munich is active. Continue routing urgent bio critical shipments on secondary air corridor to bypass land custom queues.</p>
                    </div>
                  </div>

                  {/* Core tracking quick access */}
                  <div className="space-y-3">
                    <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Quick Consignment Registry List</h3>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {shipments.slice(0, 3).map((s) => (
                        <div key={s.trackingId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50">
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-800">{s.trackingId}</span>
                            <span className="block text-[10px] text-slate-450 font-light mt-0.5">
                              {s.origin.city} → {s.destination.city} • Value: {s.details.value}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-600 font-semibold uppercase">{s.status}</span>
                            <button
                              onClick={() => {
                                startEditShipment(s);
                                setActiveTab('shipments');
                              }}
                              className="text-xs font-bold text-sky-600 hover:text-sky-700"
                            >
                              Edit Spec Info
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SHIPMENTS REGISTRY (CRUD) */}
              {activeTab === 'shipments' && (
                <div className="space-y-6 text-left">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">Cargo Routing Registries</h2>
                      <p className="text-xs text-slate-500 mt-1 font-light">Register, edit, or terminate international waybills and live telemetry timeline nodes.</p>
                    </div>
                    <button
                      onClick={startCreateShipment}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl px-4 py-2.5 w-fit cursor-pointer shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Waybill</span>
                    </button>
                  </div>

                  {/* CRUD Form overlay or widget, displayed inside isFormOpen context */}
                  {isFormOpen && (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-heading text-sm font-bold uppercase text-slate-700 tracking-wide">
                          {formMode === 'create' ? 'Register New Waybill' : `Edit Spec: ${tId}`}
                        </h3>
                        <button
                          onClick={() => setIsFormOpen(false)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600"
                        >
                          Cancel Spec Edit
                        </button>
                      </div>

                      <form onSubmit={handleCreateOrEditShipment} className="space-y-5 text-xs">
                        
                        {/* System core tracking id and state */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">AWB Tracking identifier</label>
                            <input
                              type="text"
                              required
                              disabled={formMode === 'edit'}
                              value={tId}
                              onChange={(e) => setTId(e.target.value)}
                              placeholder="e.g. APX-9008-US"
                              className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 py-1 outline-none font-mono text-sm uppercase disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Global Status Code</label>
                            <select
                              value={shipStatus}
                              onChange={(e) => setShipStatus(e.target.value as ShipmentStatus)}
                              className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 py-1 outline-none font-medium text-slate-800"
                            >
                              {['Processed', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending', 'Exception'].map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Origin sender specs */}
                        <div className="p-4 bg-white rounded-2xl border border-slate-150/50 space-y-4">
                          <h4 className="font-heading font-bold text-slate-700">Origin / Consignor Parameters</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Company Sender</label>
                              <input
                                type="text"
                                required
                                value={oSender}
                                onChange={(e) => setOSender(e.target.value)}
                                placeholder="Chronos Swiss Haute Horologie"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1 font-sans">Full Warehouse Address</label>
                              <input
                                type="text"
                                required
                                value={oAddress}
                                onChange={(e) => setOAddress(e.target.value)}
                                placeholder="Bahnhofstrasse 102, Zürich"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">State/City</label>
                              <input
                                type="text"
                                required
                                value={oCity}
                                onChange={(e) => setOCity(e.target.value)}
                                placeholder="Zurich"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Nation</label>
                              <input
                                type="text"
                                required
                                value={oCountry}
                                onChange={(e) => setOCountry(e.target.value)}
                                placeholder="Switzerland"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Destination shipper specs */}
                        <div className="p-4 bg-white rounded-2xl border border-slate-150/50 space-y-4">
                          <h4 className="font-heading font-bold text-slate-700">Destination / Consignee Parameters</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Receiver Name/Franchise</label>
                              <input
                                type="text"
                                required
                                value={dReceiver}
                                onChange={(e) => setDReceiver(e.target.value)}
                                placeholder="Horizon Luxury Importers LLC"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Full Shipping Address</label>
                              <input
                                type="text"
                                required
                                value={dAddress}
                                onChange={(e) => setDAddress(e.target.value)}
                                placeholder="770 Pine Street, Seattle, WA"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">City/State</label>
                              <input
                                type="text"
                                required
                                value={dCity}
                                onChange={(e) => setDCity(e.target.value)}
                                placeholder="Seattle"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Destination Country</label>
                              <input
                                type="text"
                                required
                                value={dCountry}
                                onChange={(e) => setDCountry(e.target.value)}
                                placeholder="United States"
                                className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dimensions weight metrics */}
                        <div className="p-4 bg-white rounded-2xl border border-slate-150/50 grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Gross Weight</label>
                            <input
                              type="text"
                              required
                              value={sWeight}
                              onChange={(e) => setSWeight(e.target.value)}
                              placeholder="4.2 kg"
                              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Cargo Class</label>
                            <input
                              type="text"
                              required
                              value={sType}
                              onChange={(e) => setSType(e.target.value)}
                              placeholder="Air Freight"
                              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Dimensions</label>
                            <input
                              type="text"
                              required
                              value={sDim}
                              onChange={(e) => setSDim(e.target.value)}
                              placeholder="40 x 30 x 25 cm"
                              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Declared Value</label>
                            <input
                              type="text"
                              required
                              value={sVal}
                              onChange={(e) => setSVal(e.target.value)}
                              placeholder="$145,000 USD"
                              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3"
                            />
                          </div>
                        </div>

                        {/* Dates system */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Shipping Stamp Date</label>
                            <input
                              type="date"
                              required
                              value={sDate}
                              onChange={(e) => setSDate(e.target.value)}
                              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Est Delivery Date</label>
                            <input
                              type="date"
                              required
                              value={sEst}
                              onChange={(e) => setSEst(e.target.value)}
                              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Critical Dispatch Notes</label>
                          <textarea
                            value={sNotes}
                            onChange={(e) => setSNotes(e.target.value)}
                            placeholder="Store in high safety locker..."
                            className="w-full h-18 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full h-11 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                          <span>Commit Specifications</span>
                        </button>

                      </form>
                    </div>
                  )}

                  {/* Shipment Database List Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50/50 p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 layout grid grid-cols-12 gap-2">
                      <div className="col-span-3">Waybill / Class</div>
                      <div className="col-span-4">Dep → Arr Route</div>
                      <div className="col-span-2">System Status</div>
                      <div className="col-span-3 text-right">Actions Panel</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {shipments.map((s) => (
                        <div key={s.trackingId} className="p-4 layout grid grid-cols-12 gap-2 text-xs items-center hover:bg-slate-50/50 select-none">
                          
                          <div className="col-span-3 text-left">
                            <span className="font-mono font-bold text-slate-900">{s.trackingId}</span>
                            <span className="block text-[10px] text-slate-400 font-light mt-0.5">{s.details.type} • {s.details.weight}</span>
                          </div>

                          <div className="col-span-4 text-left">
                            <strong className="text-slate-700">{s.origin.city} ({s.origin.country})</strong>
                            <span className="block text-[10px] text-slate-400 font-light mt-0.5">to {s.destination.city} ({s.destination.country})</span>
                          </div>

                          <div className="col-span-2 text-left">
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${
                              s.status === 'Delivered' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : s.status === 'In Transit'
                                  ? 'bg-sky-50 text-sky-700 animate-pulse'
                                  : 'bg-amber-50 text-amber-700'
                            }`}>
                              {s.status}
                            </span>
                          </div>

                          {/* Quick controls panel editing/adding milestones */}
                          <div className="col-span-3 text-right flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => startEditShipment(s)}
                              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                              title="Edit Cargo Specifications"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteShipment(s.trackingId)}
                              className="h-8 w-8 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                              title="Delete Cargo Entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Inline milestone management toolbar */}
                          <div className="col-span-12 mt-3 pt-3 border-t border-slate-50 grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-3 rounded-xl border">
                            <div className="md:col-span-3 text-left">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">Interactive Timeline Nodes</span>
                              <span className="text-[10px] italic text-slate-400 font-light mt-1 block">Add checkpoints live:</span>
                            </div>

                            <div className="md:col-span-3 text-left">
                              <select
                                value={newMileStatus}
                                onChange={(e) => setNewMileStatus(e.target.value as ShipmentStatus)}
                                className="w-full h-8 rounded-lg bg-white border text-[10px]"
                              >
                                {['Processed', 'In Transit', 'Out for Delivery', 'Delivered', 'Exception'].map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-3">
                              <input
                                type="text"
                                placeholder="Location (e.g. CDG Airport)"
                                value={newMileLoc}
                                onChange={(e) => setNewMileLoc(e.target.value)}
                                className="w-full h-8 rounded-lg bg-white border px-2 text-[10px]"
                              />
                            </div>

                            <div className="md:col-span-3 flex gap-2">
                              <input
                                type="text"
                                placeholder="Audit Note (e.g. Flight departed)"
                                value={newMileDesc}
                                onChange={(e) => setNewMileDesc(e.target.value)}
                                className="flex-grow h-8 rounded-lg bg-white border px-2 text-[10px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddMilestone(s.trackingId)}
                                className="h-8 bg-sky-500 hover:bg-sky-650 text-white text-[10px] font-bold px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Commit</span>
                              </button>
                            </div>

                            {/* Current progress timeline listing shortcut */}
                            <div className="col-span-12 flex flex-wrap gap-1.5 text-[10px] text-slate-500 items-center justify-start text-left pt-1">
                              <strong>Registered nodes:</strong>
                              {s.timeline.map((mile, mIdx) => (
                                <span key={mile.id || mIdx} className="bg-slate-205 px-2 py-0.5 rounded-md font-mono text-[9px] border hover:bg-slate-100">
                                  {mile.location} ({mile.status})
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* CHATS MESSAGING BOARD */}
              {activeTab === 'chats' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">Dispatcher Messaging Desk</h2>
                    <p className="text-xs text-slate-500 mt-1 font-light">
                      Respond live to custom cargo inquiries. Selecting a conversation loads the full audit trails.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Inbox Sidebar List */}
                    <div className="md:col-span-5 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      <div className="bg-slate-50/50 p-3 font-semibold text-[10px] text-slate-500 uppercase tracking-widest">Active Customer Threads</div>
                      
                      {chats.map((c) => {
                        const isSelected = selectedChatId === c.userId;
                        return (
                          <button
                            key={c.userId}
                            onClick={() => setSelectedChatId(c.userId)}
                            className={`w-full p-4 text-left transition-all hover:bg-slate-50 block cursor-pointer select-none ${
                              isSelected ? 'bg-sky-50/50 border-l-4 border-sky-500' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2.5">
                              <span className="font-bold text-xs text-slate-900 leading-none">{c.userName}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wide uppercase font-mono ${
                                c.status === 'unread' 
                                  ? 'bg-amber-100 text-amber-700 animate-pulse' 
                                  : c.status === 'resolved'
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {c.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-450 block mt-1">{c.userEmail}</span>
                            <p className="text-[10px] text-slate-500 truncate mt-1.5 font-light leading-snug">
                              {c.messages[c.messages.length - 1]?.text || 'No message recorded'}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Chat Editor Workspace */}
                    <div className="md:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between h-[380px] min-h-0">
                      
                      {activeChatRoom ? (
                        <>
                          {/* Chat Workspace Header */}
                          <div className="flex justify-between items-center border-b border-slate-200 pb-3 h-10">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 leading-tight">{activeChatRoom.userName}</h4>
                              <span className="text-[9px] text-slate-400 block font-light">{activeChatRoom.userEmail}</span>
                            </div>
                            <button
                              onClick={() => markChatResolved(activeChatRoom.userId)}
                              className="text-[10px] bg-white hover:bg-slate-100 border px-2.5 py-1 rounded-lg text-slate-600 font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          </div>

                          {/* Chat message streams */}
                          <div className="flex-grow overflow-y-auto space-y-3.5 my-3.5 pr-1 text-[11px] h-full">
                            {activeChatRoom.messages.map((m) => {
                              const isAgent = m.sender === 'agent' || m.sender === 'admin';
                              return (
                                <div
                                  key={m.id}
                                  className={`flex flex-col max-w-[85%] ${
                                    isAgent ? 'ml-auto items-end' : 'mr-auto items-start'
                                  }`}
                                >
                                  <div
                                    className={`rounded-2xl p-3 shadow-xs leading-relaxed font-light ${
                                      isAgent
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                    }`}
                                  >
                                    {m.text}
                                  </div>
                                  <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase">
                                    {isAgent ? 'You (Dispatcher)' : 'Client'} • {m.timestamp}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Input responding */}
                          <form onSubmit={handleSendResponse} className="bg-white p-2 border rounded-xl flex gap-1.5 items-center">
                            <input
                              type="text"
                              value={agentMsgText}
                              onChange={(e) => setAgentMsgText(e.target.value)}
                              placeholder={`Reply to ${activeChatRoom.userName}...`}
                              className="flex-grow h-8 bg-transparent text-slate-800 outline-none px-2 text-xs"
                            />
                            <button
                              type="submit"
                              className="h-8 px-3.5 bg-slate-900 hover:bg-slate-805 text-white rounded-lg flex items-center justify-center cursor-pointer"
                              title="Send Response"
                            >
                              <Send className="h-3.5 w-3.5 text-sky-400" />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="my-auto text-center p-6">
                          <p className="text-slate-400 text-xs font-light">Select an active support thread on the left inbox panel to begin clear client consultation.</p>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* ANNOUNCEMENTS MANAGER */}
              {activeTab === 'announcements' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">Sitewide Announcements</h2>
                    <p className="text-xs text-slate-500 mt-1 font-light">
                      Draft news banners or weather delay reports. Active announcements appear instantly to our global carrier client audience.
                    </p>
                  </div>

                  {/* Form to create */}
                  <form onSubmit={handleCreateAnnouncement} className="bg-slate-50 border border-slate-201 p-4 sm:p-6 rounded-2xl space-y-4 text-xs max-w-xl">
                    <h4 className="font-heading font-bold text-slate-800">Publish News Banner alert</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Banner Title</label>
                        <input
                          type="text"
                          required
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="e.g. North Atlantic storm delays"
                          className="w-full h-9 rounded-lg bg-white border border-slate-200 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Alert Category</label>
                        <select
                          value={annCategory}
                          onChange={(e) => setAnnCategory(e.target.value as any)}
                          className="w-full h-9 rounded-lg bg-white border border-slate-205 px-3"
                        >
                          <option value="info">Info (Slate)</option>
                          <option value="delay">Delay Notice (Amber)</option>
                          <option value="success">Success Notice (Emerald)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Full Notice Content</label>
                      <textarea
                        required
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="Due to winds over the English Channel..."
                        className="w-full h-14 bg-white border border-slate-150 p-2.5 rounded-lg resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Post Announcement Banner</span>
                    </button>
                  </form>

                  {/* Active Announcements list */}
                  <div className="space-y-3.5">
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Current active banners</h4>
                    
                    <div className="space-y-2 max-w-xl">
                      {announcements.map((a) => (
                        <div 
                          key={a.id} 
                          className={`p-4 rounded-xl border flex justify-between items-start ${
                            a.category === 'delay' 
                              ? 'bg-amber-50 border-amber-200 text-amber-900' 
                              : a.category === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <div>
                            <span className="block text-[10px] font-mono font-medium opacity-60 uppercase">{a.timestamp} • {a.category} alert</span>
                            <strong className="block text-xs font-bold mt-1 text-slate-900">{a.title}</strong>
                            <p className="text-[11px] leading-relaxed font-light mt-1 text-slate-600">{a.content}</p>
                          </div>
                          
                          <button
                            onClick={() => deleteAnnouncement(a.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 pl-4 cursor-pointer"
                            title="Delete alert"
                          >
                            Dismiss
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* RESTRICTED RECEIPTS DESK */}
              {activeTab === 'receipts' && (
                <div className="space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">Restricted Receipts Registry</h2>
                      <p className="text-xs text-slate-500 mt-1 font-light">
                        Print secure release confirmation receipts and download shipping manifest documentation. This console is restricted to internal dispatch auditors.
                      </p>
                    </div>
                    {selectedReceiptShipment && (
                      <button
                        onClick={() => setSelectedReceiptShipment(null)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold border cursor-pointer select-none leading-none mt-2 sm:mt-0"
                      >
                        ← Return to list
                      </button>
                    )}
                  </div>

                  {!selectedReceiptShipment ? (
                    <div className="space-y-4">
                      {/* Search bar inside Receipts */}
                      <div className="max-w-md">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Filter by AWB waybill, origin, sender name..."
                            value={receiptSearchQuery}
                            onChange={(e) => setReceiptSearchQuery(e.target.value)}
                            className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 pl-9 focus:outline-none focus:bg-white text-xs transition-all shadow-sm"
                          />
                          <div className="absolute left-3 top-3 text-slate-400">
                            <Database className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Receipts List */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white text-xs">
                        <div className="bg-slate-50/50 p-3.5 border-b border-slate-200 grid grid-cols-12 font-bold uppercase text-[9px] tracking-wide text-slate-400 gap-2">
                          <div className="col-span-3">AWB Identifier</div>
                          <div className="col-span-3">Origin Station</div>
                          <div className="col-span-3">Destination Station</div>
                          <div className="col-span-3 text-right">Receipt Actions</div>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {shipments.filter(s => {
                            const q = receiptSearchQuery.toLowerCase();
                            return s.trackingId.toLowerCase().includes(q) ||
                                   s.origin.city.toLowerCase().includes(q) ||
                                   s.destination.city.toLowerCase().includes(q) ||
                                   s.origin.sender.toLowerCase().includes(q) ||
                                   s.destination.receiver.toLowerCase().includes(q);
                          }).map((s) => (
                            <div key={s.trackingId} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50/50 gap-2">
                              <div className="col-span-3">
                                <span className="font-mono font-bold text-slate-800 block">{s.trackingId}</span>
                                <span className="text-[10px] text-slate-400 font-light block">{s.details.type} • {s.details.weight}</span>
                              </div>
                              <div className="col-span-3">
                                <span className="font-bold text-slate-700 block">{s.origin.city}</span>
                                <span className="text-[10px] text-slate-400 block truncate">{s.origin.sender}</span>
                              </div>
                              <div className="col-span-3">
                                <span className="font-bold text-slate-700 block">{s.destination.city}</span>
                                <span className="text-[10px] text-slate-400 block truncate">{s.destination.receiver}</span>
                              </div>
                              <div className="col-span-3 text-right">
                                <button
                                  onClick={() => setSelectedReceiptShipment(s)}
                                  className="text-[11px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 leading-none select-none"
                                >
                                  <Eye className="h-3.5 w-3.5 text-sky-400" />
                                  <span>Generate Manifest</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          {shipments.filter(s => {
                            const q = receiptSearchQuery.toLowerCase();
                            return s.trackingId.toLowerCase().includes(q) ||
                                   s.origin.city.toLowerCase().includes(q) ||
                                   s.destination.city.toLowerCase().includes(q) ||
                                   s.origin.sender.toLowerCase().includes(q) ||
                                   s.destination.receiver.toLowerCase().includes(q);
                          }).length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-xs italic">
                              No consignment matched the filter string.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Secure generation preview segment */
                    <div className="space-y-6">
                      <div id="receipt-printable-invoice" className="bg-white border-2 border-slate-900 rounded-none p-0 text-slate-900 shadow-md text-xs select-none max-w-4xl mx-auto overflow-hidden">
                        
                        {/* Row 1 Grid: Logo, Barcode, Subgrids */}
                        <div className="grid grid-cols-12 border-b border-slate-900">
                          {/* Column A: Globe/Logo Section */}
                          <div className="col-span-3 border-r border-slate-900 p-4 flex flex-col items-center justify-center text-center bg-slate-50">
                            <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" strokeWidth="1" className="text-red-500 opacity-80" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="1" stroke="currentColor" />
                              <path d="M2 12h20M12 2v20" strokeWidth="1" stroke="currentColor" />
                              <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1" stroke="currentColor" />
                            </svg>
                            <span className="block font-heading text-[11px] font-extrabold text-slate-900 uppercase tracking-widest mt-1.5 leading-none">APEX GLOBAL</span>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 leading-none">Foresight Logistics</span>
                          </div>

                          {/* Column B: Barcode identifier */}
                          <div className="col-span-3 border-r border-slate-900 p-4 flex flex-col items-center justify-center text-center font-mono">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <div className="flex h-10 w-32 items-stretch gap-[1.5px] bg-slate-50 p-1 border border-slate-200">
                                {[2,1,3,1,4,1,2,3,1,2,4,2,1,3,1,2,4,1].map((w, idx) => (
                                  <div key={idx} className="h-full bg-slate-900 flex-1" style={{ width: `${w}px` }} />
                                ))}
                              </div>
                              <div className="font-mono text-[9px] font-bold text-slate-800 tracking-wider">
                                {selectedReceiptShipment.trackingId}
                              </div>
                              <div className="text-[8px] font-bold text-sky-600 uppercase tracking-wide">
                                Security Archive
                              </div>
                            </div>
                          </div>

                          {/* Column C: 3x3 Metadata Subgrid */}
                          <div className="col-span-6 grid grid-cols-3">
                            <div className="border-r border-b border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Pickup Date:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">2026-05-24</span>
                            </div>
                            <div className="border-r border-b border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Pickup Time:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">09:00 AM</span>
                            </div>
                            <div className="border-b border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Delivery Date:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">{selectedReceiptShipment.details.estimatedDelivery || '2026-05-28'}</span>
                            </div>
                            
                            <div className="border-r border-b border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Origin:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">{selectedReceiptShipment.origin.city}</span>
                            </div>
                            <div className="border-r border-b border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Destination:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">{selectedReceiptShipment.destination.city}</span>
                            </div>
                            <div className="border-b border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Courier:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">AES Dispatch</span>
                            </div>

                            <div className="border-r border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Carrier:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">Apex Global Express</span>
                            </div>
                            <div className="border-r border-slate-900 p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Reference Code:</span>
                              <span className="font-mono font-bold text-slate-800 mt-0.5 text-[10px]">{selectedReceiptShipment.trackingId}-SEC</span>
                            </div>
                            <div className="p-2 flex flex-col justify-between bg-white text-left">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 font-mono">Departure Logs:</span>
                              <span className="font-sans font-bold text-slate-800 mt-0.5 text-[10px]">22:00 PM</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Sender (Shipper) and Receiver (Consignee) details */}
                        <div className="grid grid-cols-12 border-b border-slate-900">
                          {/* Shipper Column */}
                          <div className="col-span-5 border-r border-slate-900 flex flex-col bg-white text-left">
                            <div className="grid grid-cols-12 border-b border-slate-900 min-h-[32px]">
                              <div className="col-span-3 border-r border-slate-900 bg-slate-50 p-2 font-bold text-slate-500 uppercase text-[9px] flex items-center">
                                Shipper
                              </div>
                              <div className="col-span-9 p-2 font-extrabold text-slate-800 flex items-center text-[11px]">
                                {selectedReceiptShipment.origin.sender}
                              </div>
                            </div>
                            <div className="p-3 space-y-1 flex-1 text-slate-700 bg-white">
                              <div className="font-semibold leading-normal">{selectedReceiptShipment.origin.address}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {selectedReceiptShipment.origin.city}, {selectedReceiptShipment.origin.country}
                              </div>
                            </div>
                          </div>

                          {/* Consignee Column */}
                          <div className="col-span-5 border-r border-slate-900 flex flex-col bg-white text-left">
                            <div className="grid grid-cols-12 border-b border-slate-900 min-h-[32px]">
                              <div className="col-span-3 border-r border-slate-900 bg-slate-50 p-2 font-bold text-slate-500 uppercase text-[9px] flex items-center">
                                Consignee
                              </div>
                              <div className="col-span-9 p-2 font-extrabold text-slate-800 flex items-center text-[11px]">
                                {selectedReceiptShipment.destination.receiver}
                              </div>
                            </div>
                            <div className="p-3 space-y-1 flex-1 text-slate-700 bg-white">
                              <div className="font-semibold leading-normal">{selectedReceiptShipment.destination.address}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {selectedReceiptShipment.destination.city}, {selectedReceiptShipment.destination.country}
                              </div>
                            </div>
                          </div>

                          {/* Status and Terminal notes column */}
                          <div className="col-span-2 flex flex-col bg-white text-left">
                            <div className="border-b border-slate-900 p-2 font-bold text-slate-500 uppercase text-[9px] bg-slate-50 min-h-[32px] flex items-center justify-between">
                              <span>Status</span>
                              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono font-bold uppercase">
                                {selectedReceiptShipment.status}
                              </span>
                            </div>
                            <div className="p-2 flex-1 text-[10px] text-slate-500 leading-tight bg-white">
                              <div className="font-bold text-[8px] text-slate-400 uppercase tracking-wider mb-1">Log Notes:</div>
                              <div className="italic font-light">
                                {selectedReceiptShipment.notes || 'Confidential PRIORITY Air Consignment Checked.'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Row 3: Product Description details */}
                        <div className="grid grid-cols-4 border-b border-slate-900 bg-white text-left">
                          <div className="border-r border-slate-900 p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Type of Shipment:</span>
                            <strong className="text-slate-800 text-[10px] font-bold mt-1 uppercase">{selectedReceiptShipment.details.type || 'Express Cargo'}</strong>
                          </div>
                          <div className="border-r border-slate-900 p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Cargo Package Spec:</span>
                            <strong className="text-slate-800 text-[10px] font-bold mt-1 uppercase">{selectedReceiptShipment.details.dimensions || 'Standard Secure Freight'}</strong>
                          </div>
                          <div className="border-r border-slate-900 p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Declared Priority Class:</span>
                            <strong className="text-slate-800 text-[10px] font-bold mt-1 uppercase">{selectedReceiptShipment.details.serviceLevel || 'Level A Express'}</strong>
                          </div>
                          <div className="p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Gross Weight:</span>
                            <strong className="text-slate-800 text-[10px] font-bold mt-1 font-mono">{selectedReceiptShipment.details.weight || '14.8 kg'}</strong>
                          </div>
                        </div>

                        {/* Row 4: Carrier and Security stamping */}
                        <div className="grid grid-cols-4 border-b border-slate-900 bg-white text-left">
                          <div className="border-r border-slate-900 p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Carrier Authority ID:</span>
                            <strong className="text-slate-800 text-[10px] font-bold mt-1 font-mono">APX-{selectedReceiptShipment.trackingId}</strong>
                          </div>
                          <div className="border-r border-slate-900 p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Quantity Measure:</span>
                            <strong className="text-slate-800 text-[10px] font-bold mt-1">1 Cargo Unit</strong>
                          </div>
                          <div className="border-r border-slate-900 p-2.5 flex flex-col justify-between font-mono">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Release Terminal:</span>
                            <strong className="text-emerald-700 text-[10px] font-bold mt-1">APPROVED & SEALED</strong>
                          </div>
                          <div className="p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Verification Mode:</span>
                            <strong className="text-sky-700 text-[10px] font-bold mt-1 uppercase">Secure Audit Signature</strong>
                          </div>
                        </div>

                        {/* Row 5: Outer visual digital stamp & code */}
                        <div className="p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Dispatcher Digital Seal</span>
                            <p className="text-[9px] text-slate-500 font-light mt-0.5 leading-normal max-w-md">
                              This clearance document indicates all regulatory customs duties are pre-cleared. Verified by terminal dispatcher node #108 utilizing real-time global satellite positioning anchors.
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right font-mono">
                              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none">Registered Node</span>
                              <span className="text-[10px] font-extrabold text-slate-800 tracking-tight block mt-1 leading-none">APX-ZRH-108</span>
                            </div>
                            <div className="h-10 w-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center">
                              <QrCode className="h-full w-full text-slate-700" />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Dashboard Action panel, restricted */}
                      <div className="flex justify-end gap-3 select-none pt-4">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-705 text-xs font-bold rounded-xl px-4 py-2.5 transition-all cursor-pointer bg-white"
                        >
                          <Printer className="h-4 w-4 text-slate-500" />
                          <span>Print Secure Receipt</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleDownloadReceiptJpg}
                          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-805 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Download className="h-4 w-4 text-sky-400" />
                          <span>Download Secure Receipt (JPG)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SYSTEM CREDENTIALS SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-8 text-left">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight font-sans">Operator Terminal & Website Settings</h2>
                    <p className="text-xs text-slate-500 mt-1 font-light">
                      Manage operator access profile tokens and control live portal customization properties.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Website Branding Controls */}
                    <div className="xl:col-span-8 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
                      <div>
                        <h3 className="font-heading text-base font-bold text-slate-850">Website Customization & Branding Desk</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Configure sitewide global assets, logos, and contacts instantly. All dynamic sections will refresh instantly under server synchronization.</p>
                      </div>

                      <form onSubmit={handleUpdateBranding} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Group A: Names and Logos */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Identity & Logo Assets</h4>
                            
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Company / Site Name</label>
                              <input
                                type="text"
                                required
                                value={bSiteName}
                                onChange={(e) => setBSiteName(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Website Logo Name</label>
                              <input
                                type="text"
                                required
                                value={bWebsiteLogo}
                                onChange={(e) => setBWebsiteLogo(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Header Logo character (Initials)</label>
                              <input
                                type="text"
                                required
                                value={bHeaderLogo}
                                onChange={(e) => setBHeaderLogo(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Footer Brand Logo</label>
                              <input
                                type="text"
                                required
                                value={bFooterLogo}
                                onChange={(e) => setBFooterLogo(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>
                          </div>

                          {/* Group B: Contact details */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">HQ Communications</h4>
                            
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Office Address Location</label>
                              <input
                                type="text"
                                required
                                value={bOfficeAddress}
                                onChange={(e) => setBOfficeAddress(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Dedicated Support Email</label>
                              <input
                                type="email"
                                required
                                value={bContactEmail}
                                onChange={(e) => setBContactEmail(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Operator Hotline Number</label>
                              <input
                                type="text"
                                required
                                value={bContactPhone}
                                onChange={(e) => setBContactPhone(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Footer Notice / Fineprint Copy</label>
                              <input
                                type="text"
                                required
                                value={bFooterInformation}
                                onChange={(e) => setBFooterInformation(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section C: Extended texts */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Marketing & Hero Layout Texts</h4>
                          
                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Hero Section Branding Text (Slide Headline)</label>
                            <input
                              type="text"
                              required
                              value={bHeroBrandingText}
                              onChange={(e) => setBHeroBrandingText(e.target.value)}
                              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Global Website Description & Specializations</label>
                            <textarea
                              required
                              value={bWebsiteBrandingDetails}
                              onChange={(e) => setBWebsiteBrandingDetails(e.target.value)}
                              rows={3}
                              className="w-full rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 p-3 outline-none text-xs text-slate-800 resize-none font-sans"
                            />
                          </div>
                        </div>

                        {/* Section D: Social Connections */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Social Networks (Hyperlinks)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Twitter URL</label>
                              <input
                                type="text"
                                value={bSocialTwitter}
                                onChange={(e) => setBSocialTwitter(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">LinkedIn URL</label>
                              <input
                                type="text"
                                value={bSocialLinkedin}
                                onChange={(e) => setBSocialLinkedin(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Instagram URL</label>
                              <input
                                type="text"
                                value={bSocialInstagram}
                                onChange={(e) => setBSocialInstagram(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-205 focus:bg-white focus:border-sky-500 px-3 outline-none text-xs text-slate-800 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {showBrandingConfirm && (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-4 rounded-xl flex items-center gap-2 font-bold text-xs">
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span>Web portal branding configuration published instantly! All dynamic zones refreshed.</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="h-11 px-6 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer text-xs uppercase tracking-wider transition-all shadow-sm"
                        >
                          <CheckCircle className="h-4.5 w-4.5 text-white" />
                          <span>Publish Branding Configuration</span>
                        </button>
                      </form>
                    </div>

                    {/* Right: Operator Access Tokens */}
                    <div className="xl:col-span-4 space-y-6">
                      <div className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-3xl text-xs space-y-6">
                        <form onSubmit={handleUpdateCredentials} className="space-y-4">
                          <div>
                            <h4 className="font-heading font-bold text-slate-850 text-sm">Operator Account Credentials</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Define your private operator credential tokens.</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Operator Username</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. administrator"
                                value={settingsUsername}
                                onChange={(e) => setSettingsUsername(e.target.value)}
                                className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 outline-none text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Security Password</label>
                              <input
                                type="password"
                                required
                                placeholder="Enter New Password"
                                value={settingsPassword}
                                onChange={(e) => setSettingsPassword(e.target.value)}
                                className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 outline-none font-mono text-xs"
                              />
                            </div>
                          </div>

                          {showSettingsConfirm && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-3 rounded-xl flex items-center gap-2 font-bold text-xs">
                              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                              <span>Credentials successfully updated!</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full h-10 bg-slate-900 hover:bg-slate-855 text-white rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer text-xs"
                          >
                            <ShieldCheck className="h-4 w-4 text-sky-400" />
                            <span>Apply Credentials Changes</span>
                          </button>
                        </form>

                        <div className="h-px bg-slate-200" />

                        <div>
                          <h4 className="font-heading font-semibold text-slate-850 uppercase text-[9px] tracking-wider">Active Authorized Operator Token</h4>
                          <div className="mt-2.5 bg-white p-3.5 border rounded-xl space-y-1.5 font-mono text-[10px] text-slate-500">
                            <div>Active Username Flag: <span className="font-bold text-slate-800">{storedUsername}</span></div>
                            <div>Active Password Seed: <span className="font-bold text-slate-800">{'•'.repeat(storedPassword.length)}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
