import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Coins, TrendingUp, TrendingDown, Calendar, Filter, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGuestLoyalty, POINTS_PER_DISCOUNT, DISCOUNT_VALUE } from '@/hooks/use-guest-loyalty';
import { formatRupiah } from '@/lib/format';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string | null;
  order_id: string | null;
}

export default function LoyaltyHistoryPage() {
  const [phone, setPhone] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  
  const { loyalty, isLoading, fetchLoyaltyByPhone, getTransactionHistory } = useGuestLoyalty();

  const handleSearch = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Masukkan nomor WhatsApp yang valid');
      return;
    }
    
    await fetchLoyaltyByPhone(phone);
    const txData = await getTransactionHistory(phone);
    setTransactions(txData);
    setIsSearched(true);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    
    let matchesMonth = true;
    if (filterMonth !== 'all' && tx.created_at) {
      const txMonth = format(new Date(tx.created_at), 'yyyy-MM');
      matchesMonth = txMonth === filterMonth;
    }
    
    return matchesType && matchesMonth;
  });

  // Get unique months from transactions
  const months = [...new Set(transactions
    .filter(tx => tx.created_at)
    .map(tx => format(new Date(tx.created_at!), 'yyyy-MM'))
  )].sort().reverse();

  const redeemableDiscounts = loyalty ? Math.floor(loyalty.points / POINTS_PER_DISCOUNT) : 0;
  const maxDiscount = redeemableDiscounts * DISCOUNT_VALUE;

  return (
    <MainLayout>
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary">Beranda</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Riwayat Poin</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground font-display">Riwayat Poin Loyalty</h1>
          <p className="text-muted-foreground mt-2">Cek poin dan riwayat transaksi Anda</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="premium-card p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 font-display flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Cari Poin Anda
          </h2>
          <div className="flex gap-3">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Masukkan nomor WhatsApp (08xxxxxxxx)"
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
            </Button>
          </div>
        </div>

        {isSearched && (
          <>
            {/* Points Summary */}
            {loyalty ? (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="premium-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Poin Saat Ini</p>
                      <p className="text-2xl font-bold text-foreground font-display">{loyalty.points.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="premium-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Poin Diperoleh</p>
                      <p className="text-2xl font-bold text-foreground font-display">{loyalty.lifetime_points.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="premium-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diskon Tersedia</p>
                      <p className="text-2xl font-bold text-foreground font-display">{formatRupiah(maxDiscount)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{redeemableDiscounts}x tukar ({POINTS_PER_DISCOUNT} poin = {formatRupiah(DISCOUNT_VALUE)})</p>
                </div>
              </div>
            ) : (
              <div className="premium-card p-8 text-center mb-8">
                <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Belum Ada Poin</h3>
                <p className="text-muted-foreground">Nomor WhatsApp ini belum memiliki riwayat poin. Lakukan pembelian untuk mulai mengumpulkan poin!</p>
              </div>
            )}

            {/* Filters */}
            {transactions.length > 0 && (
              <div className="premium-card p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="earn">Dapat Poin</SelectItem>
                      <SelectItem value="redeem">Tukar Poin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {format(new Date(month + '-01'), 'MMMM yyyy', { locale: id })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div className="premium-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-6 font-display flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Riwayat Transaksi
              </h2>
              
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada transaksi yang ditemukan
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'earn' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-secondary/20 text-secondary'
                        }`}>
                          {tx.type === 'earn' ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description || (tx.type === 'earn' ? 'Dapat Poin' : 'Tukar Poin')}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.created_at && format(new Date(tx.created_at), 'd MMM yyyy, HH:mm', { locale: id })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${
                        tx.type === 'earn' ? 'text-primary' : 'text-secondary'
                      }`}>
                        {tx.type === 'earn' ? '+' : ''}{tx.points.toLocaleString()} poin
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Info Section */}
        <div className="mt-8 premium-card p-6 bg-accent-light border-accent/20">
          <h3 className="font-semibold text-foreground mb-4">Cara Kerja Poin Loyalty</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-medium text-foreground mb-1">Dapat Poin</p>
              <p className="text-muted-foreground">Setiap Rp 1.000 belanja = 1 poin + 5 poin bonus per transaksi</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Tukar Poin</p>
              <p className="text-muted-foreground">{POINTS_PER_DISCOUNT} poin = {formatRupiah(DISCOUNT_VALUE)} diskon di checkout</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Masa Berlaku</p>
              <p className="text-muted-foreground">Poin hangus jika tidak ada transaksi selama 6 bulan</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
