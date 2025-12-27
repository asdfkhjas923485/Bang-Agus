import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ChevronRight, Package, Truck, Shield, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import ProductReviews from '@/components/products/ProductReviews';
import { useProduct, useProducts } from '@/hooks/use-products';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatRupiah } from '@/lib/format';
import { CATEGORY_LABELS } from '@/types';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { data: allProducts } = useProducts();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const inWishlist = product ? isInWishlist(product.id) : false;
  const relatedProducts = (allProducts || [])
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`${quantity} item ditambahkan ke keranjang`);
    setQuantity(1);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link disalin ke clipboard');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3 font-display">Produk Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-8">Produk yang Anda cari tidak ditemukan.</p>
          <Button asChild>
            <Link to="/produk">Lihat Semua Produk</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <Link to="/" className="hover:text-primary shrink-0">Beranda</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link to="/produk" className="hover:text-primary shrink-0">Produk</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Product Detail - Clean Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-16">
          {/* Product Image - Fixed Aspect Ratio */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted/50 border border-border">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-6 lg:p-10"
              />
            </div>
            
            {/* Badges - Top Left */}
            {product.badges.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badges.map((badge) => (
                  <Badge 
                    key={badge}
                    variant={badge.toLowerCase().includes('promo') ? 'promo' : 'bestseller'}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons - Top Right */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => product && toggleWishlist(product)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                  inWishlist 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-card text-muted-foreground hover:text-secondary border border-border'
                }`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-card text-muted-foreground hover:text-foreground flex items-center justify-center shadow-md transition-all border border-border"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Product Info - Clean Structure */}
          <div className="flex flex-col">
            {/* Category */}
            <Link 
              to={`/produk?category=${product.category}`}
              className="text-sm text-primary font-medium mb-2 hover:underline inline-block"
            >
              {CATEGORY_LABELS[product.category]}
            </Link>
            
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-display mb-1">
              {product.name}
            </h1>
            {product.variantLabel && (
              <p className="text-muted-foreground mb-4">{product.variantLabel}</p>
            )}

            {/* Rating & Sold */}
            <div className="flex items-center gap-4 mb-6">
              {product.ratingCount > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({product.ratingCount} ulasan)</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Belum ada ulasan</span>
              )}
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground text-sm">
                {product.sold > 0 ? `${product.sold} terjual` : 'Produk baru'}
              </span>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl p-5 mb-6 border border-secondary/20">
              <p className="text-3xl lg:text-4xl font-bold text-secondary font-display">
                {formatRupiah(product.price)}
              </p>
              {product.unitLabel && (
                <p className="text-muted-foreground text-sm mt-1">per {product.unitLabel}</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Deskripsi</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-primary' : 'bg-destructive'}`} />
              <span className="text-sm font-medium">
                {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok habis'}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock > 0 ? `Tambah ke Keranjang • ${formatRupiah(product.price * quantity)}` : 'Stok Habis'}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border mt-auto">
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Pengiriman Cepat</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Produk Original</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Kemasan Aman</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mb-16">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground font-display mb-6">Ulasan Pelanggan</h2>
          <div className="premium-card p-6">
            <ProductReviews 
              productId={product.id} 
              productRating={product.rating} 
              ratingCount={product.ratingCount} 
            />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground font-display">Produk Serupa</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/produk?category=${product.category}`}>Lihat Semua</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
