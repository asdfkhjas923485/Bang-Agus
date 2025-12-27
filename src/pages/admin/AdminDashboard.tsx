import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, TrendingUp, Loader2, ArrowRight, ShoppingCart, Plus, Eye } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/lib/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ newOrders: 0, pendingOrders: 0, totalSales: 0, totalProducts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const [newRes, pendingRes, salesRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'baru'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'menunggu_konfirmasi'),
        supabase.from('orders').select('total').in('status', ['selesai', 'dikirim', 'diproses']),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      
      const totalSales = salesRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      setStats({ newOrders: newRes.count || 0, pendingOrders: pendingRes.count || 0, totalSales, totalProducts: productsRes.count || 0 });
      setIsLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: Package, label: 'Pesanan Baru', value: stats.newOrders.toString(), color: 'from-accent to-accent/80', link: '/admin/pesanan' },
    { icon: Clock, label: 'Menunggu Konfirmasi', value: stats.pendingOrders.toString(), color: 'from-amber-500 to-amber-600', link: '/admin/pesanan' },
    { icon: TrendingUp, label: 'Total Penjualan', value: formatRupiah(stats.totalSales), color: 'from-primary to-primary-dark', link: '/admin/laporan' },
    { icon: ShoppingCart, label: 'Produk Aktif', value: stats.totalProducts.toString(), color: 'from-secondary to-secondary-dark', link: '/admin/produk' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Selamat datang di panel admin {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link key={stat.label} to={stat.link} className="group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="premium-card p-6 h-full hover:shadow-elevated transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground font-display">{stat.value}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg text-foreground font-display">Aksi Cepat</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2">
                  <Link to="/admin/produk/new"><Plus className="h-6 w-6" /><span>Tambah Produk</span></Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2">
                  <Link to="/admin/pesanan"><Eye className="h-6 w-6" /><span>Lihat Pesanan</span></Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2 col-span-2">
                  <Link to="/admin/laporan"><TrendingUp className="h-6 w-6" /><span>Laporan Penjualan</span></Link>
                </Button>
              </div>
            </div>

            <div className="premium-card p-6">
              <h2 className="font-semibold text-lg text-foreground mb-6 font-display">Info Toko</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Status</span>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">Aktif</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Produk Aktif</span>
                  <span className="font-semibold">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Metode Order</span>
                  <span className="font-semibold">WhatsApp</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="text-primary font-semibold">Gratis</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
