import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Clock, Gift, Copy, MessageCircle, Loader2, Filter, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/lib/format';
import { toast } from 'sonner';

interface LoyaltyAlert {
  id: string;
  phone: string;
  points: number;
  lifetime_points: number;
  last_transaction_at: string;
  status: 'active' | 'expiring_soon' | 'expired';
  can_redeem: boolean;
  days_until_expiry: number;
}

const POINTS_PER_DISCOUNT = 100;
const DISCOUNT_VALUE = 5000;

const DEFAULT_TEMPLATES = {
  expiring: `Halo! 👋

Poin loyalty Anda sebanyak *{points} poin* akan segera hangus dalam *{days} hari* lagi.

Jangan sampai terbuang! Gunakan poin Anda untuk diskon di pembelian berikutnya.

{discount_info}

Belanja sekarang untuk perpanjang masa berlaku poin Anda! 🎁`,

  threshold: `Halo! 🎉

Selamat! Poin loyalty Anda sudah mencapai *{points} poin* dan bisa ditukar menjadi diskon!

{discount_info}

Gunakan diskon ini di checkout saat pembelian berikutnya. Terima kasih sudah menjadi pelanggan setia kami! 💙`,
};

export default function AdminLoyaltyAlertsPage() {
  const [alerts, setAlerts] = useState<LoyaltyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<'expiring' | 'threshold' | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .gt('points', 0)
        .order('last_transaction_at', { ascending: true });

      if (error) throw error;

      // Process data to calculate status and other fields
      const processedAlerts: LoyaltyAlert[] = (data || []).map((lp) => {
        const lastTx = new Date(lp.last_transaction_at || lp.created_at);
        const now = new Date();
        const daysSinceLastTx = Math.floor((now.getTime() - lastTx.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilExpiry = Math.max(0, 180 - daysSinceLastTx);

        let status: 'active' | 'expiring_soon' | 'expired' = 'active';
        if (daysSinceLastTx >= 180) {
          status = 'expired';
        } else if (daysSinceLastTx >= 150) {
          status = 'expiring_soon';
        }

        return {
          id: lp.id,
          phone: lp.phone || '',
          points: lp.points,
          lifetime_points: lp.lifetime_points,
          last_transaction_at: lp.last_transaction_at || lp.created_at,
          status,
          can_redeem: lp.points >= POINTS_PER_DISCOUNT,
          days_until_expiry: daysUntilExpiry,
        };
      });

      setAlerts(processedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'expiring') return alert.status === 'expiring_soon';
    if (filter === 'threshold') return alert.can_redeem;
    if (filter === 'expired') return alert.status === 'expired';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expiring_soon':
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-600 rounded-full text-xs font-medium">Hampir Expired</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-destructive/20 text-destructive rounded-full text-xs font-medium">Expired</span>;
      default:
        return <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">Aktif</span>;
    }
  };

  const generateMessage = (alert: LoyaltyAlert, type: 'expiring' | 'threshold') => {
    const redeemableDiscounts = Math.floor(alert.points / POINTS_PER_DISCOUNT);
    const discountValue = redeemableDiscounts * DISCOUNT_VALUE;
    const discountInfo = `💰 *${alert.points} poin* = diskon *${formatRupiah(discountValue)}*`;

    let message = templates[type]
      .replace('{points}', alert.points.toString())
      .replace('{days}', alert.days_until_expiry.toString())
      .replace('{discount_info}', discountInfo);

    return message;
  };

  const copyMessage = (alert: LoyaltyAlert, type: 'expiring' | 'threshold') => {
    const message = generateMessage(alert, type);
    navigator.clipboard.writeText(message);
    toast.success('Pesan disalin ke clipboard');
  };

  const openWhatsApp = (alert: LoyaltyAlert, type: 'expiring' | 'threshold') => {
    const message = generateMessage(alert, type);
    const phone = alert.phone.startsWith('0') ? '62' + alert.phone.slice(1) : alert.phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const expiringCount = alerts.filter(a => a.status === 'expiring_soon').length;
  const thresholdCount = alerts.filter(a => a.can_redeem).length;
  const expiredCount = alerts.filter(a => a.status === 'expired').length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">Notifikasi Loyalty</h1>
        <p className="text-muted-foreground mt-1">Kelola notifikasi poin pelanggan yang hampir expired atau mencapai threshold</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="premium-card p-4 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{expiringCount}</p>
              <p className="text-sm text-muted-foreground">Hampir Expired</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4 border-l-4 border-primary">
          <div className="flex items-center gap-3">
            <Gift className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{thresholdCount}</p>
              <p className="text-sm text-muted-foreground">Siap Redeem</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4 border-l-4 border-destructive">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">{expiredCount}</p>
              <p className="text-sm text-muted-foreground">Sudah Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Editor */}
      <div className="premium-card p-6 mb-8">
        <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Template Pesan WhatsApp
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-foreground mb-2">Template Poin Hampir Expired</label>
            <Textarea
              value={templates.expiring}
              onChange={(e) => setTemplates({ ...templates, expiring: e.target.value })}
              rows={8}
              className="font-mono text-sm"
              placeholder="Gunakan {points}, {days}, {discount_info}"
            />
            <p className="text-xs text-muted-foreground mt-1">Variabel: {'{points}'}, {'{days}'}, {'{discount_info}'}</p>
          </div>
          <div>
            <label className="block font-medium text-foreground mb-2">Template Poin Cukup untuk Redeem</label>
            <Textarea
              value={templates.threshold}
              onChange={(e) => setTemplates({ ...templates, threshold: e.target.value })}
              rows={8}
              className="font-mono text-sm"
              placeholder="Gunakan {points}, {discount_info}"
            />
            <p className="text-xs text-muted-foreground mt-1">Variabel: {'{points}'}, {'{discount_info}'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua ({alerts.length})</SelectItem>
              <SelectItem value="expiring">Hampir Expired ({expiringCount})</SelectItem>
              <SelectItem value="threshold">Siap Redeem ({thresholdCount})</SelectItem>
              <SelectItem value="expired">Sudah Expired ({expiredCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={fetchAlerts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Tidak ada notifikasi yang perlu ditindaklanjuti</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="premium-card p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground font-mono">{alert.phone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{alert.points.toLocaleString()} poin</span>
                      <span className="text-muted-foreground">•</span>
                      {getStatusBadge(alert.status)}
                      {alert.can_redeem && (
                        <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium">
                          Bisa Redeem
                        </span>
                      )}
                    </div>
                    {alert.status === 'expiring_soon' && (
                      <p className="text-xs text-amber-600 mt-1">
                        Expired dalam {alert.days_until_expiry} hari
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.status === 'expiring_soon' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyMessage(alert, 'expiring')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Salin
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#25D366] hover:bg-[#128C7E]"
                        onClick={() => openWhatsApp(alert, 'expiring')}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                  {alert.can_redeem && alert.status !== 'expiring_soon' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyMessage(alert, 'threshold')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Salin
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#25D366] hover:bg-[#128C7E]"
                        onClick={() => openWhatsApp(alert, 'threshold')}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
