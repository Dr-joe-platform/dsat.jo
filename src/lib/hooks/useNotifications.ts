'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth-context';
import {
  subscribeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from '../db';

export function useNotifications() {
  const { appUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid) { setLoading(false); return; }
    const unsub = subscribeNotifications(appUser.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return unsub;
  }, [appUser?.uid]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!appUser?.uid) return;
    await markAllNotificationsRead(appUser.uid);
  }, [appUser?.uid]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
