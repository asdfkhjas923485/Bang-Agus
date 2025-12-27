import { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, XCircle, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/lib/format';
import { STATUS_LABELS } from '@/types';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface OrderData {
  id: string;
  customer_name: string;
  whatsapp: string;
  address: string;
  city: string | null;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
  }>;
}

const statusSteps = [
  { key: 'baru', label: 'Baru', icon: Package },
  { key: 'menunggu_konfirmasi', label: 'Konfirmasi', icon: Clock },
  { key: 'diproses', label: 'Diproses', icon: Package },
  { key: 'dikirim', label: 'Dikirim', icon: Truck },
  { key: 'selesai', label: 'Selesai', icon: CheckCircle },
];

function getStatusIndex(status: string): number {
  if (status === 'batal') return -1;
  return statusSteps.findIndex(s => s.key === status);
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    baru: 'bg-accent/20 text-accent border-accent/30',
    menunggu_konfirmasi: 'bg-amber-100 text-amber-700 border-amber-200',
    diproses: 'bg-purple-100 text-purple-700 border-purple-200',
    dikirim: 'bg-primary/20 text-primary border-primary/30',
    selesai: 'bg-green-100 text-green-700 border-green-200',
    batal: 'bg-destructive/20 text-destructive border-destructive/30',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

export default function OrderTrackingPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);
    if (!cleanNumber.startsWith('62')) cleanNumber = '62' + cleanNumber;

    if (cleanNumber.length < 10) {
      setError('Masukkan nomor WhatsApp yang valid');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`whatsapp.eq.${cleanNumber},whatsapp.eq.${whatsappNumber}`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      const ordersWithItems: OrderData[] = ordersData.map(order => ({
        ...order,
        items: (itemsData || []).filter(item => item.order_id === order.id),
      }));

      setOrders(ordersWithItems);
    } catch (err) {
      setError('Gagal memuat pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] bg-gradient-hero">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-3">Lacak Pesanan</h1>
            <p className="text-muted-foreground text-lg">
              Masukkan nomor WhatsApp untuk melihat status pesanan Anda
            </p>
          </div>

          {/* Search Form */}
          <div className="premium-card p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={isLoading}
                className="h-14 px-8 rounded-xl"
              >
                <Search className="h-5 w-5 mr-2" />
                {isLoading ? 'Mencari...' : 'Cari Pesanan'}
              </Button>
            </form>
            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          </div>

          {/* Results */}
          {hasSearched && !isLoading && (
            <>
              {orders.length === 0 ? (
                <div className="premium-card p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-display">Tidak Ada Pesanan</h3>
                  <p className="text-muted-foreground">
                    Tidak ditemukan pesanan dengan nomor WhatsApp tersebut
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Ditemukan <span className="font-semibold text-foreground">{orders.length}</span> pesanan
                  </p>

                  {orders.map((order) => {
                    const currentStatusIndex = getStatusIndex(order.status);
                    const isCancelled = order.status === 'batal';

                    return (
                      <div key={order.id} className="premium-card overflow-hidden">
                        {/* Order Header */}
                        <div className="p-6 border-b border-border">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">ID Pesanan</p>
                              <p className="font-mono text-lg font-semibold">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground mb-1">
                                {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                              </p>
                              <Badge className={`${getStatusColor(order.status)} border`}>
                                {STATUS_LABELS[order.status] || order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Status Timeline */}
                        {!isCancelled && (
                          <div className="p-6 bg-muted/30">
                            <div className="flex items-center justify-between">
                              {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const Icon = step.icon;

                                return (
                                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                    {index < statusSteps.length - 1 && (
                                      <div 
                                        className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${
                                          index < currentStatusIndex ? 'bg-primary' : 'bg-border'
                                        }`}
                                      />
                                    )}
                                    
                                    <div 
                                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                        isCompleted 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-muted text-muted-foreground border-2 border-border'
                                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    
                                    <p className={`text-xs mt-2 text-center font-medium ${
                                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                      {step.label}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="p-6 bg-destructive/5">
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-destructive" />
                              <p className="text-destructive font-medium">Pesanan ini telah dibatalkan</p>
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="p-6">
                          <h4 className="font-semibold mb-4">Detail Pesanan</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.qty} x {formatRupiah(item.unit_price)}
                                  </p>
                                </div>
                                <p className="font-medium">{formatRupiah(item.line_total)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary */}
                          <div className="mt-6 pt-4 border-t border-border space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>{formatRupiah(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Ongkir</span>
                              <span className="text-primary font-medium">Gratis</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                              <span>Total</span>
                              <span className="text-secondary">{formatRupiah(order.total)}</span>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                            <p className="text-sm text-muted-foreground mb-1">Alamat Pengiriman</p>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.address}</p>
                            {order.city && <p className="text-sm text-muted-foreground">{order.city}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
