import { useState, useEffect } from 'react';
import { Calendar, Download, Loader2, Package, TrendingUp, ShoppingCart, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/lib/format';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  totalSales: number;
  totalOrders: number;
  topProduct: string;
  topProductQty: number;
  averageOrderValue: number;
  salesByDate: { date: string; total: number; orders: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  discountStats: { totalDiscounts: number; ordersWithDiscount: number };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658'];

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .in('status', ['selesai', 'dikirim', 'diproses']);

      if (error) throw error;

      const totalSales = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Calculate discount stats
      const ordersWithDiscount = orders?.filter(o => (o.discount_amount || 0) > 0).length || 0;
      const totalDiscounts = orders?.reduce((sum, o) => sum + (o.discount_amount || 0), 0) || 0;

      // Calculate top products with revenue
      const productStats: Record<string, { qty: number; revenue: number }> = {};
      orders?.forEach((order) => {
        order.order_items?.forEach((item: { product_name: string; qty: number; line_total: number }) => {
          if (!productStats[item.product_name]) {
            productStats[item.product_name] = { qty: 0, revenue: 0 };
          }
          productStats[item.product_name].qty += item.qty;
          productStats[item.product_name].revenue += item.line_total;
        });
      });

      const topProducts = Object.entries(productStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      const topProductEntry = topProducts[0];
      const topProduct = topProductEntry?.name || '-';
      const topProductQty = topProductEntry?.qty || 0;

      const salesByDate: Record<string, { total: number; orders: number }> = {};
      orders?.forEach((order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = { total: 0, orders: 0 };
        }
        salesByDate[date].total += order.total || 0;
        salesByDate[date].orders += 1;
      });

      const salesByDateArray = Object.entries(salesByDate)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setReportData({
        totalSales,
        totalOrders,
        topProduct,
        topProductQty,
        averageOrderValue,
        salesByDate: salesByDateArray,
        topProducts,
        discountStats: { totalDiscounts, ordersWithDiscount },
      });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat laporan');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCSV = () => {
    if (!reportData?.salesByDate.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Tanggal', 'Jumlah Pesanan', 'Total Penjualan'];
    const rows = reportData.salesByDate.map((row) => [
      row.date,
      row.orders.toString(),
      row.total.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-penjualan-${startDate}-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Laporan berhasil diekspor');
  };

  const formatDateDisplay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatChartDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-display">Laporan Penjualan</h1>
        <p className="text-muted-foreground mt-1">Analisis performa toko Anda</p>
      </div>

      {/* Date Filter */}
      <div className="bg-card rounded-2xl p-6 border border-border mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full lg:w-auto">
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Tanggal Mulai
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full lg:w-auto">
            <label className="block text-sm font-medium text-foreground mb-2">
              Tanggal Akhir
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button onClick={fetchReport} disabled={isLoading} className="flex-1 lg:flex-none">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Terapkan
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={isLoading || !reportData} className="flex-1 lg:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Penjualan</p>
                  <p className="text-xl lg:text-2xl font-bold text-secondary">{formatRupiah(reportData.totalSales)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jumlah Pesanan</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground">{reportData.totalOrders}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-5 border border-purple-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rata-rata Order</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground">{formatRupiah(reportData.averageOrderValue)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-5 border border-secondary/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Produk Terlaris</p>
                  <p className="font-bold text-foreground truncate text-sm lg:text-base">{reportData.topProduct}</p>
                  <p className="text-xs text-muted-foreground">{reportData.topProductQty} terjual</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl p-5 border border-amber-500/20 col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Diskon</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground">{formatRupiah(reportData.discountStats.totalDiscounts)}</p>
                  <p className="text-xs text-muted-foreground">{reportData.discountStats.ordersWithDiscount} pesanan</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          {reportData.salesByDate.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Sales Chart */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Grafik Penjualan</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.salesByDate}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatChartDate}
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        formatter={(value: number) => formatRupiah(value)}
                        labelFormatter={(label) => formatChartDate(label)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Chart */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Jumlah Pesanan</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.salesByDate}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatChartDate}
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} pesanan`, 'Jumlah']}
                        labelFormatter={(label) => formatChartDate(label)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill="hsl(var(--secondary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Top Products */}
          {reportData.topProducts.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Produk Terlaris</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} terjual`, 'Qty']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Distribusi Pendapatan Produk</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.topProducts}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name.slice(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {reportData.topProducts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatRupiah(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Detail Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">Detail Penjualan Harian</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Tanggal</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Jumlah Pesanan</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reportData.salesByDate.map((row) => (
                    <tr key={row.date} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{formatDateDisplay(row.date)}</td>
                      <td className="py-4 px-6 text-muted-foreground">{row.orders} pesanan</td>
                      <td className="py-4 px-6 font-semibold text-secondary">{formatRupiah(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportData.salesByDate.length === 0 && (
              <div className="text-center py-16">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada data penjualan dalam rentang tanggal ini.</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
}
