import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const POINTS_PER_DISCOUNT = 100;
export const DISCOUNT_VALUE = 5000;

export interface GuestLoyalty {
  id: string;
  points: number;
  lifetime_points: number;
  last_transaction_at: string;
}

export function useGuestLoyalty() {
  const [isLoading, setIsLoading] = useState(false);
  const [loyalty, setLoyalty] = useState<GuestLoyalty | null>(null);

  const fetchLoyaltyByPhone = async (phone: string): Promise<GuestLoyalty | null> => {
    if (!phone || phone.length < 10) {
      setLoyalty(null); // Reset loyalty when phone is invalid
      return null;
    }
    
    setIsLoading(true);
    // Reset loyalty immediately when fetching for a new number
    setLoyalty(null);
    
    try {
      // Normalize phone number
      const normalizedPhone = phone.replace(/\D/g, '');
      
      // First check if this phone has existing points (without creating)
      const { data: existingData, error: existingError } = await supabase
        .from('loyalty_points')
        .select('id, points, lifetime_points, last_transaction_at')
        .eq('phone', normalizedPhone)
        .maybeSingle();
      
      if (existingError) {
        console.error('Error checking existing loyalty:', existingError);
        return null;
      }
      
      if (existingData) {
        const loyaltyData = {
          id: existingData.id,
          points: existingData.points,
          lifetime_points: existingData.lifetime_points,
          last_transaction_at: existingData.last_transaction_at || new Date().toISOString(),
        };
        setLoyalty(loyaltyData);
        return loyaltyData;
      }
      
      // No existing record - return null (don't create until order is complete)
      setLoyalty(null);
      return null;
    } catch (error) {
      console.error('Error:', error);
      setLoyalty(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionHistory = async (phone: string) => {
    if (!phone) return [];
    
    const normalizedPhone = phone.replace(/\D/g, '');
    
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('phone', normalizedPhone)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    return data || [];
  };

  const calculateDiscount = (points: number) => {
    const redeemableDiscounts = Math.floor(points / POINTS_PER_DISCOUNT);
    return redeemableDiscounts * DISCOUNT_VALUE;
  };

  const redeemPoints = async (phone: string, pointsToRedeem: number) => {
    if (!phone || pointsToRedeem < POINTS_PER_DISCOUNT) return false;
    
    const normalizedPhone = phone.replace(/\D/g, '');
    
    try {
      // Get current points first
      const { data: currentData } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('phone', normalizedPhone)
        .single();
      
      if (!currentData || currentData.points < pointsToRedeem) {
        return false;
      }
      
      // Deduct points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ 
          points: currentData.points - pointsToRedeem,
          updated_at: new Date().toISOString()
        })
        .eq('phone', normalizedPhone);
      
      if (updateError) {
        console.error('Error updating points:', updateError);
        return false;
      }
      
      // Log the transaction - user_id is required but we use a placeholder for guest
      const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          phone: normalizedPhone,
          points: -pointsToRedeem,
          type: 'redeem',
          description: `Tukar ${pointsToRedeem} poin untuk diskon`,
          user_id: '00000000-0000-0000-0000-000000000000' // Guest placeholder
        });
      
      if (txError) {
        console.error('Error logging redemption:', txError);
        // Points already deducted, don't return false
      }

      // Refresh loyalty data
      await fetchLoyaltyByPhone(phone);
      
      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      return false;
    }
  };

  return {
    loyalty,
    isLoading,
    fetchLoyaltyByPhone,
    getTransactionHistory,
    calculateDiscount,
    redeemPoints,
    POINTS_PER_DISCOUNT,
    DISCOUNT_VALUE,
  };
}
