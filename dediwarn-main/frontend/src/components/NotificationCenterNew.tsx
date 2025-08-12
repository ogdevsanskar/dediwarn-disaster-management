import React, { useState } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface Notification {
  id: number;
  type: 'emergency_alert' | 'app_update' | 'app_install' | 'offline_report' | 'report_sent' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: { lat: number; lng: number };
  actions?: Array<{ label: string; action: () => void }>;
  read?: boolean;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onDismiss?: (id: number) => void;
  onClearAll?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications: propNotifications,
  onDismiss,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'warning',
      title: 'New Critical Alert',
      message: 'Severe weather warning issued for your area',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      severity: 'high'
    },
    {
      id: 2,
      type: 'success',
      title: 'Contract Deployed',
      message: 'Warning smart contract successfully deployed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      severity: 'low'
    },
    {
      id: 3,
      type: 'info',
      title: 'Network Update',
      message: 'Blockchain network upgraded to v2.1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      severity: 'low'
    }
  ]);

  // Use prop notifications if provided, otherwise use internal state
  const activeNotifications = propNotifications || notifications;
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'report_sent': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
      case 'emergency_alert': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      default: return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const markAsRead = (id: number) => {
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const removeNotification = (id: number) => {
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const clearAllNotifications = () => {
    if (onClearAll) {
      onClearAll();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-200 hover:scale-105 shadow-lg"
        aria-label="Open notifications"
      >
        <Bell className="h-6 w-6 text-blue-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-16 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex justify-between items-center">
            <h3 className="font-semibold text-white">Notifications</h3>
            {activeNotifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No notifications
              </div>
            ) : (
              activeNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                    !notification.read ? 'bg-blue-600/5 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {notification.message}
                      </p>
                      {notification.severity && (
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                          notification.severity === 'critical' ? 'bg-red-600' :
                          notification.severity === 'high' ? 'bg-orange-600' :
                          notification.severity === 'medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }`}>
                          {notification.severity.toUpperCase()}
                        </span>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                      {notification.actions && (
                        <div className="flex space-x-2 mt-2">
                          {notification.actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.action();
                              }}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-slate-400 hover:text-white p-1"
                      aria-label="Remove notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
