import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Droplets, Flame, Package, Loader2, Truck, Clock, ShieldCheck, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { useProducts } from '@/hooks/use-products';
import { Product } from '@/types';

// Categories
const categories = [
  { id: 'air_mineral', label: 'Air Mineral', icon: Droplets, gradient: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'galon_air', label: 'Galon Air', icon: Package, gradient: 'from-teal-500/20 to-emerald-500/20' },
  { id: 'gas_lpg', label: 'Gas LPG', icon: Flame, gradient: 'from-orange-500/20 to-red-500/20' },
];

// Benefits
const benefits = [
  { icon: Truck, title: 'Gratis Ongkir', desc: 'Semua pesanan' },
  { icon: Clock, title: 'Antar Cepat', desc: '1-2 jam sampai' },
  { icon: ShieldCheck, title: '100% Original', desc: 'Produk asli' },
  { icon: Zap, title: 'Proses Cepat', desc: 'Respon instan' },
];

// Customer reviews
const reviews = [
  { name: 'Wenny S.', location: 'Jakarta Selatan', rating: 5, review: 'Pesan galon jadi mudah! Adminnya responsif dan pengiriman cepat. Sudah langganan.' },
  { name: 'Dewi L.', location: 'Jakarta Barat', rating: 5, review: 'Harga gas LPG bersaing dan pengiriman tepat waktu. Recommended banget!' },
  { name: 'Budi P.', location: 'Jakarta Pusat', rating: 5, review: 'Sangat praktis! Tidak perlu repot ke toko lagi. Terima kasih Toko Agus!' },
];

export default function HomePage() {
  const { data: products, isLoading } = useProducts();
  
  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };
  
  // Products
  const previewProducts = products?.slice(0, 8) || [];
  const promoProducts = products?.filter(p => p.badges?.includes('Promo')).slice(0, 4) || [];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Gratis Ongkir Semua Pesanan</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                Pesan Air &<br />
                <span className="text-primary">Gas LPG</span><br />
                Langsung Antar
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md">
                Layanan delivery air mineral, galon, dan gas LPG terpercaya. Cepat, mudah, dan harga bersaing.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="rounded-full px-8" asChild>
                  <Link to="/produk">
                    Pesan Sekarang
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                  <Link to="/produk">Lihat Katalog</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-3xl font-bold text-foreground">4.9</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-3xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground">Layanan</p>
                </div>
              </div>
            </div>

            {/* Right - Hero Illustration */}
            <div className="relative hidden lg:flex justify-center items-center">
              <div className="relative">
                {/* Main illustration container */}
                <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                  <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center">
                    <div className="text-center">
                      <Droplets className="h-24 w-24 text-primary mx-auto mb-4" />
                      <p className="text-xl font-semibold text-foreground">Air Segar</p>
                      <p className="text-muted-foreground">& Gas LPG</p>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 right-0 bg-card rounded-2xl p-4 shadow-elevated border border-border animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Gratis Ongkir</p>
                      <p className="text-xs text-muted-foreground">Semua pesanan</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 -left-8 bg-card rounded-2xl p-4 shadow-elevated border border-border animate-float animation-delay-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">1-2 Jam</p>
                      <p className="text-xs text-muted-foreground">Sampai tujuan</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 right-8 bg-card rounded-2xl p-4 shadow-elevated border border-border animate-float animation-delay-300">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['W', 'D', 'B'].map((initial, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-card">
                          {initial}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">500+ Pelanggan</p>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 py-5 px-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Pilih Kategori</h2>
            <p className="text-muted-foreground mt-2">Temukan produk yang Anda butuhkan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                to={`/produk?category=${cat.id}`}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center hover:shadow-elevated transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <cat.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Lihat semua produk</p>
                  <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Jelajahi <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Products */}
      {promoProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-secondary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge variant="destructive" className="mb-2">Promo</Badge>
                <h2 className="text-2xl font-bold">Penawaran Spesial</h2>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/produk?filter=promo">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {promoProducts.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 50} direction="up">
                  <ProductCard 
                    product={product} 
                    variant="compact"
                    onQuickView={handleQuickView}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Produk Unggulan</h2>
              <p className="text-muted-foreground mt-1">Produk terlaris pilihan pelanggan</p>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/produk">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : previewProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {previewProducts.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 50} direction="up">
                  <ProductCard 
                    product={product} 
                    variant="compact"
                    onQuickView={handleQuickView}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-3xl border border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada produk tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Cara Pesan</h2>
            <p className="text-muted-foreground mt-2">4 langkah mudah untuk mendapatkan pesanan</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { num: '1', title: 'Pilih Produk', desc: 'Browse katalog kami' },
              { num: '2', title: 'Checkout', desc: 'Isi data pengiriman' },
              { num: '3', title: 'Konfirmasi', desc: 'Bayar via WhatsApp' },
              { num: '4', title: 'Diantar', desc: 'Pesanan sampai' },
            ].map((step, index) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link to="/produk">
                Mulai Pesan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Kata Pelanggan</h2>
            <p className="text-muted-foreground mt-2">Testimoni dari pelanggan setia kami</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.map((review, index) => (
              <div key={index} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.location}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">{review.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Siap Pesan Sekarang?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Dapatkan air mineral, galon, dan gas LPG berkualitas. Gratis ongkir untuk semua pesanan!
          </p>
          <Button 
            size="lg" 
            className="rounded-full px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link to="/produk">
              Lihat Katalog
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    </MainLayout>
  );
}
