import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  updated_at: string;
}

interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  points: number;
  type: 'earn' | 'redeem' | 'bonus' | 'expire';
  description: string | null;
  created_at: string;
}

// Points to Rupiah conversion: 100 points = Rp 5,000
const POINTS_PER_DISCOUNT = 100;
const DISCOUNT_VALUE = 5000;

export function useLoyaltyPoints() {
  const { user } = useAuth();

  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: ['loyalty-points', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as LoyaltyPoints | null;
    },
    enabled: !!user?.id,
  });

  const { data: transactions } = useQuery({
    queryKey: ['loyalty-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as LoyaltyTransaction[];
    },
    enabled: !!user?.id,
  });

  const points = loyaltyData?.points || 0;
  const lifetimePoints = loyaltyData?.lifetime_points || 0;

  // Calculate how many discounts can be redeemed
  const redeemableDiscounts = Math.floor(points / POINTS_PER_DISCOUNT);
  const maxDiscountValue = redeemableDiscounts * DISCOUNT_VALUE;

  // Calculate points needed for next discount
  const pointsToNextDiscount = POINTS_PER_DISCOUNT - (points % POINTS_PER_DISCOUNT);

  return {
    points,
    lifetimePoints,
    transactions: transactions || [],
    isLoading,
    redeemableDiscounts,
    maxDiscountValue,
    pointsToNextDiscount,
    POINTS_PER_DISCOUNT,
    DISCOUNT_VALUE,
  };
}

export function useRedeemPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pointsToRedeem: number) => {
      if (!user?.id) throw new Error('User not logged in');

      // Get current points
      const { data: currentPoints, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentPoints || currentPoints.points < pointsToRedeem) {
        throw new Error('Poin tidak mencukupi');
      }

      // Deduct points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ 
          points: currentPoints.points - pointsToRedeem,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      const discountValue = Math.floor(pointsToRedeem / 100) * 5000;
      const { error: logError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          points: -pointsToRedeem,
          type: 'redeem',
          description: `Tukar ${pointsToRedeem} poin untuk diskon ${discountValue.toLocaleString('id-ID')}`
        });

      if (logError) throw logError;

      return { pointsRedeemed: pointsToRedeem, discountValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast.success(`Berhasil menukar ${data.pointsRedeemed} poin!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menukar poin');
    },
  });
}
