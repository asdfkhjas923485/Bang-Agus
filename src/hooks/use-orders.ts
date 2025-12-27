import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types';

interface CreateOrderInput {
  customerName: string;
  whatsapp: string;
  address: string;
  city?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  discountCode?: string;
  discountAmount?: number;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: input.customerName,
          whatsapp: input.whatsapp,
          address: input.address,
          city: input.city || null,
          subtotal: input.subtotal,
          shipping_cost: input.shippingCost,
          total: input.total,
          status: 'baru',
          user_id: user?.id || null,
          discount_code: input.discountCode || null,
          discount_amount: input.discountAmount || 0,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        unit_price: item.product.price,
        qty: item.quantity,
        line_total: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      // Increment discount code usage if applied
      if (input.discountCode) {
        const { data: currentCode } = await supabase
          .from('discount_codes')
          .select('used_count')
          .eq('code', input.discountCode)
          .single();
        
        if (currentCode) {
          await supabase
            .from('discount_codes')
            .update({ used_count: (currentCode.used_count || 0) + 1 })
            .eq('code', input.discountCode);
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}