import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewOrder {
  id: string;
  customer_name: string;
  total: number;
  created_at: string;
}

export function useOrderNotifications() {
  const [newOrders, setNewOrders] = useState<NewOrder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel('admin-order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as NewOrder;
          setNewOrders(prev => [newOrder, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
          
          toast.success(`Pesanan baru dari ${newOrder.customer_name}`, {
            description: `Total: Rp ${newOrder.total.toLocaleString('id-ID')}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearUnread = () => {
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNewOrders([]);
    setUnreadCount(0);
  };

  return {
    newOrders,
    unreadCount,
    clearUnread,
    clearNotifications
  };
}
