import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Loader2, Package, Search, Filter, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/lib/format';
import { toast } from 'sonner';
import { CATEGORY_LABELS } from '@/types';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  variant_label: string | null;
  unit_label: string | null;
  price: number;
  image_url: string | null;
  rating: number | null;
  rating_count: number | null;
  badges: string[] | null;
  is_active: boolean | null;
  stock: number | null;
  sold: number | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Gagal memuat produk');
      console.error(error);
    } else {
      setProducts(data || []);
      setFilteredProducts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.variant_label?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    setFilteredProducts(result);
  }, [searchQuery, categoryFilter, products]);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteProduct.id);

    if (error) {
      toast.error('Gagal menghapus produk');
      console.error(error);
    } else {
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    }
    setIsDeleting(false);
    setDeleteProduct(null);
  };

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (error) {
      toast.error('Gagal mengubah status produk');
    } else {
      toast.success(`Produk ${!product.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchProducts();
    }
  };

  const activeProducts = products.filter(p => p.is_active);
  const lowStockProducts = products.filter(p => (p.stock || 0) < 20);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-display">Kelola Produk</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, atau hapus produk toko Anda</p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/admin/produk/new">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
              <p className="text-sm text-muted-foreground">Total Produk</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeProducts.length}</p>
              <p className="text-sm text-muted-foreground">Produk Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <EyeOff className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{products.length - activeProducts.length}</p>
              <p className="text-sm text-muted-foreground">Non-Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lowStockProducts.length}</p>
              <p className="text-sm text-muted-foreground">Stok Rendah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm">Produk</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Kategori</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm">Harga</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm hidden sm:table-cell">Stok</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm hidden lg:table-cell">Terjual</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-right py-4 px-4 font-medium text-muted-foreground text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{product.name}</p>
                          {product.variant_label && (
                            <p className="text-sm text-muted-foreground truncate">{product.variant_label}</p>
                          )}
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {product.badges?.map((badge) => (
                              <Badge key={badge} variant={badge === 'Promo' ? 'promo' : 'bestseller'} className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] || product.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-secondary">{formatRupiah(product.price)}</span>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`font-medium ${(product.stock || 0) < 20 ? 'text-destructive' : 'text-foreground'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="text-muted-foreground">{product.sold || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={product.is_active ? 'default' : 'outline'}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/produk/${product.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                            {product.is_active ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Nonaktifkan
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Aktifkan
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteProduct(product)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Tidak ada produk yang sesuai filter' 
                  : 'Belum ada produk. Klik "Tambah Produk" untuk menambahkan.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk "{deleteProduct?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteProduct(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
