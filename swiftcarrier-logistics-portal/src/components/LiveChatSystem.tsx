import React, { useState, useEffect, useRef } from 'react';
import { useLogistics } from '../LogisticsContext';
import { Radio, X, Send, User, ChevronDown, Sparkles, MessageSquareCode } from 'lucide-react';

export const LiveChatSystem: React.FC = () => {
  const { chats, sendUserMessage } = useLogistics();
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inputText, setInputText] = useState('');
  
  // Track continuous temporary session ID for unique chats
  const [userIdSession, setUserIdSession] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, isOpen]);

  // Handle register session
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Build realistic randomized user ID
    const generatedId = `client_${name.replace(/\s+/g, '_').toLowerCase()}_${Math.floor(Math.random() * 8000 + 1000)}`;
    setUserIdSession(generatedId);
    setIsRegistered(true);

    // Seed welcoming intro text trigger
    sendUserMessage(generatedId, `System: Registered session for ${name}. Connecting with line officer.`, name, email);
  };

  // Find active chat messages
  const activeChat = chats.find((c) => c.userId === userIdSession);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendUserMessage(userIdSession, inputText.trim(), name, email);
    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all transform hover:scale-106 hover:rotate-2 relative cursor-pointer group border border-white/10"
        >
          <MessageSquareCode className="h-6 w-6 text-sky-400 group-hover:scale-110 transition-transform" />
          
          {/* Micro active pulsating beacon */}
          <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Actual Chat Window Interface */}
      {isOpen && (
        <div className="w-80 h-[460px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col justify-between overflow-hidden transition-all duration-300 animate-slide-up">
          
          {/* Header Banner */}
          <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sky-400 border border-white/5">
                <Radio className="h-4.5 w-4.5 animate-pulse text-emerald-400" />
              </div>
              <div className="text-left">
                <h4 className="font-heading text-xs font-bold leading-none tracking-tight text-white flex items-center gap-1.5">
                  <span>Apex Dispatch Live</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </h4>
                <span className="text-[10px] text-slate-400 font-light mt-0.5 block">Response level: Fast & Online</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Section */}
          <div className="flex-grow flex flex-col p-4 bg-slate-50 min-h-0">
            
            {/* Registration state */}
            {!isRegistered ? (
              <form onSubmit={handleRegister} className="my-auto space-y-4">
                <div className="text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 mx-auto mb-2">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h5 className="font-heading text-sm font-bold text-slate-900 leading-none">Instant Agent Connect</h5>
                  <p className="text-[11px] text-slate-500 mt-1 font-light leading-normal px-2">Register details below to route messages to local customs warehouses.</p>
                </div>

                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Your Name (e.g. Maria G.)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-white border border-slate-200 focus:border-sky-500 px-3 py-1.5 text-slate-700 outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Contact Email (e.g. name@firm.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-xl bg-white border border-slate-200 focus:border-sky-500 px-3 py-1.5 text-slate-700 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Start Secure Conversation
                </button>
              </form>
            ) : (
              /* Message Thread List Box */
              <div 
                ref={chatContainerRef}
                className="flex-grow space-y-3.5 overflow-y-auto pr-1 text-xs text-left"
              >
                {activeChat && activeChat.messages.length > 0 ? (
                  activeChat.messages.map((m) => {
                    // Skip technical registered message text so layout is super clean
                    if (m.text.startsWith('System:')) return null;

                    const isAgent = m.sender === 'agent';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[85%] ${
                          isAgent ? 'mr-auto items-start' : 'ml-auto items-end'
                        }`}
                      >
                        <div
                          className={`rounded-2xl p-3 shadow-xs leading-normal font-light ${
                            isAgent
                              ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                              : 'bg-slate-900 text-white rounded-tr-none'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                          {isAgent ? 'Officer' : 'You'} • {m.timestamp}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 text-[11px] font-light mt-12 bg-white p-3 border border-slate-100 rounded-xl max-w-xs mx-auto">
                    Type a message below for real-time routing answers.
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Input Footer, only shown if registered */}
          {isRegistered && (
            <form onSubmit={handleSendMessage} className="bg-white px-3 py-3.5 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Ask about your package..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow h-9 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 text-slate-850 px-3 text-xs outline-none transition-all"
              />
              <button
                type="submit"
                className="h-9 w-9 bg-slate-950 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};
