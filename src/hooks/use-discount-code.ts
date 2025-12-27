import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

interface DiscountResult {
  isValid: boolean;
  discountAmount: number;
  discountCode: DiscountCode | null;
  errorMessage: string | null;
}

export function useDiscountCode() {
  const [isValidating, setIsValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountResult | null>(null);

  const validateCode = async (code: string, subtotal: number): Promise<DiscountResult> => {
    if (!code.trim()) {
      return {
        isValid: false,
        discountAmount: 0,
        discountCode: null,
        errorMessage: 'Masukkan kode diskon',
      };
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const result: DiscountResult = {
          isValid: false,
          discountAmount: 0,
          discountCode: null,
          errorMessage: 'Kode diskon tidak valid',
        };
        setAppliedDiscount(result);
        return result;
      }

      const discountCode = data as DiscountCode;
      const now = new Date();

      // Check validity period
      if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
        const result: DiscountResult = {
          isValid: false,
          discountAmount: 0,
          discountCode: null,
          errorMessage: 'Kode diskon belum berlaku',
        };
        setAppliedDiscount(result);
        return result;
      }

      if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
        const result: DiscountResult = {
          isValid: false,
          discountAmount: 0,
          discountCode: null,
          errorMessage: 'Kode diskon sudah kedaluwarsa',
        };
        setAppliedDiscount(result);
        return result;
      }

      // Check usage limit
      if (discountCode.max_uses && discountCode.used_count >= discountCode.max_uses) {
        const result: DiscountResult = {
          isValid: false,
          discountAmount: 0,
          discountCode: null,
          errorMessage: 'Kode diskon sudah habis digunakan',
        };
        setAppliedDiscount(result);
        return result;
      }

      // Check minimum order
      if (subtotal < discountCode.min_order_amount) {
        const result: DiscountResult = {
          isValid: false,
          discountAmount: 0,
          discountCode: null,
          errorMessage: `Minimum belanja Rp ${discountCode.min_order_amount.toLocaleString('id-ID')}`,
        };
        setAppliedDiscount(result);
        return result;
      }

      // Calculate discount
      let discountAmount = 0;
      if (discountCode.discount_type === 'percentage') {
        discountAmount = Math.round((subtotal * discountCode.discount_value) / 100);
      } else {
        discountAmount = discountCode.discount_value;
      }

      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal);

      const result: DiscountResult = {
        isValid: true,
        discountAmount,
        discountCode,
        errorMessage: null,
      };

      setAppliedDiscount(result);
      toast.success('Kode diskon berhasil diterapkan!');
      return result;
    } catch (error) {
      console.error('Error validating discount code:', error);
      const result: DiscountResult = {
        isValid: false,
        discountAmount: 0,
        discountCode: null,
        errorMessage: 'Gagal memvalidasi kode diskon',
      };
      setAppliedDiscount(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const clearDiscount = () => {
    setAppliedDiscount(null);
  };

  return {
    isValidating,
    appliedDiscount,
    validateCode,
    clearDiscount,
  };
}
