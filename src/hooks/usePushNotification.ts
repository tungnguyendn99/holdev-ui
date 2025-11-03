'use client';

import { useEffect, useState } from 'react';
import { urlBase64ToUint8Array } from '../utils/webPushUtils';
import API from '../utils/api';

export function usePushNotification(vapidPublicKey: string) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Kiểm tra chắc chắn đang chạy client
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notification API not available');
      return;
    }
    console.log('Notification', Notification);
    console.log('Notification.permission', Notification.permission);

    // Cập nhật trạng thái permission
    setPermission(Notification.permission);
    console.log('Notification.permission', Notification.permission);

    // Đăng ký Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('✅ Service worker registered'))
        .catch(console.error);
    }
  }, []);

  const subscribe = async () => {
    console.log('123123123');

    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    await API.post('/notification/subscribe', JSON.stringify(sub));

    setIsSubscribed(true);
    alert('✅ Đã đăng ký nhận thông báo!');
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      setIsSubscribed(false);
      alert('🚫 Đã huỷ nhận thông báo.');
    }
  };

  return { subscribe, unsubscribe, isSubscribed, permission };
}
