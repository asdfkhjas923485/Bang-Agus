import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  user_email?: string;
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Review[];
    },
    enabled: !!productId,
  });
}

export function useCanReview(productId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-review', productId, user?.id],
    queryFn: async () => {
      if (!user) return { canReview: false, eligibleOrders: [] };

      // Get user's completed orders that include this product
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_items!inner (product_id)
        `)
        .eq('user_id', user.id)
        .eq('status', 'selesai');

      if (ordersError) throw ordersError;

      // Filter orders that contain this product
      const eligibleOrderIds = (orders || [])
        .filter((order: any) => 
          order.order_items.some((item: any) => item.product_id === productId)
        )
        .map((order: any) => order.id);

      if (eligibleOrderIds.length === 0) {
        return { canReview: false, eligibleOrders: [] };
      }

      // Check if user already reviewed this product for these orders
      const { data: existingReviews, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('order_id')
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (reviewsError) throw reviewsError;

      const reviewedOrderIds = (existingReviews || []).map((r: any) => r.order_id);
      const unreviewedOrders = eligibleOrderIds.filter((id: string) => !reviewedOrderIds.includes(id));

      return {
        canReview: unreviewedOrders.length > 0,
        eligibleOrders: unreviewedOrders,
      };
    },
    enabled: !!productId && !!user,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { 
      product_id: string; 
      order_id?: string; 
      rating: number; 
      comment?: string 
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          ...data,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['can-review', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
