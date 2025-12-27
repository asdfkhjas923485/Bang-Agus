import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      // Map database fields to Product type
      const products: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        category: p.category as "air_mineral" | "galon_air" | "gas_lpg",
        variantLabel: p.variant_label || "",
        unitLabel: p.unit_label || "",
        price: p.price,
        imageUrl: p.image_url || "/placeholder.svg",
        rating: Number(p.rating) || 5,
        ratingCount: p.rating_count || 0,
        badges: p.badges || [],
        isActive: p.is_active ?? true,
        stock: p.stock || 0,
        sold: p.sold || 0,
      }));

      return products;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      if (!data) return null;

      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        category: data.category as "air_mineral" | "galon_air" | "gas_lpg",
        variantLabel: data.variant_label || "",
        unitLabel: data.unit_label || "",
        price: data.price,
        imageUrl: data.image_url || "/placeholder.svg",
        rating: Number(data.rating) || 5,
        ratingCount: data.rating_count || 0,
        badges: data.badges || [],
        isActive: data.is_active ?? true,
        stock: data.stock || 0,
        sold: data.sold || 0,
      };

      return product;
    },
    enabled: !!id,
  });
}
