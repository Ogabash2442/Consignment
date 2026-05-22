/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../context/PortalContext';
import { 
  getAllShipments, saveShipment, deleteShipment, getAllContactMessages, 
  updateContactMessageStatus, getAdminActivityLogs, updatePortalSettings, isDemoMode,
  listenAllChats, listenToChat, sendChatMessage, markChatAsRead, setChatTypingStatus,
  updateChatStatus, assignChatAdmin, deleteChat, updateAdminEmail, updateAdminPassword,
  sendAdminPasswordReset, clearChatHistory, deleteChatMessage, blockUserEmail, isUserEmailBlocked
} from '../firebase';
import { 
  Shipment, ContactMessage, AdminActivityLog, ShipmentStatus, ShipmentType, TimelineEvent, RoutePoint,
  ChatMessage, Chat, SupportSession
} from '../types';
import { 
  Briefcase, PlusCircle, LayoutDashboard, Mail, Settings, ScrollText, 
  Search, ShieldAlert, LogOut, Ship, Trash2, Edit3, ArrowUpRight, Scale, Info, Globe, HelpCircle, Save, CalendarCheck,
  MessageSquare, KeyRound, Activity, CheckCheck, UserCheck, RefreshCcw, Clock
} from 'lucide-react';
import { ShipmentInvoiceModal } from '../components/ShipmentInvoiceModal';

