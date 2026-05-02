import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import RoleBadge from '../../components/shared/RoleBadge';
import { Search, Mail, Phone, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Directory() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { socket } = useSocket();
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch directory
  const fetchEmployees = useCallback(() => {
    api.get('/users/directory', { params: search ? { search } : {} })
      .then(res => { setEmployees(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const handleStatus = (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (data.status === 'online') next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    };

    const handleOnlineList = (users) => {
      setOnlineUsers(new Set(users));
    };

    const handleMsg = (data) => {
      // Only add to chat if it's from the currently open chat user
      if (chatUser && data.senderId === chatUser.id) {
        setMessages(prev => [...prev, { ...data, self: false }]);
        // Mark as read
        socket.emit('mark_read', { userId: user.id, senderId: chatUser.id });
      } else if (data.senderId !== user.id) {
        // Find sender name
        const sender = employees.find(e => e.id === data.senderId);
        toast.info(`New message from ${sender?.full_name || 'someone'}`);
      }
    };

    const handleTyping = (data) => {
      if (chatUser && data.senderId === chatUser.id) setTyping(true);
    };
    const handleStopTyping = (data) => {
      if (chatUser && data.senderId === chatUser.id) setTyping(false);
    };

    const handleUpdate = () => fetchEmployees();

    socket.on('user_status', handleStatus);
    socket.on('online_users', handleOnlineList);
    socket.on('private_message', handleMsg);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('user_updated', handleUpdate);

    return () => {
      socket.off('user_status', handleStatus);
      socket.off('online_users', handleOnlineList);
      socket.off('private_message', handleMsg);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('user_updated', handleUpdate);
    };
  }, [socket, chatUser, fetchEmployees, employees, user?.id]);

  // Load chat history when opening a chat
  useEffect(() => {
    if (!chatUser) { setMessages([]); return; }
    setChatLoading(true);
    api.get(`/users/messages/${chatUser.id}`)
      .then(res => {
        const msgs = (res.data.data || []).map(m => ({
          id: m.id,
          text: m.text,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          timestamp: m.created_at,
          self: m.sender_id === user.id,
        }));
        setMessages(msgs);
        setChatLoading(false);
        // Mark as read
        if (socket) socket.emit('mark_read', { userId: user.id, senderId: chatUser.id });
      })
      .catch(() => setChatLoading(false));
  }, [chatUser, user?.id, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !chatUser || !socket) return;
    const payload = { targetId: chatUser.id, text: msgInput.trim(), senderId: user.id };
    socket.emit('private_message', payload);
    setMessages(prev => [...prev, { ...payload, self: true, timestamp: new Date().toISOString() }]);
    setMsgInput('');
    socket.emit('stop_typing', { targetId: chatUser.id, senderId: user.id });
  };

  // Typing indicator
  const handleTypingInput = (e) => {
    setMsgInput(e.target.value);
    if (!socket || !chatUser) return;
    socket.emit('typing', { targetId: chatUser.id, senderId: user.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { targetId: chatUser.id, senderId: user.id });
    }, 1500);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const gradients = [
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
  ];

  const isOnline = (id) => onlineUsers.has(String(id));

  return (
    <div className="space-y-6">
      <PageHeader title="Employee Directory" subtitle="Find and connect with your colleagues." />
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--t-outline)' }} />
        <input type="text" placeholder="Search by name, email, department..." value={search} onChange={e => setSearch(e.target.value)} className="input-glass w-full pl-10 pr-4 py-2.5 text-sm rounded-xl" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center fade-in">
          <p className="text-lg font-semibold" style={{ color: 'var(--t-on-surface)' }}>No employees found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--t-on-surface-variant)' }}>Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map((emp, idx) => (
            <div key={emp.id} className="glass-panel rounded-2xl p-5 flex flex-col items-center text-center fade-in hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: `${idx * 40}ms` }}>
              {/* Avatar with online indicator */}
              <div className="relative mb-3">
                {emp.profile_pic ? (
                  <img src={`${SERVER_URL}${emp.profile_pic}`} alt={emp.full_name} className="w-16 h-16 rounded-full object-cover" style={{ border: '2px solid var(--t-glass-border)' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ background: gradients[idx % gradients.length] }}>
                    {getInitials(emp.full_name)}
                  </div>
                )}
                {/* Online dot */}
                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${isOnline(emp.id) ? 'bg-green-500' : 'bg-gray-400'}`}
                  style={{ borderColor: 'var(--t-surface-container)' }}
                  title={isOnline(emp.id) ? 'Online' : 'Offline'} />
              </div>

              <h3 className="font-semibold text-sm" style={{ color: 'var(--t-on-surface)' }}>{emp.full_name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t-on-surface-variant)' }}>{emp.designation || emp.role?.replace('_', ' ')}</p>
              <div className="mt-2"><RoleBadge role={emp.role} /></div>
              <p className="text-xs mt-2" style={{ color: 'var(--t-on-surface-variant)' }}>{emp.department || '—'}</p>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4">
                {emp.email && (
                  <a href={`mailto:${emp.email}`} title={`Email ${emp.full_name}`}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'var(--t-glass-bg)', border: '1px solid var(--t-glass-border)', color: 'var(--t-on-surface-variant)' }}>
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {emp.phone && (
                  <a href={`tel:${emp.phone}`} title={`Call ${emp.full_name}`}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'var(--t-glass-bg)', border: '1px solid var(--t-glass-border)', color: 'var(--t-on-surface-variant)' }}>
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {emp.id !== user?.id && (
                  <button onClick={() => setChatUser(emp)} title={`Chat with ${emp.full_name}`}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Panel */}
      {chatUser && (
        <div className="fixed bottom-6 right-6 w-96 flex flex-col fade-in z-50 h-[28rem] rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--t-surface-container)', border: '1px solid var(--t-glass-border)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--t-divider)', background: 'var(--t-panel-bg)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                {chatUser.profile_pic ? (
                  <img src={`${SERVER_URL}${chatUser.profile_pic}`} alt="" className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid var(--t-glass-border)' }} />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                    {getInitials(chatUser.full_name)}
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${isOnline(chatUser.id) ? 'bg-green-500' : 'bg-gray-400'}`}
                  style={{ borderColor: 'var(--t-surface-container)' }} />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--t-on-surface)' }}>{chatUser.full_name}</p>
                <p className="text-[11px]" style={{ color: isOnline(chatUser.id) ? '#22c55e' : 'var(--t-on-surface-variant)' }}>
                  {typing ? 'Typing...' : isOnline(chatUser.id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <button onClick={() => setChatUser(null)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--t-on-surface-variant)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ background: 'var(--t-surface)' }}>
            {chatLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--t-outline)' }} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 mb-3" style={{ color: 'var(--t-outline)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--t-on-surface-variant)' }}>No messages yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--t-outline)' }}>Say hello to {chatUser.full_name}!</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={m.id || i} className={`flex flex-col max-w-[80%] ${m.self ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.self ? 'rounded-2xl rounded-tr-md text-white' : 'rounded-2xl rounded-tl-md'
                  }`}
                    style={{
                      background: m.self ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'var(--t-glass-bg)',
                      color: m.self ? 'white' : 'var(--t-on-surface)',
                      border: m.self ? 'none' : '1px solid var(--t-glass-border)',
                    }}>
                    {m.text}
                  </div>
                  <span className="text-[10px] mt-1 px-1" style={{ color: 'var(--t-outline)' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--t-divider)', background: 'var(--t-panel-bg)' }}>
            <input type="text" value={msgInput} onChange={handleTypingInput} placeholder="Type a message..."
              className="input-glass flex-1 px-4 py-2.5 text-sm rounded-xl" autoFocus />
            <button type="submit" disabled={!msgInput.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
