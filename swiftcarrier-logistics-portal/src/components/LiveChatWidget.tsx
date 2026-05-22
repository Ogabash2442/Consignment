/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Paperclip, CheckCheck, Loader2, ShieldCheck, 
  ChevronDown, FileUp, Image, FileText, Globe, AlertCircle, Smile, Trash2
} from 'lucide-react';
import { 
  startSupportChat, listenToChat, sendChatMessage, setChatTypingStatus, 
  markChatAsRead, addSupportSession 
} from '../firebase';
import { Chat, ChatMessage } from '../types';

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // User auth state/info
  const [chatId, setChatId] = useState<string | null>(() => localStorage.getItem('sc_active_chat_id'));
  const [userName, setUserName] = useState(() => localStorage.getItem('sc_user_name') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('sc_user_email') || '');
  const [needsReg, setNeedsReg] = useState(false);

  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Real-time chat state
  const [chat, setChat] = useState<Chat | null>(null);
  
  // Mock Attachments Tray State
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; url: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup unread notifications badge
  useEffect(() => {
    if (chatId) {
      setNeedsReg(false);
    } else {
      setNeedsReg(true);
    }
  }, [chatId]);

  // Connect to the active chat via real-time firebase/local listeners
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToChat(chatId, (updatedChat) => {
      setChat(updatedChat);
      
      if (updatedChat) {
        // Evaluate if any admin message is unread
        const hasUnreadAdminMsg = updatedChat.messages.some(
          m => m.sender === 'admin' && m.readStatus === 'unread'
        );
        if (hasUnreadAdminMsg && !isOpen) {
          setHasUnread(true);
        }
      } else {
        // If chat was deleted on administrative end, reset local state
        localStorage.removeItem('sc_active_chat_id');
        setChatId(null);
        setChat(null);
        setNeedsReg(true);
      }
    });

    return () => unsubscribe();
  }, [chatId, isOpen]);

  // Handle Mark as Read when widget opens
  useEffect(() => {
    if (isOpen && chatId) {
      setHasUnread(false);
      markChatAsRead(chatId, 'user');
    }
  }, [isOpen, chatId, chat?.messages?.length]);

  // Auto-scroll to newest chat entries
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages?.length, chat?.adminTyping, isOpen]);

  // Typing indicator trigger on user side
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!chatId) return;

    if (!isTyping) {
      setIsTyping(true);
      setChatTypingStatus(chatId, 'user', true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setChatTypingStatus(chatId, 'user', false);
    }, 2000);
  };

  // Create new anonymous customer support session
  const handleRegisterSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName || !cleanEmail) return;

    setConnecting(true);
    try {
      const newChatId = await startSupportChat(cleanName, cleanEmail);
      
      // Store customer session metadata
      localStorage.setItem('sc_active_chat_id', newChatId);
      localStorage.setItem('sc_user_name', cleanName);
      localStorage.setItem('sc_user_email', cleanEmail);
      
      setUserName(cleanName);
      setUserEmail(cleanEmail);
      setChatId(newChatId);
      setNeedsReg(false);

      // Add a session log for compliance tracking
      await addSupportSession(newChatId, cleanName, cleanEmail, 'active');
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  // Submit text message or attachments
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId) return;

    const currentMsg = message.trim();
    if (!currentMsg && !attachedFile) return;

    setSending(true);

    // Cancel typing indicator synchronously
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    setChatTypingStatus(chatId, 'user', false);

    try {
      if (attachedFile) {
        await sendChatMessage(chatId, 'user', currentMsg, {
          url: attachedFile.url,
          type: attachedFile.type,
          name: attachedFile.name
        });
        setAttachedFile(null);
      } else {
        await sendChatMessage(chatId, 'user', currentMsg);
      }
      setMessage('');
    } catch (err) {
      console.error("Message delivery failed", err);
    } finally {
      setSending(false);
    }
  };

  // Standard predefined logistics documents that users can simulate attaching
  const handleAttachMockFile = (filename: string, filetype: 'image' | 'document') => {
    const mockFiles: Record<string, string> = {
      'Invoice_CSG928374.pdf': 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
      'Box_Damage_Proof.jpg': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
      'Waybill_Export_Slip.png': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500'
    };

    setAttachedFile({
      name: filename,
      type: filetype,
      url: mockFiles[filename] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c0310d?w=500'
    });
    setShowAttachments(false);
  };

  // Terminate local session
  const handleClearSession = () => {
    if (window.confirm("Do you want to clear your current customer support chat history? This will disconnect you from live agents.")) {
      if (chatId) {
        setChatTypingStatus(chatId, 'user', false);
      }
      localStorage.removeItem('sc_active_chat_id');
      setChatId(null);
      setChat(null);
      setNeedsReg(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-500 font-sans flex flex-col items-end">
      
      {/* Floating Chat Launcher Button */}
      {!isOpen && (
        <button
          id="support_chat_launcher"
          onClick={() => setIsOpen(true)}
          className="relative bg-[#ff3c00] hover:bg-[#e03500] hover:scale-105 active:scale-95 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-xl shadow-[#ff3c00]/30 transition-all cursor-pointer group"
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-6 transition-transform" />
          
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-650 bg-rose-600 text-[10px] font-bold text-white border-2 border-slate-950 animate-bounce">
              !
            </span>
          )}
        </button>
      )}

      {/* Primary Messenger Popup Dialog Box */}
      {isOpen && (
        <div 
          id="support_chat_popup"
          className="bg-slate-900 border border-slate-800 rounded-3xl w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-slide-in-up relative"
        >
          {/* Header */}
          <div className="bg-slate-950 px-5 py-4 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-[#ff3c00]/10 border border-[#ff3c00]/35 flex items-center justify-center text-[#ff3c00]">
                  <Globe className="h-4.5 w-4.5 animate-spin-slow text-[#ff3c00]" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-950 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white leading-normal">SwiftCarrier Live Desk</h3>
                <p className="text-[10px] text-slate-400 font-mono flex items-center uppercase">
                  <span>ONLINE SUPPORT AGENT</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {chatId && (
                <button
                  title="Purge chat database"
                  onClick={handleClearSession}
                  className="p-1 px-1.5 rounded-lg hover:bg-red-950/20 text-slate-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-900 leading-normal text-xs relative flex flex-col justify-start">
            
            {/* STAGE A: Support Registration Form */}
            {needsReg ? (
              <div className="my-auto space-y-5 px-3 py-4 flex flex-col justify-center">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-950/40 border border-[#ff3c00]/20 text-[#ff3c00] mb-1">
                    <ShieldCheck className="h-5.5 w-5.5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Instant Client Assistance</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed max-w-[270px] mx-auto select-none">
                    Start a real-time support conversation directly with corporate logisticians. No registration or complex signup is required.
                  </p>
                </div>

                <form onSubmit={handleRegisterSupport} className="space-y-3">
                  <div className="space-y-1 text-[10px] text-slate-400 uppercase font-mono">
                    <label>CUSTOMER NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sarah Jenkins"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-white text-xs focus:outline-none focus:border-[#ff3c00]"
                    />
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400 uppercase font-mono">
                    <label>CUSTOMER EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., sjenkins@apex.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-white text-xs focus:outline-none focus:border-[#ff3c00]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={connecting}
                    className="w-full bg-[#ff3c00] hover:bg-[#e03500] disabled:bg-[#ff3c00]/60 text-white font-bold p-3 rounded-xl mt-3 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs uppercase font-mono"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Opening Secure Lane...</span>
                      </>
                    ) : (
                      <span>Commence Support Session</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* STAGE B: Conversational Messaging Workspace */
              <div className="space-y-3.5 flex-1 flex flex-col justify-end">
                {chat?.messages.map((msg, index) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} max-w-[85%] ${isAdmin ? 'self-start' : 'self-end'} space-y-1 animate-fade-in`}
                    >
                      {/* Name Header */}
                      <span className="text-[9px] text-slate-500 font-mono uppercase px-1">
                        {isAdmin ? 'ASSIGNED LOGISTICIAN' : chat.userName}
                      </span>

                      {/* Chat Bubbles */}
                      <div className={`p-3 rounded-2xl ${
                        isAdmin 
                          ? 'bg-slate-950 text-slate-100 rounded-tl-none border border-slate-850' 
                          : 'bg-[#ff3c00] text-white rounded-tr-none shadow-lg shadow-[#ff3c00]/5'
                      } break-words leading-relaxed`}>
                        
                        {/* Render Attached File if present */}
                        {msg.attachmentUrl && (
                          <div className={`mb-2 p-2 rounded-lg text-[11px] leading-snug flex items-center gap-2 border ${
                            isAdmin ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-red-800/40 border-red-700/30 text-red-50'
                          }`}>
                            {msg.attachmentType === 'image' ? (
                              <Image className="h-4.5 w-4.5 flex-shrink-0" />
                            ) : (
                              <FileText className="h-4.5 w-4.5 flex-shrink-0" />
                            )}
                            <div className="truncate flex-1 select-all">
                              <span className="font-semibold block truncate leading-none mb-0.5">{msg.attachmentName}</span>
                              <span className="text-[8px] font-mono select-none opacity-80 uppercase">{msg.attachmentType} reference</span>
                            </div>
                            <a 
                              href={msg.attachmentUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`p-1 rounded hover:bg-slate-800 ${isAdmin ? 'text-slate-400 hover:text-white' : 'text-red-100 hover:bg-red-800/60'}`}
                            >
                              <Globe className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}

                        <p>{msg.message}</p>
                      </div>

                      {/* Message Timestamp */}
                      <div className="flex items-center space-x-1.5 px-1">
                        <span className="text-[8px] text-slate-550 mr-1 font-mono text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!isAdmin && msg.readStatus === 'read' && (
                          <CheckCheck className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Blocked user status display */}
                {chat?.isBlocked && (
                  <div className="bg-red-950/25 border border-red-900/35 p-3.5 rounded-2xl text-red-300 text-[11px] flex gap-2.5 leading-relaxed">
                    <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold block text-white uppercase">Access Terminal Suspended</span>
                      Our dispatch agents have suspended communication access on this channel due to shipping service terms violation.
                    </div>
                  </div>
                )}

                {/* Status Callout if conversation marked resolved */}
                {!chat?.isBlocked && chat?.status === 'resolved' && (
                  <div className="bg-emerald-950/25 border border-emerald-900/35 p-3.5 rounded-2xl text-emerald-300 text-[11px] flex flex-col gap-2.5 leading-relaxed">
                    <div className="flex gap-2.5">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-450 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white uppercase">Case Resolved</span>
                        This cargo waypoint issue has been successfully resolved and marked closed by our staff. Thank you for using SwiftCarrier support.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('sc_active_chat_id');
                        setChatId(null);
                        setChat(null);
                        setNeedsReg(true);
                      }}
                      className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-[10px] px-3 py-1.5 rounded-xl uppercase transition-all duration-150 cursor-pointer self-start"
                    >
                      Start New Chat
                    </button>
                  </div>
                )}

                {/* Status Callout if conversation marked closed */}
                {!chat?.isBlocked && chat?.status === 'closed' && (
                  <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-slate-300 text-[11px] flex flex-col gap-2.5 leading-relaxed">
                    <div className="flex gap-2.5">
                      <AlertCircle className="h-4.5 w-4.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white uppercase font-sans">Conversation Closed</span>
                        This support conversation has been closed. Please start a new chat for further assistance.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('sc_active_chat_id');
                        setChatId(null);
                        setChat(null);
                        setNeedsReg(true);
                      }}
                      className="mt-1 bg-[#ff3c00] hover:bg-[#e03500] text-white font-bold font-mono text-[10px] px-3 py-1.5 rounded-xl uppercase transition-all duration-150 cursor-pointer self-start"
                    >
                      Start New Chat
                    </button>
                  </div>
                )}

                {/* Status Callout if conversation marked archived */}
                {!chat?.isBlocked && chat?.status === 'archived' && (
                  <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-slate-400 text-[11px] flex flex-col gap-2.5 leading-relaxed">
                    <div className="flex gap-2.5">
                      <AlertCircle className="h-4.5 w-4.5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white uppercase">Chat Archived</span>
                        This interaction has been moved to our historical dispatch archives. If you need any subsequent cargo tracking support, you are welcome to reopen a fresh chat.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('sc_active_chat_id');
                        setChatId(null);
                        setChat(null);
                        setNeedsReg(true);
                      }}
                      className="mt-1 bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono text-[10px] px-3 py-1.5 rounded-xl uppercase transition-all duration-150 cursor-pointer self-start"
                    >
                      Start New Chat
                    </button>
                  </div>
                )}

                {/* Animated Typing Indicator */}
                {chat?.adminTyping && (
                  <div className="flex items-start max-w-[80%] self-start space-y-1 items-end">
                    <div className="bg-slate-950 text-slate-400 p-2.5 px-3 rounded-2xl rounded-tl-none border border-slate-850 text-[10px] font-mono flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff3c00] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff3c00] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff3c00] animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="pl-1 uppercase text-[8px] text-slate-550">OPERATOR DIALING MESSAGE</span>
                    </div>
                  </div>
                )}

                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}

          </div>

          {/* Attachments Tray Dropdown Modal */}
          {showAttachments && (
            <div className="absolute bottom-[66px] left-4 right-4 bg-slate-950 border border-slate-850 rounded-2xl p-3.5 z-40 select-none shadow-xl">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-2 border-b border-slate-850 pb-1.5">
                <span className="flex items-center gap-1"><FileUp className="h-3.5 w-3.5 text-[#ff3c00]" /> Attach Dispatch Documentation</span>
                <button onClick={() => setShowAttachments(false)}><X className="h-3.5 w-3.5 hover:text-white" /></button>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-left font-sans">
                <button 
                  onClick={() => handleAttachMockFile('Invoice_CSG928374.pdf', 'document')}
                  className="w-full text-left p-2 hover:bg-slate-900 rounded-lg text-[11px] text-white flex items-center justify-between border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-cyan-400" /> Invoice_CSG928374.pdf</span>
                  <span className="text-[9px] font-mono text-slate-550">124 KB</span>
                </button>
                <button 
                  onClick={() => handleAttachMockFile('Box_Damage_Proof.jpg', 'image')}
                  className="w-full text-left p-2 hover:bg-slate-900 rounded-lg text-[11px] text-white flex items-center justify-between border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Image className="h-3.5 w-3.5 text-emerald-400" /> Box_Damage_Proof.jpg</span>
                  <span className="text-[9px] font-mono text-slate-550">1.4 MB</span>
                </button>
                <button 
                  onClick={() => handleAttachMockFile('Waybill_Export_Slip.png', 'image')}
                  className="w-full text-left p-2 hover:bg-slate-900 rounded-lg text-[11px] text-white flex items-center justify-between border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Image className="h-3.5 w-3.5 text-amber-500" /> Waybill_Export_Slip.png</span>
                  <span className="text-[9px] font-mono text-slate-550">845 KB</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          {!needsReg && chat?.status === 'open' && !chat?.isBlocked && (
            <div className="bg-slate-950 border-t border-slate-850 p-3">
              {attachedFile && (
                <div className="mb-2 p-2 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2 truncate">
                    {attachedFile.type === 'image' ? (
                      <Image className="h-4.5 w-4.5 text-emerald-450 text-emerald-400" />
                    ) : (
                      <FileText className="h-4.5 w-4.5 text-cyan-400" />
                    )}
                    <span className="text-white font-semibold truncate select-all">{attachedFile.name} (Attached)</span>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  title="Attachment structure list"
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-[#ff3c00] border border-slate-850 transition-colors cursor-pointer"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  placeholder="Dial customer message..."
                  value={message}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#ff3c00]"
                />

                <button
                  type="submit"
                  disabled={sending || (!message.trim() && !attachedFile)}
                  className="p-2.5 rounded-xl bg-[#ff3c00] hover:bg-[#e03500] disabled:bg-slate-850 text-white disabled:text-slate-500 border border-transparent select-none transition-colors cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
