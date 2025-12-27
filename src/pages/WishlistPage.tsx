import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/use-products';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { data: products } = useProducts();

  const wishlistProducts = (products || []).filter((p) => wishlist.includes(p.id));

  return (
    <MainLayout>
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/produk">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Produk
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">Wishlist</h1>
              <p className="text-muted-foreground">{wishlistProducts.length} produk favorit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} variant="compact" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3 font-display">Wishlist Kosong</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Simpan produk favorit Anda dengan menekan ikon hati pada produk.
            </p>
            <Button variant="hero" asChild>
              <Link to="/produk">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Lihat Produk
              </Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
