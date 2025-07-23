import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/components/ui/notification-center';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Carregar notificações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
  }, []);

  // Salvar notificações no localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      return updated;
    });

    return newNotification.id;
  }, [saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const clearAll = useCallback(() => {
    localStorage.removeItem('notifications');
    setNotifications([]);
  }, []);

  // Helpers para tipos específicos de notificação
  const notifySuccess = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ title, message, type: 'success', action });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ title, message, type: 'error', action });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ title, message, type: 'warning', action });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ title, message, type: 'info', action });
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications: notifications.slice(0, 50), // Limitar a 50 notificações
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    // Helpers
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};