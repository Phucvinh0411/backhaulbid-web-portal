import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  companyId?: string;
  userId?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Khởi tạo kết nối tới Gateway WebSocket
    // Thông thường trong thực tế sẽ dùng biến môi trường: process.env.NEXT_PUBLIC_SOCKET_URL
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      
      // Ngay khi kết nối thành công, tự động emit event register_device 
      // để Join vào Room riêng của Company/Nhà xe, giúp nhận thông báo ghép cặp.
      if (options.companyId) {
        socket.emit('register_device', { 
          companyId: options.companyId, 
          userId: options.userId 
        });
        console.log(`Đã đăng ký thiết bị cho Company: ${options.companyId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Cleanup function: Ngắt kết nối khi component bị unmount để tránh rò rỉ bộ nhớ
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [options.companyId, options.userId]); // Re-connect nếu companyId thay đổi

  // Cung cấp hàm listen an toàn để các component khác đăng ký
  const listen = useCallback((eventName: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on(eventName, callback);
    
    // Trả về hàm huỷ đăng ký để dùng trong useEffect cleanup
    return () => {
      socketRef.current?.off(eventName, callback);
    };
  }, []);

  return { listen, socket: socketRef.current };
};