export const AdminDashboard: React.FC = () => {
  const { adminEmail, setAdminEmail, setCurrentPage, settings, setSettings, showToast } = usePortal();

  // ====== PROFESSIONAL SHIPMENT RECEIPT SYSTEM ======
  const [selectedInvoiceShipment, setSelectedInvoiceShipment] = useState<Shipment | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!adminEmail) {
      setCurrentPage('login');
      showToast('Session expired or unauthorized accession requested.', 'error');
    }
  }, [adminEmail]);

  // View tabs state
  type Tab = 'analytics' | 'create' | 'directory' | 'messages' | 'settings' | 'logs' | 'chat' | 'profile';
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  // Load Database Items
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create/Edit form states
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  
  // New/Edit form specific parameters
  const [trackingIdForm, setTrackingIdForm] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [recAddress, setRecAddress] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLoc, setCurrentLoc] = useState('');
  const [weight, setWeight] = useState(1);
  const [shipType, setShipType] = useState<ShipmentType>('Air Freight');
  const [shipStatus, setShipStatus] = useState<ShipmentStatus>('Pending');
  const [eta, setEta] = useState('');
  const [progress, setProgress] = useState(0);
  const [cost, setCost] = useState(120);
  const [note, setNote] = useState('');

  // Routing timeline checkpoint additions
  const [timelineDate, setTimelineDate] = useState('');
  const [timelineTime, setTimelineTime] = useState('');
  const [timelineLoc, setTimelineLoc] = useState('');
  const [timelineStatus, setTimelineStatus] = useState<ShipmentStatus>('Pending');
  const [timelineDesc, setTimelineDesc] = useState('');

  // Portal details form state
  const [brandingName, setBrandingName] = useState(settings.websiteName);
  const [brandingEmail, setBrandingEmail] = useState(settings.companyEmail);
  const [brandingPhone, setBrandingPhone] = useState(settings.companyPhone);
  const [brandingAddress, setBrandingAddress] = useState(settings.officeAddress);
  const [brandingHours, setBrandingHours] = useState(settings.supportHours);

  // ====== LIVE CHAT SYSTEM ADMINISTRATOR STATES & HOOKS ======
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatStatusFilter, setChatStatusFilter] = useState<'all' | 'open' | 'closed' | 'resolved' | 'archived'>('all');
  const [adminTypingState, setAdminTypingState] = useState(false);
  const typingAdminTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ====== ADMIN SECURITY PROFILE METADATA STATES & TIMER ======
  const [systemEmailInput, setSystemEmailInput] = useState(adminEmail || '');
  const [systemPassInput, setSystemPassInput] = useState('');
  const [systemNewPass, setSystemNewPass] = useState('');
  const [systemConfirmPass, setSystemConfirmPass] = useState('');
  const [credentialsProcessing, setCredentialsProcessing] = useState(false);

  const [sessionStart] = useState(() => Date.now());
  const [sessionElapsed, setSessionElapsed] = useState(0);

  // Track session lifetime stopwatch
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Sync state with updated admin session
  useEffect(() => {
    if (adminEmail) {
      setSystemEmailInput(adminEmail);
    }
  }, [adminEmail]);

  // Listen to ALL support chat conversations sequentially
  useEffect(() => {
    if (!adminEmail) return;
    const unsubscribe = listenAllChats((chats) => {
      setAllChats(chats);
    });
    return () => unsubscribe();
  }, [adminEmail]);

  // Sync with current active conversation snapshot
  useEffect(() => {
    if (!activeChatId) {
      setActiveChat(null);
      return;
    }

    // Instantly mark client messages as read for admin
    markChatAsRead(activeChatId, 'admin');

    const unsubscribe = listenToChat(activeChatId, (updatedChat) => {
      setActiveChat(updatedChat);
    });
    return () => unsubscribe();
  }, [activeChatId]);

  // Notify active chat list when activeChatId changes or unread count needs reset
  useEffect(() => {
    if (activeChatId && isOpenChatsTab()) {
      markChatAsRead(activeChatId, 'admin');
    }
  }, [activeChatId, activeChat?.messages?.length]);

  const isOpenChatsTab = () => activeTab === 'chat';

  // Handle Admin Input replies typing indications
  const handleAdminReplInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyMessage(e.target.value);
    if (!activeChatId) return;

    if (!adminTypingState) {
      setAdminTypingState(true);
      setChatTypingStatus(activeChatId, 'admin', true);
    }

    if (typingAdminTimeoutRef.current) {
      clearTimeout(typingAdminTimeoutRef.current);
    }

    typingAdminTimeoutRef.current = setTimeout(() => {
      setAdminTypingState(false);
      setChatTypingStatus(activeChatId, 'admin', false);
    }, 1800);
  };

  // Submit Administrative Reply
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId) return;

    const cleanReply = replyMessage.trim();
    if (!cleanReply) return;

    // Reset typing status instantly
    if (typingAdminTimeoutRef.current) {
      clearTimeout(typingAdminTimeoutRef.current);
    }
    setAdminTypingState(false);
    setChatTypingStatus(activeChatId, 'admin', false);

    try {
      await sendChatMessage(activeChatId, 'admin', cleanReply);
      setReplyMessage('');
    } catch {
      showToast("Failed to route reply message.", "error");
    }
  };

  // Assign current logged-in inspector to the conversation
  const handleClaimChat = async (chatId: string) => {
    if (!adminEmail) return;
    try {
      await assignChatAdmin(chatId, adminEmail);
      showToast("Support conversation claimed successfully.", "success");
    } catch {
      showToast("Claim action failed.", "error");
    }
  };

  // Resolve chat support session
  const handleResolveChat = async (chatId: string) => {
    if (!adminEmail) return;
    try {
      await updateChatStatus(chatId, 'resolved', adminEmail);
      showToast("Support session marked as RESOLVED.", "success");
    } catch {
      showToast("Resolution tagging failed.", "error");
    }
  };

  // Purge chat support document
  const handlePurgeChat = async (chatId: string) => {
    if (!adminEmail) return;
    if (window.confirm("Are you sure you want to permanently delete this client conversations ledger? This is irreversible.")) {
      try {
        await deleteChat(chatId, adminEmail);
        showToast("Support chat log permanently deleted.", "info");
        if (activeChatId === chatId) {
          setActiveChatId(null);
        }
      } catch {
        showToast("Chat ledger deletion failed.", "error");
      }
    }
  };

  // Clear all message history in a conversation
  const handleClearHistory = async (chatId: string) => {
    if (!adminEmail) return;
    if (window.confirm("Are you sure you want to permanently delete the entire text message history of this support conversation? This cannot be undone.")) {
      try {
        await clearChatHistory(chatId, adminEmail);
        showToast("Ticket conversation message history purged.", "info");
      } catch {
        showToast("History purge failed.", "error");
      }
    }
  };

  // Block/blacklist a spam email
  const handleBlockEmail = async (email: string) => {
    if (!adminEmail) return;
    if (window.confirm(`Are you sure you want to block the user email address "${email}"? This will suspend their terminal session instantly.`)) {
      try {
        await blockUserEmail(email, adminEmail);
        showToast(`User "${email}" blacklisted successfully.`, "success");
      } catch {
        showToast("Failed to blacklist user.", "error");
      }
    }
  };

  // Purge an individual message bubble
  const handleDeleteSingleMsg = async (chatId: string, timestamp: string) => {
    if (!adminEmail) return;
    if (window.confirm("Delete this single chat message bubble?")) {
      try {
        await deleteChatMessage(chatId, timestamp, adminEmail);
        showToast("Individual message deleted.", "info");
      } catch {
        showToast("Message deletion failed.", "error");
      }
    }
  };

  // Set chat ticket status
  const handleUpdateChatStatus = async (chatId: string, status: 'open' | 'closed' | 'resolved' | 'archived') => {
    if (!adminEmail) return;
    try {
      await updateChatStatus(chatId, status, adminEmail);
      showToast(`Support status set to ${status.toUpperCase()}.`, "success");
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  // Submit Password/Credentials configuration changes
  const handleUpdateAdminProfileCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentialsProcessing) return;

    const emailSubmit = systemEmailInput.trim();
    if (!emailSubmit) {
      showToast("Administrative identity identifier cannot be blank.", "error");
      return;
    }

    if (!isDemoMode && !systemPassInput) {
      showToast("Re-authentication verify password is required for cloud updates.", "error");
      return;
    }

    setCredentialsProcessing(true);
    try {
      let emailUpdated = false;
      let passwordUpdated = false;

      // Update Email
      if (emailSubmit !== adminEmail) {
        await updateAdminEmail(emailSubmit, systemPassInput);
        setAdminEmail(emailSubmit);
        emailUpdated = true;
      }

      // Update Password
      if (systemNewPass) {
        if (systemNewPass.length < 6) {
          showToast("Passcode fail: must be at least 6 characters.", "error");
          setCredentialsProcessing(false);
          return;
        }
        if (systemNewPass !== systemConfirmPass) {
          showToast("Passcodes do not match.", "error");
          setCredentialsProcessing(false);
          return;
        }
        await updateAdminPassword(systemNewPass, systemPassInput);
        passwordUpdated = true;
      }

      if (emailUpdated && passwordUpdated) {
        showToast("Administrative login credentials revised successfully.", "success");
      } else if (emailUpdated) {
        showToast("Administrative login email updated successfully.", "success");
      } else if (passwordUpdated) {
        showToast("Administrative secure password revised successfully.", "success");
      } else {
        showToast("No configuration updates were made.", "info");
      }

      setSystemPassInput('');
      setSystemNewPass('');
      setSystemConfirmPass('');
    } catch (err: any) {
      showToast(err.message || "Failed to update security credentials.", "error");
    } finally {
      setCredentialsProcessing(false);
    }
  };

  // Issue standard Firebase password reset email dispatch
  const handlePasswordResetTrigger = async () => {
    if (!adminEmail) return;
    try {
      await sendAdminPasswordReset(adminEmail);
      showToast(`Password reset link dispatched securely to: ${adminEmail}`, "success");
    } catch (err: any) {
      showToast(err.message || "Password patch dispatch rejected.", "error");
    }
  };

  const fetchAppData = async () => {
    setLoading(true);
    try {
      const [allShipments, allMessages, allLogs] = await Promise.all([
        getAllShipments(),
        getAllContactMessages(),
        getAdminActivityLogs()
      ]);
      setShipments(allShipments || []);
      setMessages(allMessages || []);
      setLogs(allLogs || []);
    } catch {
      showToast('Failed to sync master ledger databases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminEmail) {
      fetchAppData();
    }
  }, [adminEmail]);

  // Generate customized shipping references
  const handleGenerateTrackingId = () => {
    const prefixes = ['CSG', 'TRK', 'LOG', 'HLD'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const r = Math.floor(Math.random() * 900000 + 100000);
    setTrackingIdForm(`${p}${r}`);
    showToast('Unique logistics waybill reference generated.', 'info');
  };

  // Reset form
  const resetShipmentForm = () => {
    setEditingShipment(null);
    setTrackingIdForm('');
    setSenderName('');
    setSenderEmail('');
    setSenderPhone('');
    setSenderAddress('');
    setRecName('');
    setRecEmail('');
    setRecPhone('');
    setRecAddress('');
    setOrigin('');
    setDestination('');
    setCurrentLoc('');
    setWeight(5);
    setShipType('Air Freight');
    setShipStatus('Pending');
    setEta(new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]);
    setProgress(0);
    setCost(150);
    setNote('');
  };

  const handleEditShipmentClick = (ship: Shipment) => {
    setEditingShipment(ship);
    setTrackingIdForm(ship.trackingId);
    setSenderName(ship.sender.name);
    setSenderEmail(ship.sender.email);
    setSenderPhone(ship.sender.phone);
    setSenderAddress(ship.sender.address);
    setRecName(ship.receiver.name);
    setRecEmail(ship.receiver.email);
    setRecPhone(ship.receiver.phone);
    setRecAddress(ship.receiver.address);
    setOrigin(ship.origin);
    setDestination(ship.destination);
    setCurrentLoc(ship.currentLocation);
    setWeight(ship.weight);
    setShipType(ship.shipmentType);
    setShipStatus(ship.shipmentStatus);
    setEta(ship.estimatedDelivery);
    setProgress(ship.progress);
    setCost(ship.shippingCost || 120);
    setNote(ship.carrierNote || '');
    
    setActiveTab('create');
  };

  // Submit Shipment Form (Create or Edit)
  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdForm.trim() || !senderName || !recName || !origin || !destination) {
      showToast('Please fulfill all critical parameters.', 'error');
      return;
    }

    const tid = trackingIdForm.trim().toUpperCase();

    const shipmentObj: Shipment = {
      id: tid,
      trackingId: tid,
      sender: { name: senderName, email: senderEmail, phone: senderPhone, address: senderAddress },
      receiver: { name: recName, email: recEmail, phone: recPhone, address: recAddress },
      origin,
      destination,
      currentLocation: currentLoc || origin,
      weight,
      shipmentType: shipType,
      shipmentStatus: shipStatus,
      estimatedDelivery: eta || new Date().toISOString().split('T')[0],
      createdAt: editingShipment ? editingShipment.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress,
      shippingCost: cost,
      carrierNote: note,
      shipmentImages: editingShipment ? editingShipment.shipmentImages : [],
      routeHistory: editingShipment ? editingShipment.routeHistory : [
        { location: origin, lat: 48.00, lng: 11.00, timestamp: new Date().toISOString(), status: 'Pending' }
      ],
      shipmentTimeline: editingShipment ? editingShipment.shipmentTimeline : [
        {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: origin,
          status: 'Pending',
          description: 'Shipment created and scheduled in portal database.'
        }
      ]
    };

    try {
      await saveShipment(shipmentObj, adminEmail || 'admin@swiftcarrier.com');
      showToast(`Consignment reference ${tid} compiled successfully!`, 'success');
      resetShipmentForm();
      fetchAppData();
      setActiveTab('directory');
    } catch {
      showToast('Security policy prevented directory write. Verify credentials.', 'error');
    }
  };

  // Delete Shipment
  const handleDeleteShipment = async (tid: string) => {
    if (!window.confirm(`Forbid/Erasure confirmation requested for ${tid}. Terminate consignment record?`)) return;
    try {
      await deleteShipment(tid, adminEmail || 'admin@swiftcarrier.com');
      showToast(`Shipment ${tid} erased from registers.`, 'success');
      fetchAppData();
    } catch {
      showToast('Deletion refused by database security check.', 'error');
    }
  };

  // Add timeline event checkpoint to edited shipment
  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    if (!timelineLoc || !timelineDesc || !timelineDate || !timelineTime) {
      showToast('Please enter complete timeline details.', 'error');
      return;
    }

    const newEvent: TimelineEvent = {
      date: timelineDate,
      time: timelineTime,
      location: timelineLoc,
      status: timelineStatus,
      description: timelineDesc
    };

    // Construct secondary route points coordinates dynamically
    const newRoute: RoutePoint = {
      location: timelineLoc,
      lat: editingShipment.routeHistory[0]?.lat + (Math.random() * 2 - 1) || 45,
      lng: editingShipment.routeHistory[0]?.lng + (Math.random() * 2 - 1) || 12,
      timestamp: new Date(`${timelineDate}T${timelineTime}`).toISOString(),
      status: timelineStatus
    };

    const updatedTimeline = [newEvent, ...editingShipment.shipmentTimeline];
    const updatedRoute = [...editingShipment.routeHistory, newRoute];

    const updatedShipment: Shipment = {
      ...editingShipment,
      shipmentStatus: timelineStatus,
      currentLocation: timelineLoc,
      progress,
      updatedAt: new Date().toISOString(),
      shipmentTimeline: updatedTimeline,
      routeHistory: updatedRoute
    };

    try {
      await saveShipment(updatedShipment, adminEmail || 'admin@swiftcarrier.com');
      showToast('Custom tracking waypoint checklist added!', 'success');
      setEditingShipment(updatedShipment);
      setTimelineLoc('');
      setTimelineDesc('');
      fetchAppData();
    } catch {
      showToast('Timeline ledger failed to save.', 'error');
    }
  };

  // Moderate Message Status
  const handleModerateMessage = async (msgId: string, status: 'unread' | 'read' | 'replied') => {
    try {
      await updateContactMessageStatus(msgId, status, adminEmail || 'admin@swiftcarrier.com');
      showToast(`Logged message marked as: ${status}`, 'success');
      fetchAppData();
    } catch {
      showToast('Operations message modification rejected.', 'error');
    }
  };

  // Save Settings branding details
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandingName || !brandingEmail || !brandingPhone) {
      showToast('Please fill out critical corporate fields.', 'error');
      return;
    }

    const targetSettings = {
      websiteName: brandingName,
      companyEmail: brandingEmail,
      companyPhone: brandingPhone,
      officeAddress: brandingAddress,
      supportHours: brandingHours
    };

    try {
      await updatePortalSettings(targetSettings, adminEmail || 'admin@swiftcarrier.com');
      setSettings(targetSettings);
      showToast('Administrative settings updated.', 'success');
      fetchAppData();
      setActiveTab('analytics');
    } catch {
      showToast('Settings verification failed.', 'error');
    }
  };

  // Logout Admin session
  const handleLogout = () => {
    setAdminEmail(null);
    setCurrentPage('home');
    showToast('Secure administrator cockpit session closed.', 'info');
  };

  // Calculations for Admin Analytics panel
  const totalTonnage = shipments.reduce((acc, s) => acc + s.weight, 0);
  const deliveredCount = shipments.filter(s => s.shipmentStatus === 'Delivered').length;
  const transitCount = shipments.filter(s => s.shipmentStatus === 'In Transit').length;
  const customsCount = shipments.filter(s => s.shipmentStatus === 'Customs Clearance').length;
  const unreadMsgCount = messages.filter(m => m.status === 'unread').length;
  const unreadChatsCount = allChats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  // Filtered shipments table
  const filteredShipments = shipments.filter(ship => {
    const sTerm = searchQuery.toLowerCase().trim();
    const idMatch = ship.trackingId.toLowerCase().includes(sTerm);
    const originMatch = ship.origin.toLowerCase().includes(sTerm);
    const destMatch = ship.destination.toLowerCase().includes(sTerm);
    const statusMatch = statusFilter === 'ALL' || ship.shipmentStatus === statusFilter;
    return (idMatch || originMatch || destMatch) && statusMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center justify-center h-8.5 w-8.5 overflow-hidden">
              <img 
                src="/src/assets/images/company_logo_1779474855785.png" 
                alt="SwiftCarrier Enterprise Logo"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-xs tracking-widest text-slate-100 uppercase font-sans">
              COCKPIT CONTROLS
            </span>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            
            <button
              onClick={() => { setActiveTab('analytics'); resetShipmentForm(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-[#ff3c00]" />
              <span>General Dashboard</span>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('create'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'create' && !editingShipment ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <PlusCircle className="h-4 w-4 text-[#ff3c00]" />
              <span>Record Shipment</span>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('directory'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'directory' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Briefcase className="h-4 w-4 text-[#ff3c00]" />
              <span>Waybill Directory</span>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('messages'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'messages' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Mail className="h-4 w-4 text-[#ff3c00]" />
              <div className="flex justify-between items-center w-full">
                <span>Inquiries Central</span>
                {unreadMsgCount > 0 && (
                  <span className="h-4.5 w-4.5 bg-rose-500 rounded-full font-bold font-mono text-[10px] text-white flex items-center justify-center leading-none">
                    {unreadMsgCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('chat'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'chat' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <MessageSquare className="h-4 w-4 text-[#ff3c00]" />
              <div className="flex justify-between items-center w-full">
                <span>Support Cockpit</span>
                {unreadChatsCount > 0 && (
                  <span className="h-4.5 w-4.5 bg-[#ff3c00] rounded-full font-bold font-mono text-[10px] text-white flex items-center justify-center leading-none">
                    {unreadChatsCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('settings'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Settings className="h-4 w-4 text-[#ff3c00]" />
              <span>Site Branding</span>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('profile'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <KeyRound className="h-4 w-4 text-[#ff3c00]" />
              <span>Security Center</span>
            </button>

            <button
              onClick={() => { resetShipmentForm(); setActiveTab('logs'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'logs' ? 'bg-[#ff3c00]/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <ScrollText className="h-4 w-4 text-[#ff3c00]" />
              <span>Auditable Logs</span>
            </button>

          </nav>
        </div>

        {/* Footer Admin session info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono select-none px-2 text-slate-400 bg-slate-950 py-1.5 rounded border border-slate-850">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">Active: {adminEmail}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-rose-950/30 border border-rose-900/40 text-rose-450 hover:bg-rose-900 hover:text-white p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Safely Lock Exit</span>
          </button>
        </div>

      </aside>

      {/* MAIN COCKPIT VIEWPORT */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {loading && (
          <div className="py-32 flex flex-col items-center space-y-4">
            <div className="h-10 w-10 border-4 border-slate-850 border-t-[#ff3c00] rounded-full animate-spin" />
            <p className="text-slate-500 font-mono text-xs">SYNCHRONIZING SECURE TELEMETRY SCHEMES...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">

            {/* TAB 1: GENERAL ANALYTICS VIEW */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-white">Consignment Analytics Cockpit</h2>
                  <p className="text-slate-450 text-slate-400 text-xs font-mono mt-0.5">Summary reports sourced across live Firestore entities.</p>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
                  
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-705 transition-colors shadow">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">REGISTERED manifest cargo</span>
                    <p className="text-3xl font-bold text-white mt-1">{shipments.length}</p>
                    <span className="text-[10px] text-slate-550 block">Waybills tracked</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-705 transition-colors shadow">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">DELIVERED SIGNOFF</span>
                    <p className="text-3xl font-bold text-emerald-450 text-emerald-400 mt-1">{deliveredCount}</p>
                    <span className="text-[10px] text-slate-550 block">On-time fulfillments ({shipments.length > 0 ? Math.round((deliveredCount/shipments.length)*100) : 0}%)</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-705 transition-colors shadow">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">ACTIVE TRANSIT CORRIDORS</span>
                    <p className="text-3xl font-bold text-cyan-400 mt-1">{transitCount + customsCount}</p>
                    <span className="text-[10px] text-slate-550 block">{transitCount} Transit•{customsCount} Customs Clearance</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-705 transition-colors shadow">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">CUMULATIVE TONNAGE</span>
                    <p className="text-3xl font-bold text-white mt-1">{(totalTonnage / 1000).toFixed(2)}T</p>
                    <span className="text-[10px] text-slate-550 block">{totalTonnage.toLocaleString()} Gross KG</span>
                  </div>

                </div>

                {/* Split list: Recent Operations & Message summaries */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Recent Logs (7 cols) */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="font-bold text-white text-base">Terminal Actions</h4>
                      <button onClick={() => setActiveTab('logs')} className="text-xs text-[#ff3c00] hover:underline font-mono">View audit history</button>
                    </div>

                    <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                      {logs.slice(0, 5).map((l) => (
                        <div key={l.id} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-start gap-2.5">
                          <span className="font-bold text-[#ff3c00] block mt-0.5">➔</span>
                          <div>
                            <p className="text-white font-semibold">{l.details}</p>
                            <p className="text-slate-500 text-[9px] uppercase mt-1">{new Date(l.timestamp).toLocaleString()} • {l.adminEmail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending messages summary (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="font-bold text-white text-base">Unresolved Tickets</h4>
                      <button onClick={() => setActiveTab('messages')} className="text-xs text-[#ff3c00] hover:underline font-mono">Moderate inbox</button>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      {messages.slice(0, 3).map((m) => (
                        <div key={m.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1">
                          <p className="text-slate-200 font-bold">{m.subject}</p>
                          <p className="text-slate-450 text-slate-400 truncate text-[11px]">{m.message}</p>
                          <p className="text-[10px] text-slate-500 font-mono pt-1 uppercase">FROM: {m.name} ({m.email})</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: RECORD SHIPMENT (CREATE & EDIT) */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-900 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-sans text-white">
                      {editingShipment ? `Edit Shipment: ${editingShipment.trackingId}` : 'Initiate Cargo Waybill'}
                    </h2>
                    <p className="text-slate-400 text-xs font-mono">Record sender, rec, volumetric profiles, and progress multipliers.</p>
                  </div>
                  {editingShipment && (
                    <button
                      onClick={resetShipmentForm}
                      className="bg-slate-900 border border-slate-800 text-slate-350 hover:text-white px-4 py-2 rounded-lg text-xs font-mono cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* General Forms Panel */}
                  <form onSubmit={handleSaveShipment} className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-6 shadow-2xl">
                    
                    {/* Unique Ref tracker generator row */}
                    <div className="flex items-center gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-850 flex-wrap sm:flex-nowrap justify-between">
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-[#ff3c00] font-mono">Consignment Ref reference *</span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SC-100456"
                          value={trackingIdForm}
                          onChange={(e) => setTrackingIdForm(e.target.value.toUpperCase())}
                          className="bg-transparent font-mono font-bold text-sm text-white focus:outline-none w-52 placeholder-slate-700 mt-1 uppercase"
                        />
                      </div>
                      {!editingShipment && (
                        <button
                          type="button"
                          onClick={handleGenerateTrackingId}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-[#ff3c00] text-xs font-mono font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Auto Generate ID
                        </button>
                      )}
                    </div>

                    {/* Spitted SENDER / RECIPIENT Grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      
                      {/* SENDER BOX */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-xs space-y-4">
                        <span className="font-bold text-slate-400 font-mono block">CONSIGNOR (SENDER)</span>
                        
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold uppercase">FULL NAME</label>
                          <input
                            type="text"
                            required
                            placeholder="Dieter Muller"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-semibold uppercase">EMAIL</label>
                            <input
                              type="email"
                              placeholder="muller@deutsch.de"
                              value={senderEmail}
                              onChange={(e) => setSenderEmail(e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-500 font-semibold uppercase">PHONE</label>
                            <input
                              type="text"
                              placeholder="+49 69 987"
                              value={senderPhone}
                              onChange={(e) => setSenderPhone(e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold uppercase">ADDRESS</label>
                          <input
                            type="text"
                            placeholder="Industriestrasse 12, Frankfurt"
                            value={senderAddress}
                            onChange={(e) => setSenderAddress(e.target.value)}
                            className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                          />
                        </div>

                      </div>

                      {/* RECIPIENT BOX */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-xs space-y-4">
                        <span className="font-bold text-slate-400 font-mono block">CONSIGNEE (RECIPIENT)</span>
                        
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold uppercase">FULL NAME</label>
                          <input
                            type="text"
                            required
                            placeholder="Sarah Jenkins"
                            value={recName}
                            onChange={(e) => setRecName(e.target.value)}
                            className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-semibold uppercase">EMAIL</label>
                            <input
                              type="email"
                              placeholder="sjenkins@apex.com"
                              value={recEmail}
                              onChange={(e) => setRecEmail(e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-500 font-semibold uppercase">PHONE</label>
                            <input
                              type="text"
                              placeholder="+1 212 555"
                              value={recPhone}
                              onChange={(e) => setRecPhone(e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold uppercase">ADDRESS</label>
                          <input
                            type="text"
                            placeholder="450 Lexington Ave, New York"
                            value={recAddress}
                            onChange={(e) => setRecAddress(e.target.value)}
                            className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white font-sans text-xs"
                          />
                        </div>

                      </div>

                    </div>

                    {/* Origin / Dest split */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      
                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">ORIGIN AIRPORT/DOCK *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Frankfurt Airport FRA"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">DESTINATION PORT *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. JFK Airport New York"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        />
                      </div>

                    </div>

                    {/* Weight / dimensions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      
                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">GROSS WEIGHT (KG) *</label>
                        <input
                          type="number"
                          required
                          value={weight}
                          onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">CARRIAGE METHOD *</label>
                        <select
                          value={shipType}
                          onChange={(e) => setShipType(e.target.value as any)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        >
                          <option value="Air Freight">Air Freight</option>
                          <option value="Sea Freight">Sea Freight</option>
                          <option value="Road Freight">Road Freight</option>
                          <option value="Express Delivery">Expedited Courier</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">ESTIMATED ETA DATE *</label>
                        <input
                          type="date"
                          required
                          value={eta}
                          onChange={(e) => setEta(e.target.value)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        />
                      </div>

                    </div>

                    {/* Progress / Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-slate-805 pt-4">
                      
                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">DISPATCH STATUS *</label>
                        <select
                          value={shipStatus}
                          onChange={(e) => setShipStatus(e.target.value as any)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Departed Facility">Departed Facility</option>
                          <option value="Arrived Facility">Arrived Facility</option>
                          <option value="Customs Clearance">Customs Clearance</option>
                          <option value="Border Check">Border Check</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Held">Held by Agency</option>
                          <option value="Delayed">Delayed Status</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-slate-400">
                          <label className="font-bold uppercase">PROGRESS</label>
                          <span className="font-bold text-white">{progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) => setProgress(parseInt(e.target.value))}
                          className="w-full accent-[#ff3c00] cursor-pointer mt-3"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-400 font-bold uppercase">TARIFF COST ($ USD) *</label>
                        <input
                          type="number"
                          required
                          value={cost}
                          onChange={(e) => setCost(parseFloat(e.target.value) || 100)}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                        />
                      </div>

                    </div>

                    {/* Note */}
                    <div className="space-y-1.5 text-xs">
                      <label className="font-mono text-slate-400 font-bold uppercase">INTERNAL CARRIER DISPATCH LOGS/NOTES</label>
                      <textarea
                        rows={3}
                        placeholder="Quarantine instructions, terminal gates details..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#ff3c00] hover:bg-[#e03500] text-white font-bold py-3.5 rounded-xl text-center text-sm shadow-xl shadow-[#ff3c00]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-4.5 w-4.5" />
                      <span>{editingShipment ? 'REWRITE MANIFEST' : 'COMPILE WAYBILL'}</span>
                    </button>

                  </form>

                  {/* Sidebar Add timelime checkpoint list (ONLY when editing of existing shipment) (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    {editingShipment ? (
                      <form onSubmit={handleAddTimelineEvent} className="bg-slate-900 border border-slate-850 rounded-2xl p-6.5 space-y-4 shadow-xl text-xs">
                        
                        <div className="border-b border-slate-800 pb-3">
                          <h4 className="font-bold text-white text-sm">Add Transit Waypoint</h4>
                          <p className="text-slate-500 font-mono text-[10px] mt-0.5">Append new checkpoints to the waybill.</p>
                        </div>

                        {/* Timeline fields */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="font-mono text-slate-500">DATE</label>
                            <input
                              type="date"
                              required
                              value={timelineDate}
                              onChange={(e) => setTimelineDate(e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-mono text-slate-500">TIME</label>
                            <input
                              type="text"
                              placeholder="e.g. 14:15"
                              required
                              value={timelineTime}
                              onChange={(e) => setTimelineTime(e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-white text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-slate-400">LOCATION *</label>
                          <input
                            type="text"
                            placeholder="e.g. London Heathrow HUB LHR"
                            required
                            value={timelineLoc}
                            onChange={(e) => setTimelineLoc(e.target.value)}
                            className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-slate-400">CHECKPOINT STATUS *</label>
                          <select
                            value={timelineStatus}
                            onChange={(e) => setTimelineStatus(e.target.value as any)}
                            className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Departed Facility">Departed Facility</option>
                            <option value="Arrived Facility">Arrived Facility</option>
                            <option value="Customs Clearance">Customs Clearance</option>
                            <option value="Border Check">Border Check</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Held">Held by Agency</option>
                            <option value="Delayed">Delayed Status</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-slate-400">EXPLANATION *</label>
                          <textarea
                            rows={3}
                            placeholder="Sorting underway..."
                            required
                            value={timelineDesc}
                            onChange={(e) => setTimelineDesc(e.target.value)}
                            className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-[#0c1424] font-bold p-3 rounded-xl w-full text-center transition-colors cursor-pointer"
                        >
                          Append Waypoint
                        </button>

                      </form>
                    ) : (
                      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-start gap-3">
                        <Info className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-400 leading-relaxed text-xs font-sans">
                          <strong>Route Waypoint Note:</strong> Checkpoint timeline lists and custom transit GPS coordinates can be added *after* the waybill is created. Modify any shipment from the Directory to access this panel.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: WAYBILL DIRECTORY LIST */}
            {activeTab === 'directory' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">Active Cargo registers</h2>
                    <p className="text-slate-400 text-xs font-mono">Filter and moderate global consignment manifests.</p>
                  </div>
                  
                  {/* SEARCH & FILTERS */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs w-48">
                      <Search className="h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search ref ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white font-mono p-2 focus:outline-none w-full text-xs"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"
                    >
                      <option value="ALL">ALL STATUSES</option>
                      <option value="Pending">Pending</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Held">Held</option>
                    </select>
                  </div>
                </div>

                {/* Directory Table */}
                <div className="bg-slate-900 border border-slate-805 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {filteredShipments.length === 0 ? (
                    <div className="py-20 text-center font-mono text-xs text-slate-500">
                      <Briefcase className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                      No active registry folders matches search criteria.
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                            <th className="p-4">Waybill ID</th>
                            <th className="p-4">Origin / Dest</th>
                            <th className="p-4">Cargo Method</th>
                            <th className="p-4">Weight (KG)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {filteredShipments.map((ship) => (
                            <tr key={ship.trackingId} className="hover:bg-slate-950/40 transition-colors">
                              <td className="p-4 font-mono font-bold text-white">{ship.trackingId}</td>
                              <td className="p-4">
                                <p className="font-bold text-slate-205 text-slate-300">{ship.origin.split(' ')[0]} ➔ {ship.destination.split(' ')[0]}</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 mt-1">ETA: {ship.estimatedDelivery}</p>
                              </td>
                              <td className="p-4">{ship.shipmentType}</td>
                              <td className="p-4 font-mono">{ship.weight} KG</td>
                              <td className="p-4">
                                <span className="font-bold text-[10px] font-mono tracking-wider uppercase border border-slate-800 px-2 py-0.5 rounded-full bg-slate-950 text-slate-300">
                                  {ship.shipmentStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center space-x-2.5">
                                  <button
                                    onClick={() => handleEditShipmentClick(ship)}
                                    className="p-1.5 bg-slate-950 hover:bg-[#ff3c00] text-slate-400 hover:text-white rounded border border-slate-850 hover:border-transparent transition-colors cursor-pointer"
                                    title="Edit general details and append transit waypoints"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedInvoiceShipment(ship)}
                                    className="p-1.5 bg-slate-950 hover:bg-amber-505 hover:bg-amber-550 hover:bg-amber-500 text-slate-400 hover:text-white rounded border border-slate-850 hover:border-transparent transition-colors cursor-pointer"
                                    title="Generate, Preview and Download Professional Invoice Receipt"
                                  >
                                    <ScrollText className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShipment(ship.trackingId)}
                                    className="p-1.5 bg-slate-950 hover:bg-rose-500 text-slate-400 hover:text-white rounded border border-slate-850 hover:border-transparent transition-colors cursor-pointer"
                                    title="Erase waybill record completely"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 4: MESSAGE CENTER INBOX */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Client Inquiry Inbox</h2>
                  <p className="text-slate-400 text-xs font-mono mt-0.5">Moderate custom clearance escalations and cargo estimations inquiries.</p>
                </div>

                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-16 text-center font-mono text-xs text-slate-500 rounded-2xl flex flex-col items-center">
                      <Mail className="h-10 w-10 text-slate-700 mb-3" />
                      Inquiry repository folder is empty.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative space-y-4">
                        
                        {/* Status flag corners */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="font-mono text-[#ff3c00] font-extrabold text-[10px] block py-0.5 uppercase tracking-wider">
                              INBOX REFERENCE: {m.id}
                            </span>
                            <h4 className="text-white font-bold font-sans text-base leading-none">{m.subject}</h4>
                          </div>

                          <div className="flex space-x-2">
                            {['unread', 'read', 'replied'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleModerateMessage(m.id, st as any)}
                                className={`px-2 py-0.8 text-[10px] font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                                  m.status === st 
                                    ? 'bg-slate-950 text-white border-slate-700' 
                                    : 'bg-slate-900 text-slate-500 border-transparent hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 text-slate-350 leading-relaxed text-xs md:text-sm">
                          {m.message}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between text-[11px] font-mono text-slate-500 gap-2 font-semibold">
                          <span>COMMUNICANT: <strong className="text-white">{m.name}</strong> ({m.email})</span>
                          <span>RECEIVED ON: {new Date(m.createdAt).toLocaleString()}</span>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* TAB 5: SITE BRANDING SITE DETAILS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6.5 shadow-2xl space-y-6 max-w-2xl text-xs">
                <div>
                  <h2 className="text-2xl font-bold text-white font-sans">Branding Settings Cockpit</h2>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">Modify homepage website layout name, office support numbers, hours and locations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-slate-500">WEBSITE NAME CORPORATE</label>
                    <input
                      type="text"
                      required
                      value={brandingName}
                      onChange={(e) => setBrandingName(e.target.value)}
                      className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-slate-500">OPERATIONS REACH TELEPHONE</label>
                    <input
                      type="text"
                      required
                      value={brandingPhone}
                      onChange={(e) => setBrandingPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-slate-500">SUPPORT DESK EMAIL</label>
                  <input
                    type="email"
                    required
                    value={brandingEmail}
                    onChange={(e) => setBrandingEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-slate-500">GLOBAL HEADQUARTERS PHYSICAL ADDRESS</label>
                  <input
                    type="text"
                    required
                    value={brandingAddress}
                    onChange={(e) => setBrandingAddress(e.target.value)}
                    className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-slate-500">SUPPORT OPERATIONS CODES HOURLY</label>
                  <input
                    type="text"
                    required
                    value={brandingHours}
                    onChange={(e) => setBrandingHours(e.target.value)}
                    className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg w-full text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#ff3c00] hover:bg-[#e03500] text-white font-bold p-3.5 rounded-xl text-center w-full shadow-lg shadow-[#ff3c00]/10 cursor-pointer"
                >
                  Write Settings Checklist
                </button>

              </form>
            )}

            {/* TAB 6: ACTIVITY LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-6 font-mono text-xs">
                <div>
                  <h2 className="text-2xl font-bold text-white font-sans">Auditable Administrative Logs</h2>
                  <p className="text-slate-450 text-slate-400 text-xs font-mono mt-0.5">Chronologically sorted immutables logs.</p>
                </div>

                <div className="bg-slate-900 border border-slate-805 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {logs.length === 0 ? (
                    <div className="py-20 text-center text-slate-500">
                      Empty log repository folder.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-850 leading-relaxed max-h-[70vh] overflow-y-auto">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-slate-950/40 flex flex-col sm:flex-row justify-between gap-4 font-mono">
                          <div className="space-y-1 flex-1">
                            <span className="text-[#ff3c00] font-extrabold uppercase text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                              {log.action}
                            </span>
                            <span className="text-emerald-500 font-extrabold uppercase text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850 ml-2">
                              {log.id}
                            </span>
                            <p className="text-white mt-2 font-sans font-bold text-sm leading-tight">{log.details}</p>
                            <p className="text-slate-500 text-[10px] uppercase font-mono mt-1">ADMINISTRATOR: {log.adminEmail}</p>
                          </div>
                          
                          <span className="text-slate-400 text-[10px] font-mono text-right whitespace-nowrap self-start">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 7: SUPPORT COCKPIT (LIVE CHAT SYSTEM) */}
            {activeTab === 'chat' && (
              <div id="support_cockpit_view" className="space-y-6 flex flex-col h-[78vh]">
                <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-[#ff3c00]" /> Support Cockpit
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5 font-mono">Real-time carrier helpline logistics support ticketing dashboard.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-950 font-mono px-3 py-1.5 rounded-lg border border-slate-850 text-slate-400 flex items-center gap-1.5 uppercase leading-none">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Listeners Synced
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                  
                  {/* CONVERSATIONS DIRECTORY PANEL */}
                  <div className="lg:col-span-4 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden min-h-0">
                    {/* Panel Search / Filter Controls */}
                    <div className="p-3.5 border-b border-slate-850 bg-slate-950/40 space-y-3 flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-[#ff3c00]"
                        />
                      </div>

                      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-[10px] font-mono uppercase font-bold text-slate-400 gap-1 flex-wrap">
                        {['all', 'open', 'closed', 'resolved', 'archived'].map((filt) => (
                          <button
                            key={filt}
                            onClick={() => setChatStatusFilter(filt as any)}
                            className={`flex-1 min-w-[50px] py-1 rounded-md text-center transition-all cursor-pointer ${
                              chatStatusFilter === filt ? 'bg-[#ff3c00]/15 text-[#ff3c00]' : 'hover:text-white'
                            }`}
                          >
                            {filt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
                      {allChats.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2 select-none">
                          <MessageSquare className="h-8 w-8 text-slate-700" />
                          <span className="text-[11px] font-mono text-slate-500 uppercase">NO ACTIVE SUPPORT WIDGETS</span>
                        </div>
                      ) : (
                        allChats
                          .filter(chat => {
                            const term = chatSearchQuery.toLowerCase().trim();
                            const nameMatch = chat.userName.toLowerCase().includes(term);
                            const emailMatch = chat.userEmail.toLowerCase().includes(term);
                            const idMatch = chat.chatId.toLowerCase().includes(term);
                            
                            const status = chat.status || 'open';
                            const statMatch = chatStatusFilter === 'all' || status === chatStatusFilter;
                            return (nameMatch || emailMatch || idMatch) && statMatch;
                          })
                          .map((conv) => {
                            const isActive = activeChatId === conv.chatId;
                            const isAssigned = conv.adminAssigned === adminEmail;
                            return (
                              <div
                                key={conv.chatId}
                                onClick={() => setActiveChatId(conv.chatId)}
                                className={`p-3.5 text-left transition-colors cursor-pointer relative flex items-start gap-3 select-none border-l-2 ${
                                  isActive ? 'bg-slate-950/60 border-l-[#ff3c00]' : 'border-l-transparent hover:bg-slate-950/20'
                                }`}
                              >
                                <div className="relative flex-shrink-0">
                                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    isActive ? 'bg-[#ff3c00]/10 text-[#ff3c00]' : 'bg-slate-950 text-slate-400 border border-slate-850'
                                  }`}>
                                    {conv.userName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${
                                    conv.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                                  }`} />
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex justify-between items-center bg-transparent">
                                    <span className="font-bold text-slate-200 block truncate text-xs">{conv.userName}</span>
                                    <span className="text-[8px] font-mono text-slate-500">
                                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center text-[11px] gap-1.5 bg-transparent">
                                    <p className="text-slate-450 text-slate-450 text-slate-400 truncate flex-1 leading-normal">{conv.lastMessage || 'Sent attachment'}</p>
                                    {conv.unreadCount > 0 && (
                                      <button
                                        type="button"
                                        title="Clear unread notifications"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markChatAsRead(conv.chatId, 'admin');
                                        }}
                                        className="h-4.5 w-4.5 bg-[#ff3c00] hover:bg-emerald-600 active:scale-95 text-white rounded-full font-mono font-bold text-[9px] flex items-center justify-center leading-none flex-shrink-0 cursor-pointer duration-150 transition-colors"
                                      >
                                        {conv.unreadCount}
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex justify-between items-center pt-0.5 bg-transparent leading-none">
                                    {conv.adminAssigned ? (
                                      <span className={`text-[8px] font-mono font-bold uppercase rounded px-1.5 py-0.5 border ${
                                        isAssigned 
                                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                                          : 'bg-slate-950 text-slate-550 text-slate-400 border-slate-850'
                                      }`}>
                                        Agent: {conv.adminAssigned.split('@')[0]}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] text-orange-500 font-mono font-extrabold uppercase animate-pulse border border-orange-900/30 bg-orange-950/15 rounded px-1.5 py-0.5 leading-none">
                                        UNASSIGNED
                                      </span>
                                    )}

                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handlePurgeChat(conv.chatId); }}
                                      className="p-1 rounded hover:bg-red-950/20 text-slate-500 hover:text-red-550 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* ACTIVE CONVERSATION MESSENGER STREAM */}
                  <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden min-h-0 relative">
                    {activeChat ? (
                      <div className="flex-1 flex flex-col min-h-0 bg-transparent">
                        {/* Stream Header */}
                        <div className="p-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center flex-shrink-0">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5 select-all">
                              {activeChat.userName} 
                              <span className="text-[10px] font-mono text-slate-450 font-normal">({activeChat.userEmail})</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1.5 mt-0.5 select-none leading-none">
                              <span>WAYBILL WAY: {activeChat.chatId}</span>
                              <span className="text-slate-600">•</span>
                              <span className={activeChat.status === 'open' ? 'text-emerald-400' : 'text-slate-550 text-slate-500'}>
                                STATUS: {activeChat.status.toUpperCase()}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {!activeChat.adminAssigned ? (
                              <button
                                onClick={() => handleClaimChat(activeChat.chatId)}
                                className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-emerald-950/40 border border-emerald-900/40 hover:bg-emerald-900 text-emerald-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                Claim Call
                              </button>
                            ) : activeChat.adminAssigned !== adminEmail ? (
                              <div className="text-[9px] font-mono font-bold uppercase rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-450 border border-slate-850">
                                Assigned: {activeChat.adminAssigned.split('@')[0]}
                              </div>
                            ) : (
                              <div className="text-[9px] font-mono font-bold uppercase rounded-lg px-2.5 py-1.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
                                Active Handler
                              </div>
                            )}

                            {activeChat.status === 'open' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateChatStatus(activeChat.chatId, 'closed')}
                                  className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-slate-950 hover:bg-orange-650 hover:bg-orange-600 border border-slate-850 text-orange-400 hover:text-white rounded-lg transition-all cursor-pointer"
                                >
                                  Close Call
                                </button>
                                <button
                                  onClick={() => handleUpdateChatStatus(activeChat.chatId, 'resolved')}
                                  className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-slate-950 hover:bg-emerald-600 border border-slate-850 text-emerald-400 hover:text-white rounded-lg transition-all cursor-pointer"
                                >
                                  Mark Resolved
                                </button>
                                <button
                                  onClick={() => handleUpdateChatStatus(activeChat.chatId, 'archived')}
                                  className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-slate-950 hover:bg-slate-700 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                                >
                                  Archive
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleUpdateChatStatus(activeChat.chatId, 'open')}
                                className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-[#ff3c00]/10 hover:bg-[#ff3c00] border border-[#ff3c00]/25 text-[#ff3c00] hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                Reopen Ticket
                              </button>
                            )}

                            {!activeChat.isBlocked ? (
                              <button
                                title="Block user from support system"
                                onClick={() => handleBlockEmail(activeChat.userEmail)}
                                className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-red-950/25 hover:bg-red-600 border border-red-900/30 text-red-450 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                Block User
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono font-bold uppercase rounded-lg px-2.5 py-1.5 bg-red-950/40 text-red-400 border border-red-900/40 select-none">
                                User Blocked
                              </span>
                            )}

                            <button
                              title="Purge all messages in this conversation ledger"
                              onClick={() => handleClearHistory(activeChat.chatId)}
                              className="px-2.5 py-1.5 text-[9px] font-extrabold font-mono uppercase bg-slate-950 hover:bg-red-950 text-slate-450 border border-slate-850 text-slate-450 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                            >
                              Clear Messages
                            </button>

                            <button
                              title="Permanently remove conversation container"
                              onClick={() => handlePurgeChat(activeChat.chatId)}
                              className="p-1.5 border border-slate-850 rounded-lg hover:bg-red-950/35 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Stream Area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-950/20 text-xs leading-normal flex flex-col justify-start">
                          {activeChat.messages.map((entry, idx) => {
                            const isUserSender = entry.sender === 'user';
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col ${isUserSender ? 'items-start' : 'items-end'} max-w-[80%] ${
                                  isUserSender ? 'self-start' : 'self-end'
                                } space-y-1`}
                              >
                                <span className="text-[8px] font-mono text-slate-500 uppercase px-1">
                                  {isUserSender ? activeChat.userName : 'SwiftCarrier Agent'}
                                </span>

                                <div className="flex items-center gap-2 max-w-full group">
                                  {!isUserSender && (
                                    <button
                                      type="button"
                                      title="Delete message bubble"
                                      onClick={() => handleDeleteSingleMsg(activeChat.chatId, entry.timestamp)}
                                      className="p-1 px-1.5 bg-slate-950/60 border border-slate-850 text-slate-500 hover:text-red-550 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95 flex items-center cursor-pointer flex-shrink-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}

                                  <div className={`p-3 rounded-2xl leading-relaxed ${
                                    isUserSender 
                                      ? 'bg-slate-950 text-slate-100 rounded-tl-none border border-slate-850' 
                                      : 'bg-[#ff3c00]/95 text-white rounded-tr-none border border-[#ff3c00]/5 shadow-lg shadow-[#ff3c00]/5'
                                  }`}>
                                    {entry.attachmentUrl && (
                                      <div className={`mb-2.5 p-2 rounded-lg flex items-center gap-2 border ${
                                        isUserSender ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-red-800/20 border-red-700/20 text-red-100'
                                      }`}>
                                        <Globe className="h-4 w-4 flex-shrink-0 text-[#ff3c00]" />
                                        <div className="truncate flex-1">
                                          <span className="font-bold block truncate text-[10px] leading-tight mb-0.5">{entry.attachmentName}</span>
                                          <span className="text-[8px] font-mono opacity-80 uppercase block leading-none">{entry.attachmentType} reference</span>
                                        </div>
                                        <a
                                          href={entry.attachmentUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-1 rounded bg-slate-900 hover:bg-slate-950 text-[#ff3c00]"
                                        >
                                          <ArrowUpRight className="h-3.5 w-3.5" />
                                        </a>
                                      </div>
                                    )}
                                    <p className="whitespace-pre-wrap select-all">{entry.message}</p>
                                  </div>

                                  {isUserSender && (
                                    <button
                                      type="button"
                                      title="Delete message bubble"
                                      onClick={() => handleDeleteSingleMsg(activeChat.chatId, entry.timestamp)}
                                      className="p-1 px-1.5 bg-slate-950/60 border border-slate-850 text-slate-500 hover:text-red-550 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95 flex items-center cursor-pointer flex-shrink-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center space-x-1.5 px-1 bg-transparent text-slate-500">
                                  <span className="text-[8px] font-mono">
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {entry.sender === 'user' && entry.readStatus === 'read' && (
                                    <CheckCheck className="h-3 w-3 text-emerald-450 text-emerald-400" />
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {activeChat.userTyping && (
                            <div className="flex items-start max-w-[80%] self-start space-y-1 items-end">
                              <div className="bg-slate-950 text-slate-400 p-2.5 px-3 rounded-2xl rounded-tl-none border border-slate-850 text-[10px] font-mono flex items-center space-x-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#ff3c00] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-[#ff3c00] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-[#ff3c00] animate-bounce" style={{ animationDelay: '300ms' }} />
                                <span className="pl-1 uppercase text-[8px] text-slate-500 bg-transparent">CLIENT COMPOSING MESSAGE</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Reply Input Box */}
                        <div className="p-3 border-t border-slate-850 bg-slate-955 bg-slate-950/40 flex-shrink-0">
                          <form onSubmit={handleSendAdminReply} className="flex gap-2">
                            <input
                              type="text"
                              value={replyMessage}
                              onChange={handleAdminReplInput}
                              placeholder={activeChat.status === 'resolved' ? 'Case is marked complete. Reply to reopen...' : 'Dial admin support response...'}
                              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff3c00]"
                            />
                            <button
                              type="submit"
                              disabled={!replyMessage.trim()}
                              className="px-5 py-2.5 bg-[#ff3c00] hover:bg-[#e03500] disabled:bg-slate-850 text-white disabled:text-slate-500 font-extrabold rounded-xl text-xs uppercase font-mono transition-colors cursor-pointer"
                            >
                              Send Response
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-slate-500 select-none">
                        <MessageSquare className="h-14 w-14 text-slate-800 mb-2.5" />
                        <h4 className="font-bold text-white text-xs uppercase font-mono">SUPPORT TICKET NOT SELECTED</h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                          Select a support waybill from the left panel to inspect customer device parameters, typing snapshots, and dispatch real-time helpdesk responses.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 8: SECURITY PROFILE CENTER (`activeTab === 'profile'`) */}
            {activeTab === 'profile' && (
              <div id="security_profile_view" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
                    <KeyRound className="h-6 w-6 text-[#ff3c00]" /> Security Center
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">Administration credentials configurations, security re-verifications, and diagnostic watchdogs.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* LEFT: SESSION METADATA PANEL */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                    <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wider font-mono pb-2 border-b border-slate-850 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#ff3c00]" /> Active Audit Core
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-slate-450 text-slate-400 font-mono uppercase text-[8.5px] block">SECURITY ROLE</span>
                        <span className="font-bold text-slate-200">System Inspector / Administrator</span>
                      </div>
                      
                      <div>
                        <span className="text-slate-450 text-slate-405 text-slate-400 font-mono uppercase text-[8.5px] block">LOGGED IDENTITY</span>
                        <span className="font-bold text-slate-200 select-all">{adminEmail}</span>
                      </div>

                      <div>
                        <span className="text-slate-455 text-slate-400 font-mono uppercase text-[8.5px] block">ACTIVE SESSION DURATION</span>
                        <span className="font-mono text-xs font-bold text-amber-500">
                          {Math.floor(sessionElapsed / 60)}m {sessionElapsed % 60}s
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-455 text-slate-400 font-mono uppercase text-[8.5px] block">SECURITY PROTOCOL</span>
                        <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold tracking-wider font-mono border uppercase mt-1 bg-emerald-950/20 text-emerald-400 border-emerald-900/30">
                          Secure Encrypted Node
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Do you want to securely seal your console keys and sign out?")) {
                              handleLogout();
                            }
                          }}
                          className="w-full py-2.5 px-3 bg-red-950/25 hover:bg-rose-900 hover:text-white border border-red-900/40 text-rose-350 text-rose-500 rounded-xl font-bold font-mono uppercase text-[9.5px] text-center transition-all cursor-pointer"
                        >
                          Lock Cockpit controls
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CENTER/RIGHT: SECURE FORM UPDATING */}
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
                    <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wider font-mono pb-2 border-b border-slate-850 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-[#ff3c00]" /> Secure credentials controller
                    </h3>

                    <form onSubmit={handleUpdateAdminProfileCredentials} className="space-y-4 text-xs select-none">
                      
                      <div className="space-y-1.5 text-slate-450 text-slate-400 font-mono uppercase text-[8.5px]">
                        <label>ADMIN SECURITY USERNAME / EMAIL</label>
                        <input
                          type="email"
                          required
                          value={systemEmailInput}
                          onChange={(e) => setSystemEmailInput(e.target.value)}
                          className="w-full bg-slate-100/5 focus:bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff3c00] font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-slate-450 text-slate-400 font-mono uppercase text-[8.5px]">
                          <label>NEW SECURITY ACCESS PASSCODE</label>
                          <input
                            type="password"
                            placeholder="Type to configure new"
                            value={systemNewPass}
                            onChange={(e) => setSystemNewPass(e.target.value)}
                            className="w-full bg-slate-100/5 focus:bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff3c00] font-sans"
                          />
                        </div>

                        <div className="space-y-1.5 text-slate-455 text-slate-400 font-mono uppercase text-[8.5px]">
                          <label>CONFIRM NEW ACCESS PASSCODE</label>
                          <input
                            type="password"
                            placeholder="Re-type to verify new"
                            value={systemConfirmPass}
                            onChange={(e) => setSystemConfirmPass(e.target.value)}
                            className="w-full bg-slate-100/5 focus:bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff3c00] font-sans"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-850">
                        <div className="bg-slate-950/70 border border-slate-855 border-slate-850 rounded-2xl p-3.5 space-y-3">
                          <div className="flex gap-2 text-[10px] leading-relaxed text-slate-400">
                            <ShieldAlert className="h-4.5 w-4.5 text-[#ff3c00] flex-shrink-0" />
                            <div>
                              <span className="font-bold text-slate-205 text-slate-200 block uppercase font-mono tracking-tight">Access re-authentication required</span>
                              To push credential updates securely, verification checking using your CURRENT ACTIVE PASSWORD is required.
                            </div>
                          </div>

                          <div className="space-y-1.5 text-slate-450 text-slate-400 font-mono uppercase text-[8.5px]">
                            <label className="text-[#ff3c00] font-bold">CURRENT ACTIVE PASSWORD *</label>
                            <input
                              type="password"
                              required={!isDemoMode}
                              placeholder="••••••••"
                              value={systemPassInput}
                              onChange={(e) => setSystemPassInput(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff3c00] font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-850">
                        <button
                          type="button"
                          onClick={handlePasswordResetTrigger}
                          className="w-full sm:w-auto py-3 px-4 bg-slate-950 border border-slate-850 text-slate-350 hover:text-white rounded-xl font-bold font-mono uppercase text-[9px] hover:text-[#ff3c00] hover:border-[#ff3c00] text-center transition-all cursor-pointer leading-none"
                        >
                          Dispatched Password Reset Link
                        </button>

                        <button
                          type="submit"
                          disabled={credentialsProcessing}
                          className="w-full sm:w-auto py-3 px-6 bg-[#ff3c00] hover:bg-[#e03500] disabled:bg-slate-850 text-white font-bold rounded-xl text-xs uppercase font-mono transition-colors cursor-pointer"
                        >
                          {credentialsProcessing ? 'Authenticating updates...' : 'Commit credentials overrides'}
                        </button>
                      </div>

                    </form>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {selectedInvoiceShipment && (
        <ShipmentInvoiceModal
          shipment={selectedInvoiceShipment}
          onClose={() => setSelectedInvoiceShipment(null)}
        />
      )}

    </div>
  );
};
