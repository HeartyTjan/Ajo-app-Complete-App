import React, { createContext, useContext, useEffect, useState } from "react";
import { getFromStorage } from "./storage";
import { Platform } from "react-native";
import Constants from 'expo-constants';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
}

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await getFromStorage('token');
      const res = await fetch(`${API_BASE}/notifications`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    // WebSocket setup for real-time notifications
    let ws: WebSocket | null = null;
    const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws';
    if (Platform.OS !== 'web') {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        console.log('WebSocket connected');
      };
      ws.onmessage = (event) => {
        console.log('WebSocket message:', event.data);
        fetchNotifications();
      };
      ws.onerror = (error) => {
        console.log('WebSocket error:', error.message);
      };
      ws.onclose = () => {
        console.log('WebSocket closed');
      };
    }

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications: safeNotifications, unreadCount, refreshNotifications: fetchNotifications, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}; 