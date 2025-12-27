import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Info, Trash2, Plus, Minus, MessageCircle, Loader2, ShoppingBag, Ticket, X, Check, Gift, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/use-orders';
import { useDiscountCode } from '@/hooks/use-discount-code';
import { useGuestLoyalty, POINTS_PER_DISCOUNT, DISCOUNT_VALUE } from '@/hooks/use-guest-loyalty';
import { formatRupiah, generateWhatsAppLink, generateOrderMessage } from '@/lib/format';
import { ADMIN_WA_NUMBER, SERVICE_CITY } from '@/config/constants';
import { toast } from 'sonner';
import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'Nomor WhatsApp tidak valid'),
  address: z.string().min(10, 'Alamat terlalu pendek').max(500, 'Alamat terlalu panjang'),
});

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, getSubtotal, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { isValidating, appliedDiscount, validateCode, clearDiscount } = useDiscountCode();
  const { loyalty, isLoading: loyaltyLoading, fetchLoyaltyByPhone, redeemPoints } = useGuestLoyalty();
  
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [discountInput, setDiscountInput] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [isCheckingPoints, setIsCheckingPoints] = useState(false);

  const subtotal = getSubtotal();
  const shipping = 0;
  const discountAmount = appliedDiscount?.isValid ? appliedDiscount.discountAmount : 0;
  const pointsDiscount = Math.floor(pointsToRedeem / POINTS_PER_DISCOUNT) * DISCOUNT_VALUE;
  const total = Math.max(0, subtotal + shipping - discountAmount - pointsDiscount);
  
  const availablePoints = loyalty?.points || 0;
  const maxRedeemablePoints = Math.floor(availablePoints / POINTS_PER_DISCOUNT) * POINTS_PER_DISCOUNT;
  const remainingAfterDiscount = subtotal + shipping - discountAmount;
  const maxPointsNeeded = Math.ceil(remainingAfterDiscount / DISCOUNT_VALUE) * POINTS_PER_DISCOUNT;
  const effectiveMaxPoints = Math.min(maxRedeemablePoints, maxPointsNeeded);

  // Check loyalty points when phone number changes
  useEffect(() => {
    const checkPoints = async () => {
      if (formData.phone.length >= 10) {
        setIsCheckingPoints(true);
        await fetchLoyaltyByPhone(formData.phone);
        setIsCheckingPoints(false);
      }
    };
    
    const timeoutId = setTimeout(checkPoints, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.phone]);

  const handleRedeemPoints = (points: number) => {
    const validPoints = Math.min(points, effectiveMaxPoints);
    setPointsToRedeem(Math.max(0, Math.floor(validPoints / POINTS_PER_DISCOUNT) * POINTS_PER_DISCOUNT));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleApplyDiscount = async () => {
    await validateCode(discountInput, subtotal);
  };

  const handleRemoveDiscount = () => {
    clearDiscount();
    setDiscountInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (items.length === 0) {
      toast.error('Keranjang belanja kosong');
      return;
    }

    try {
      // Redeem points if any
      if (pointsToRedeem > 0 && formData.phone) {
        await redeemPoints(formData.phone, pointsToRedeem);
      }

      await createOrder.mutateAsync({
        customerName: formData.name,
        whatsapp: formData.phone,
        address: formData.address,
        city: SERVICE_CITY,
        items: items,
        subtotal,
        shippingCost: shipping,
        total,
        discountCode: appliedDiscount?.discountCode?.code,
        discountAmount: discountAmount + pointsDiscount,
      });

      const orderItems = items.map((item) => ({ name: item.product.name, qty: item.quantity, price: item.product.price }));
      const message = generateOrderMessage(formData.name, formData.phone, formData.address, orderItems, subtotal, shipping, total);
      window.open(generateWhatsAppLink(ADMIN_WA_NUMBER, message), '_blank');
      clearCart();
      setFormData({ name: '', phone: '', address: '' });
      clearDiscount();
      setDiscountInput('');
      setPointsToRedeem(0);
      toast.success('Pesanan berhasil dibuat!');
    } catch (error) {
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3 font-display">Keranjang Kosong</h1>
            <p className="text-muted-foreground mb-8">Anda belum menambahkan produk ke keranjang.</p>
            <Button variant="hero" asChild>
              <Link to="/produk">Lihat Produk</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary">Beranda</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Checkout</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground font-display">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="premium-card p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 font-display">Detail Pemesan</h2>
                <div className="flex gap-3 p-4 bg-accent-light rounded-xl mb-6">
                  <Info className="h-5 w-5 text-accent shrink-0" />
                  <p className="text-sm text-foreground">Pastikan data benar dan nomor WhatsApp bisa dihubungi.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block font-medium text-foreground mb-2">Nama Lengkap</label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className={errors.name ? 'border-destructive' : ''} />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-2">Nomor WhatsApp</label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="08xxxxxxxxxx" className={errors.phone ? 'border-destructive' : ''} />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-2">Alamat Lengkap</label>
                    <Textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Alamat lengkap, gedung, RT/RW" rows={3} className={errors.address ? 'border-destructive' : ''} />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Discount Code Section */}
              <div className="premium-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4 font-display flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Kode Diskon
                </h2>
                {appliedDiscount?.isValid ? (
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-primary font-mono">{appliedDiscount.discountCode?.code}</p>
                        <p className="text-sm text-muted-foreground">Hemat {formatRupiah(discountAmount)}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveDiscount}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                        placeholder="Masukkan kode promo"
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={isValidating || !discountInput.trim()}
                      >
                        {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terapkan'}
                      </Button>
                    </div>
                    {appliedDiscount?.errorMessage && (
                      <p className="text-sm text-destructive">{appliedDiscount.errorMessage}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Points Redemption Section */}
              {formData.phone.length >= 10 && (
                <div className="premium-card p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 font-display flex items-center gap-2">
                    <Coins className="h-5 w-5 text-secondary" />
                    Poin Loyalty
                  </h2>
                  
                  {isCheckingPoints || loyaltyLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-secondary mr-2" />
                      <span className="text-sm text-muted-foreground">Mengecek poin...</span>
                    </div>
                  ) : availablePoints > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Gift className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Poin Anda: <span className="text-secondary">{availablePoints.toLocaleString()}</span></p>
                            <p className="text-xs text-muted-foreground">{POINTS_PER_DISCOUNT} poin = {formatRupiah(DISCOUNT_VALUE)} diskon</p>
                          </div>
                        </div>
                      </div>
                      
                      {effectiveMaxPoints >= POINTS_PER_DISCOUNT ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tukar poin:</span>
                            <span className="font-medium text-secondary">{pointsToRedeem.toLocaleString()} poin = {formatRupiah(pointsDiscount)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={effectiveMaxPoints}
                            step={POINTS_PER_DISCOUNT}
                            value={pointsToRedeem}
                            onChange={(e) => handleRedeemPoints(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0 poin</span>
                            <span>{effectiveMaxPoints.toLocaleString()} poin</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {[0, Math.floor(effectiveMaxPoints / 2 / POINTS_PER_DISCOUNT) * POINTS_PER_DISCOUNT, effectiveMaxPoints].filter((v, i, a) => a.indexOf(v) === i && v >= 0).map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                variant={pointsToRedeem === preset ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleRedeemPoints(preset)}
                                className="text-xs"
                              >
                                {preset === 0 ? 'Tidak pakai' : `${preset} poin`}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Minimal {POINTS_PER_DISCOUNT} poin untuk ditukar
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Belum ada poin untuk nomor ini</p>
                      <p className="text-xs text-muted-foreground mt-1">Selesaikan pesanan untuk mulai mengumpulkan poin!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="premium-card p-6 sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6 font-display">Ringkasan</h2>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded-xl bg-muted object-contain" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground">{formatRupiah(item.product.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><Minus className="h-3 w-3" /></button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><Plus className="h-3 w-3" /></button>
                          <button type="button" onClick={() => removeFromCart(item.product.id)} className="ml-auto text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="font-semibold text-secondary text-sm">{formatRupiah(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ongkir</span><span className="text-primary font-medium">Gratis</span></div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon Kode</span><span className="text-primary font-medium">-{formatRupiah(discountAmount)}</span></div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon Poin ({pointsToRedeem} poin)</span><span className="text-secondary font-medium">-{formatRupiah(pointsDiscount)}</span></div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>Total</span><span className="text-secondary">{formatRupiah(total)}</span></div>
                </div>
                <Button type="submit" variant="heroSecondary" className="w-full mt-6" disabled={createOrder.isPending}>
                  {createOrder.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses...</> : <>Pesan via WhatsApp<MessageCircle className="h-4 w-4 ml-2" /></>}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}