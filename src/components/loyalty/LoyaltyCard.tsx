import { Gift, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

export default function LoyaltyCard() {
  const { user } = useAuth();
  const { points, lifetimePoints, redeemableDiscounts, pointsToNextDiscount, maxDiscountValue, POINTS_PER_DISCOUNT, isLoading } = useLoyaltyPoints();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="premium-card p-6 animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
      </div>
    );
  }

  const progressPercent = ((POINTS_PER_DISCOUNT - pointsToNextDiscount) / POINTS_PER_DISCOUNT) * 100;

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm opacity-80">Poin Loyalty Anda</p>
              <p className="text-3xl font-bold font-display">{points.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Total poin</p>
            <p className="font-semibold">{lifetimePoints.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Progress to next reward */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">Progress ke diskon berikutnya</span>
            <span className="font-medium">{POINTS_PER_DISCOUNT - pointsToNextDiscount}/{POINTS_PER_DISCOUNT}</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-primary-foreground/20" />
          <p className="text-xs opacity-80">
            {pointsToNextDiscount < POINTS_PER_DISCOUNT 
              ? `${pointsToNextDiscount} poin lagi untuk diskon Rp 5.000`
              : 'Mulai kumpulkan poin dari pesanan Anda!'
            }
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="p-6 space-y-4">
        {redeemableDiscounts > 0 && (
          <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Diskon Tersedia!</p>
              <p className="text-sm text-muted-foreground">
                Anda bisa tukar hingga <span className="text-secondary font-semibold">Rp {maxDiscountValue.toLocaleString('id-ID')}</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Setiap Belanja</span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold">1 Poin</span> per Rp 1.000
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-2 text-secondary mb-1">
              <Gift className="h-4 w-4" />
              <span className="text-xs font-medium">Tukar Poin</span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold">100 Poin</span> = Rp 5.000
            </p>
          </div>
        </div>

        <Link 
          to="/profil" 
          className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group"
        >
          <span className="text-sm text-muted-foreground">Lihat riwayat poin</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
