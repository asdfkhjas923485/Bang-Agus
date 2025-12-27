import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatRupiah } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, variant = 'default', onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  if (variant === 'compact') {
    return (
      <Link to={`/produk/${product.id}`} className="block">
        <div className="product-card group">
          <div className="relative aspect-square bg-muted/30 p-4 overflow-hidden">
            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                inWishlist 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-card/80 text-muted-foreground hover:bg-card hover:text-secondary'
              }`}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {product.badges.length > 0 && (
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.badges.map((badge) => (
                  <Badge 
                    key={badge} 
                    variant={badge === 'Promo' ? 'promo' : 'bestseller'}
                    className="text-[10px]"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Quick Actions on Hover */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 rounded-xl shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Tambah
              </Button>
              {onQuickView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl shadow-lg bg-card/90"
                  onClick={handleQuickView}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.variantLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{product.variantLabel}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              {product.ratingCount > 0 ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({product.ratingCount})</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Belum ada ulasan</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-secondary">
                {formatRupiah(product.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/produk/${product.id}`} className="block">
      <div className="product-card group">
        <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/20 p-6 overflow-hidden">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
              inWishlist 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-card/90 text-muted-foreground hover:bg-card hover:text-secondary'
            }`}
          >
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {product.badges.length > 0 && (
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              {product.badges.map((badge) => (
                <Badge 
                  key={badge} 
                  variant={badge === 'Promo' ? 'promo' : 'bestseller'}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Quick Actions on Hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl shadow-lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Tambah ke Keranjang
            </Button>
            {onQuickView && (
              <Button
                variant="outline"
                className="rounded-xl shadow-lg bg-card/90"
                onClick={handleQuickView}
              >
                <Eye className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.variantLabel && (
            <p className="text-sm text-muted-foreground mt-0.5">{product.variantLabel}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            {product.ratingCount > 0 ? (
              <>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">• {product.sold} terjual</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{product.sold > 0 ? `${product.sold} terjual` : 'Produk baru'}</span>
            )}
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-secondary tracking-tight">
              {formatRupiah(product.price)}
            </span>
            {product.unitLabel && (
              <span className="text-sm text-muted-foreground ml-1">/{product.unitLabel}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
