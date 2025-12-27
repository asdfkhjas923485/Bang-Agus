import { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Plus, Minus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Product } from '@/types';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
    onOpenChange(false);
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  const incrementQty = () => setQuantity(q => Math.min(q + 1, product.stock || 99));
  const decrementQty = () => setQuantity(q => Math.max(q - 1, 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 p-8 flex items-center justify-center">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 md:hidden p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Badges */}
            {product.badges && product.badges.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {product.badges.map((badge, i) => (
                  <Badge 
                    key={i} 
                    variant={badge === 'Promo' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
            
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full max-w-[280px] h-auto object-contain drop-shadow-xl animate-fade-in"
            />
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col">
            {/* Category */}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {product.category === 'air_mineral' && 'Air Mineral'}
              {product.category === 'galon_air' && 'Galon Air'}
              {product.category === 'gas_lpg' && 'Gas LPG'}
            </span>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-1 line-clamp-2">
              {product.name}
            </h2>
            
            {product.variantLabel && (
              <p className="text-sm text-muted-foreground mb-3">{product.variantLabel}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span className="text-muted-foreground text-sm">
                ({product.ratingCount || 0} ulasan)
              </span>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">
                {product.sold || 0} terjual
              </span>
            </div>

            {/* Price */}
            <div className="mb-4">
              <p className="text-2xl font-bold text-secondary">
                {formatRupiah(product.price)}
              </p>
              {product.unitLabel && (
                <span className="text-sm text-muted-foreground">/{product.unitLabel}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div className="mb-4">
              {(product.stock ?? 0) > 0 ? (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Stok: {product.stock} tersedia
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium">Stok habis</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Jumlah:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={incrementQty}
                  disabled={quantity >= (product.stock || 99)}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleAddToCart}
                disabled={(product.stock ?? 0) <= 0}
                className="flex-1 gap-2"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Tambah ke Keranjang
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                className={inWishlist ? 'text-red-500 border-red-200 hover:bg-red-50' : ''}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
              </Button>
            </div>

            {/* View Full Details Link */}
            <Link 
              to={`/produk/${product.id}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center gap-2 mt-4 text-sm text-primary hover:underline"
            >
              Lihat Detail Lengkap
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
