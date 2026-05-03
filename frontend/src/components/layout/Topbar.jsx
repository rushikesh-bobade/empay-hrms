import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Settings, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import UserAvatar from '../shared/UserAvatar';

export default function Topbar() {
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();



  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial notifications
    api.get('/notifications').then(res => setNotifications(res.data.data)).catch(console.error);

    // Setup Socket
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    
    socket.emit('join', user.id);
    
    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  return (
    <header className="h-16 flex items-center justify-end px-6 border-b"
      style={{ background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--sidebar-border)' }}>
      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn relative p-2 rounded-xl hover:bg-[var(--sidebar-hover)] text-on-surface-variant transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="theme-toggle-icon w-[18px] h-[18px]" />
          ) : (
            <Moon className="theme-toggle-icon w-[18px] h-[18px]" />
          )}
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-[var(--sidebar-hover)] text-on-surface-variant transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full pulse-dot" />}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 rounded-xl glass-panel shadow-2xl border border-surface overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-surface flex items-center justify-between bg-surface/90 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-on-surface">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => api.put('/notifications/read-all').then(() => setNotifications(prev => prev.map(n => ({...n, is_read: true}))))}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[280px] overflow-y-auto scrollbar-hide">

                {notifications.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-variant/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-on-surface-variant opacity-30" />
                    </div>
                    <p className="text-on-surface-variant text-xs font-medium">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface/50">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`group p-3 cursor-pointer hover:bg-primary/[0.04] transition-all relative ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-1 relative">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${!n.is_read ? 'bg-primary shadow-[0_0_6px_rgba(77,142,255,0.6)]' : 'bg-outline/20'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className={`text-[12px] leading-tight truncate transition-colors ${!n.is_read ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant group-hover:text-on-surface'}`}>
                                {n.title}
                              </h4>
                              {n.type === 'warning' && <span className="w-1 h-1 rounded-full bg-warning animate-pulse" />}
                            </div>
                            <p className="text-[11px] text-on-surface-variant line-clamp-1 leading-normal opacity-80 group-hover:opacity-100 transition-opacity">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[9px] font-bold text-outline tracking-tight opacity-60">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[9px] font-bold text-outline uppercase tracking-tighter opacity-40">
                                {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
        <button
          onClick={() => navigate('/admin/settings')}
          className="p-2 rounded-xl hover:bg-[var(--sidebar-hover)] text-on-surface-variant transition-colors"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-xl hover:bg-[var(--sidebar-hover)] transition-colors"
        >
          <span className="text-sm text-on-surface font-medium hidden sm:block">{user?.full_name?.split(' ')[0]}</span>
          <UserAvatar user={user} size="sm" />
        </button>
      </div>
    </header>
  );
}
