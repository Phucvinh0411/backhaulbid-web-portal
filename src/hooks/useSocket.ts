import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  companyId?: string;
  userId?: string;
}

interface PendingListener {
  eventName: string;
  callback: (...args: any[]) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const pendingListenersRef = useRef<PendingListener[]>([]);

  const attachListener = useCallback((eventName: string, callback: PendingListener['callback']) => {
    socketRef.current?.on(eventName, callback);
  }, []);

  useEffect(() => {
    // Connect through the api-gateway so JWT cookies are exchanged for
    // authenticated headers before the request reaches bidding-service.
    const socketUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
    const instance = io(socketUrl, {
      transports: ['websocket'],
      path: '/bidding-socket',
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = instance;
    setSocket(instance);

    for (const { eventName, callback } of pendingListenersRef.current) {
      attachListener(eventName, callback);
    }
    pendingListenersRef.current = [];

    instance.on('connect', () => {
      console.log('Socket connected:', instance.id);

      // Register the device so the gateway can join this client into the
      // company room used by fleet matching notifications.
      if (options.companyId) {
        instance.emit('register_device', {
          companyId: options.companyId,
          userId: options.userId,
        });
        console.log(`Registered device for company: ${options.companyId}`);
      }
    });

    instance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    instance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [options.companyId, options.userId, attachListener]);

  const listen = useCallback((eventName: string, callback: PendingListener['callback']) => {
    if (socketRef.current) {
      attachListener(eventName, callback);
    } else {
      pendingListenersRef.current.push({ eventName, callback });
    }

    return () => {
      pendingListenersRef.current = pendingListenersRef.current.filter(
        (listener) => listener.eventName !== eventName || listener.callback !== callback,
      );
      socketRef.current?.off(eventName, callback);
    };
  }, [attachListener]);

  return { listen, socket };
};
