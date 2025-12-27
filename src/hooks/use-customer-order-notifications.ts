import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_LABELS: Record<string, { label: string; icon: string }> = {
  baru: { label: 'Pesanan Diterima', icon: '📦' },
  diproses: { label: 'Sedang Diproses', icon: '⚙️' },
  dikirim: { label: 'Dalam Pengiriman', icon: '🚚' },
  selesai: { label: 'Pesanan Selesai', icon: '✅' },
  dibatalkan: { label: 'Pesanan Dibatalkan', icon: '❌' },
};

export function useCustomerOrderNotifications() {
  const { user } = useAuth();

  const showStatusNotification = useCallback((orderId: string, newStatus: string) => {
    const statusInfo = STATUS_LABELS[newStatus] || { label: newStatus, icon: '📋' };
    
    toast.info(`${statusInfo.icon} ${statusInfo.label}`, {
      description: `Order #${orderId.slice(0, 8).toUpperCase()} telah diupdate`,
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`customer-order-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldRecord = payload.old as { status?: string };
          const newRecord = payload.new as { id: string; status: string };
          
          // Only notify if status changed
          if (oldRecord.status !== newRecord.status) {
            showStatusNotification(newRecord.id, newRecord.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, showStatusNotification]);
}
