import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, Loader2, Grid3X3, List, X, Star, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { useProducts } from '@/hooks/use-products';
import { CATEGORY_LABELS, Product } from '@/types';

const MIN_PRICE = 1000;
const MAX_PRICE = 2000000;
const ITEMS_PER_PAGE = 9;

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'bestseller';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products, isLoading, error } = useProducts();
  
  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products.filter((product) => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Rating filter
      if (minRating && product.rating < minRating) {
        return false;
      }

      // Search filter
      const searchQuery = searchParams.get('search')?.toLowerCase();
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery)) {
        return false;
      }

      // Promo filter
      if (searchParams.get('filter') === 'promo' && !product.badges.includes('Promo')) {
        return false;
      }

      return product.isActive;
    });

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'bestseller':
        filtered = [...filtered].sort((a, b) => b.sold - a.sold);
        break;
      case 'newest':
      default:
        // Already sorted by created_at desc from API
        break;
    }

    return filtered;
  }, [products, selectedCategories, priceRange, minRating, searchParams, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((c) => c !== categoryId)
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setMinRating(null);
    setSearchParams({});
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE || minRating !== null;

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-destructive mb-4">Gagal memuat produk. Silakan coba lagi.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Muat Ulang
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Produk</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display">
            Katalog Produk
          </h1>
          <p className="text-muted-foreground mt-2">
            Temukan air mineral, galon, dan gas LPG berkualitas
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <div className="premium-card p-6">
                <h2 className="font-bold text-lg text-foreground mb-6 font-display">Filter</h2>
                <ProductFilters
                  selectedCategories={selectedCategories}
                  priceRange={priceRange}
                  minRating={minRating}
                  minPrice={MIN_PRICE}
                  maxPrice={MAX_PRICE}
                  onCategoryChange={handleCategoryChange}
                  onPriceRangeChange={(value) => { setPriceRange(value); setCurrentPage(1); }}
                  onMinRatingChange={(rating) => { setMinRating(rating); setCurrentPage(1); }}
                  onReset={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          !
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="font-display">Filter Produk</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ProductFilters
                        selectedCategories={selectedCategories}
                        priceRange={priceRange}
                        minRating={minRating}
                        minPrice={MIN_PRICE}
                        maxPrice={MAX_PRICE}
                        onCategoryChange={handleCategoryChange}
                        onPriceRangeChange={(value) => { setPriceRange(value); setCurrentPage(1); }}
                        onMinRatingChange={(rating) => { setMinRating(rating); setCurrentPage(1); }}
                        onReset={handleResetFilters}
                        hasActiveFilters={hasActiveFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredProducts.length}</span> produk ditemukan
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(value: SortOption) => { setSortBy(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px] h-9">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="price-asc">Termurah</SelectItem>
                    <SelectItem value="price-desc">Termahal</SelectItem>
                    <SelectItem value="bestseller">Terlaris</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {(selectedCategories.length > 0 || minRating) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((catId) => (
                  <button
                    key={catId}
                    onClick={() => handleCategoryChange(catId, false)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    {CATEGORY_LABELS[catId]}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {minRating && (
                  <button
                    onClick={() => setMinRating(null)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {minRating}+ Rating
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Product Grid */}
                {paginatedProducts.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }>
                    {paginatedProducts.map((product, index) => (
                      <div 
                        key={product.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ProductCard 
                          product={product} 
                          variant={viewMode === 'grid' ? 'default' : 'compact'} 
                          onQuickView={handleQuickView}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card rounded-3xl border border-border">
                    <p className="text-muted-foreground mb-4">Tidak ada produk yang ditemukan.</p>
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset Filter
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === i + 1
                            ? 'bg-primary text-primary-foreground shadow-card'
                            : 'bg-card text-foreground border border-border hover:bg-muted'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    </MainLayout>
  );
}
