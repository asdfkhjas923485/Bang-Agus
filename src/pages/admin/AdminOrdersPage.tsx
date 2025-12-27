import { useState, useEffect } from 'react';
import { Eye, Loader2, Search, ShoppingCart, Clock, CheckCircle2, Truck, Package, XCircle, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah, getStatusColor, generateWhatsAppLink } from '@/lib/format';
import { STATUS_LABELS } from '@/types';
import { toast } from 'sonner';
import { ADMIN_WA_NUMBER } from '@/config/constants';

// WhatsApp notification templates per status
const WA_TEMPLATES: Record<string, string> = {
  diproses: `Halo {nama}! 👋

Pesanan Anda #{id} sedang kami proses.

📦 Status: Sedang Diproses
💰 Total: {total}

Kami akan segera mengirimkan pesanan Anda. Terima kasih sudah berbelanja! 🙏`,

  dikirim: `Halo {nama}! 🚚

Pesanan Anda #{id} sudah dalam perjalanan!

📦 Status: Sedang Dikirim
💰 Total: {total}
📍 Alamat: {alamat}

Mohon siapkan pembayaran jika belum. Terima kasih! 🙏`,

  selesai: `Halo {nama}! ✅

Pesanan Anda #{id} telah selesai!

📦 Status: Selesai
💰 Total: {total}

🎁 Anda mendapatkan poin loyalty dari pesanan ini!
Terima kasih sudah berbelanja. Sampai jumpa di pesanan berikutnya! 🙏`,

  batal: `Halo {nama},

Mohon maaf, pesanan Anda #{id} dibatalkan.

📦 Status: Dibatalkan
💰 Total: {total}

Jika ada pertanyaan, silakan hubungi kami. Terima kasih! 🙏`,
};
interface OrderItem {
  id: string;
  product_name: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  customer_name: string;
  whatsapp: string;
  address: string;
  city: string | null;
  subtotal: number;
  shipping_cost: number | null;
  total: number;
  status: string;
  created_at: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  baru: <Clock className="h-4 w-4" />,
  diproses: <Package className="h-4 w-4" />,
  dikirim: <Truck className="h-4 w-4" />,
  selesai: <CheckCircle2 className="h-4 w-4" />,
  dibatalkan: <XCircle className="h-4 w-4" />,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // WhatsApp notification state
  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ order: Order; newStatus: string } | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Gagal memuat pesanan');
      console.error(error);
    } else {
      setOrders(data || []);
      setFilteredOrders(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    
    if (searchQuery) {
      result = result.filter(o => 
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.whatsapp.includes(searchQuery) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setIsLoadingItems(true);

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (error) {
      toast.error('Gagal memuat detail pesanan');
      console.error(error);
    } else {
      setOrderItems(data || []);
    }
    setIsLoadingItems(false);
  };

  // Generate WhatsApp message from template
  const generateWaMessage = (order: Order, status: string): string => {
    const template = WA_TEMPLATES[status];
    if (!template) return '';
    
    return template
      .replace('{nama}', order.customer_name)
      .replace('{id}', order.id.substring(0, 8).toUpperCase())
      .replace('{total}', formatRupiah(order.total))
      .replace('{alamat}', order.address);
  };

  // Handle status change with optional WhatsApp notification
  const handleStatusChange = async (orderId: string, newStatus: string, showWaDialog = true) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // If new status has a template and showWaDialog is true, show WhatsApp dialog
    if (WA_TEMPLATES[newStatus] && showWaDialog) {
      setPendingStatusChange({ order, newStatus });
      setWaMessage(generateWaMessage(order, newStatus));
      setWaDialogOpen(true);
      return;
    }
    
    // Otherwise, just update status directly
    await executeStatusChange(orderId, newStatus);
  };

  const executeStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Gagal mengubah status');
      console.error(error);
    } else {
      toast.success('Status berhasil diubah');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  // Send WhatsApp notification and update status
  const handleSendWaNotification = async () => {
    if (!pendingStatusChange) return;
    
    const { order, newStatus } = pendingStatusChange;
    
    // Open WhatsApp with the message
    const waLink = generateWhatsAppLink(order.whatsapp, waMessage);
    window.open(waLink, '_blank');
    
    // Update the status
    await executeStatusChange(order.id, newStatus);
    
    // Close dialog and reset state
    setWaDialogOpen(false);
    setPendingStatusChange(null);
    setWaMessage('');
  };

  // Skip WhatsApp notification and just update status
  const handleSkipNotification = async () => {
    if (!pendingStatusChange) return;
    
    const { order, newStatus } = pendingStatusChange;
    await executeStatusChange(order.id, newStatus);
    
    setWaDialogOpen(false);
    setPendingStatusChange(null);
    setWaMessage('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ordersByStatus = {
    baru: orders.filter(o => o.status === 'baru').length,
    diproses: orders.filter(o => o.status === 'diproses').length,
    dikirim: orders.filter(o => o.status === 'dikirim').length,
    selesai: orders.filter(o => o.status === 'selesai').length,
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-display">Kelola Pesanan</h1>
        <p className="text-muted-foreground mt-1">Lihat dan kelola semua pesanan masuk</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl p-5 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ordersByStatus.baru}</p>
              <p className="text-sm text-muted-foreground">Pesanan Baru</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ordersByStatus.diproses}</p>
              <p className="text-sm text-muted-foreground">Diproses</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ordersByStatus.dikirim}</p>
              <p className="text-sm text-muted-foreground">Dikirim</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ordersByStatus.selesai}</p>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, nomor WA, atau ID pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm">ID Pesanan</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm hidden sm:table-cell">Tanggal</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm">Customer</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Total</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-right py-4 px-4 font-medium text-muted-foreground text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm font-medium text-primary">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.whatsapp}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="font-semibold text-secondary">
                        {formatRupiah(order.total)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-32 h-9 text-xs ${getStatusColor(order.status)}`}>
                          <div className="flex items-center gap-1.5">
                            {statusIcons[order.status]}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                {statusIcons[value]}
                                {label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tidak ada pesanan yang sesuai filter' 
                  : 'Belum ada pesanan.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-primary">#{selectedOrder?.id.substring(0, 8).toUpperCase()}</span>
              <Badge className={getStatusColor(selectedOrder?.status || 'baru')}>
                {STATUS_LABELS[selectedOrder?.status as keyof typeof STATUS_LABELS]}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-foreground text-sm">Informasi Customer</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nama</p>
                    <p className="font-medium text-foreground">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <p className="font-medium text-foreground">{selectedOrder.whatsapp}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Alamat</p>
                    <p className="font-medium text-foreground">{selectedOrder.address}</p>
                    {selectedOrder.city && (
                      <p className="text-sm text-muted-foreground">{selectedOrder.city}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-3">Item Pesanan</h4>
                {isLoadingItems ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 rounded-lg p-3">
                        <div>
                          <span className="font-medium text-foreground">{item.product_name}</span>
                          <span className="text-muted-foreground ml-2">× {item.qty}</span>
                        </div>
                        <span className="font-semibold text-foreground">{formatRupiah(item.line_total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatRupiah(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="text-primary font-medium">
                    {selectedOrder.shipping_cost ? formatRupiah(selectedOrder.shipping_cost) : 'Gratis'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-secondary">{formatRupiah(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Change */}
              <div className="border-t border-border pt-4">
                <label className="text-sm text-muted-foreground mb-2 block">Ubah Status Pesanan</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {statusIcons[value]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Notification Dialog */}
      <Dialog open={waDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setWaDialogOpen(false);
          setPendingStatusChange(null);
          setWaMessage('');
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Kirim Notifikasi WhatsApp
            </DialogTitle>
          </DialogHeader>

          {pendingStatusChange && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kepada</span>
                  <span className="font-medium text-foreground">{pendingStatusChange.order.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span className="font-medium text-foreground">{pendingStatusChange.order.whatsapp}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status Baru</span>
                  <Badge className={getStatusColor(pendingStatusChange.newStatus)}>
                    {STATUS_LABELS[pendingStatusChange.newStatus as keyof typeof STATUS_LABELS]}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Pesan (dapat diedit)</label>
                <Textarea
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleSkipNotification}>
              Lewati
            </Button>
            <Button onClick={handleSendWaNotification} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Kirim & Ubah Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
