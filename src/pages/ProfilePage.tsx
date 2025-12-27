import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Package, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit2, 
  LogOut,
  Loader2,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useProfile, 
  useUpdateProfile, 
  useSavedAddresses, 
  useAddAddress, 
  useDeleteAddress,
  useUserOrders 
} from '@/hooks/use-profile';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { formatRupiah } from '@/lib/format';
import { STATUS_LABELS } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: addresses, isLoading: addressesLoading } = useSavedAddresses();
  const { data: orders, isLoading: ordersLoading } = useUserOrders();
  const updateProfile = useUpdateProfile();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();

  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Rumah', address: '', city: '' });

  // Redirect if not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 font-display">Silakan Login</h1>
          <p className="text-muted-foreground mb-6">Anda harus login untuk melihat profil</p>
          <Button asChild>
            <Link to="/admin/login">Login</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile.mutateAsync({ 
        full_name: fullName || undefined, 
        phone: phone || undefined 
      });
      toast.success('Profil berhasil diperbarui');
      setEditingProfile(false);
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address.trim()) {
      toast.error('Alamat tidak boleh kosong');
      return;
    }
    try {
      await addAddress.mutateAsync({
        label: newAddress.label,
        address: newAddress.address,
        city: newAddress.city || undefined,
        is_default: (addresses || []).length === 0,
      });
      toast.success('Alamat berhasil ditambahkan');
      setShowAddressDialog(false);
      setNewAddress({ label: 'Rumah', address: '', city: '' });
    } catch (error) {
      toast.error('Gagal menambahkan alamat');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress.mutateAsync(id);
      toast.success('Alamat berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus alamat');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Berhasil logout');
  };

  const startEditProfile = () => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setEditingProfile(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      baru: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      menunggu_konfirmasi: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      diproses: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      dikirim: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      selesai: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      batal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.baru;
  };

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Beranda</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Profil Saya</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Loyalty Card */}
          <LoyaltyCard />

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="profile" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="addresses" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Alamat
              </TabsTrigger>
              <TabsTrigger value="orders" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="h-4 w-4 mr-2" />
                Pesanan
              </TabsTrigger>
              <TabsTrigger value="points" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="h-4 w-4 mr-2" />
                Poin
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display">Informasi Profil</h2>
                  {!editingProfile && (
                    <Button variant="outline" size="sm" onClick={startEditProfile}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {profileLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : editingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleUpdateProfile} disabled={updateProfile.isPending}>
                        {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Simpan
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingProfile(false)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {profile?.full_name || 'Belum diisi'}
                        </h3>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Telepon</p>
                          <p className="font-medium">{profile?.phone || 'Belum diisi'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display">Alamat Tersimpan</h2>
                  <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Alamat Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="label">Label</Label>
                          <Input
                            id="label"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            placeholder="Rumah, Kantor, dll"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Alamat Lengkap</Label>
                          <Input
                            id="address"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            placeholder="Jl. Contoh No. 123"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Kota</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="Jakarta"
                          />
                        </div>
                        <Button onClick={handleAddAddress} className="w-full" disabled={addAddress.isPending}>
                          {addAddress.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Simpan Alamat
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {addressesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{address.label}</span>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">Utama</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{address.address}</p>
                          {address.city && (
                            <p className="text-muted-foreground text-sm">{address.city}</p>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Alamat ini akan dihapus secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAddress(address.id)}>
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada alamat tersimpan</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="premium-card p-6">
                <h2 className="text-xl font-bold font-display mb-6">Riwayat Pesanan</h2>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="border border-border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-muted/30">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2 mb-4">
                            {order.order_items?.slice(0, 2).map((item: any) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {item.product_name} x{item.qty}
                                </span>
                                <span className="font-medium">{formatRupiah(item.line_total)}</span>
                              </div>
                            ))}
                            {order.order_items?.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{order.order_items.length - 2} produk lainnya
                              </p>
                            )}
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-primary">{formatRupiah(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada riwayat pesanan</p>
                    <Button asChild className="mt-4">
                      <Link to="/produk">Mulai Belanja</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Points Tab */}
            <TabsContent value="points">
              <PointsHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

function PointsHistory() {
  const { transactions, isLoading } = useLoyaltyPoints();

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      earn: { text: 'Dapat Poin', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      redeem: { text: 'Tukar Poin', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      bonus: { text: 'Bonus', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      expire: { text: 'Kedaluwarsa', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    return labels[type] || labels.earn;
  };

  return (
    <div className="premium-card p-6">
      <h2 className="text-xl font-bold font-display mb-6">Riwayat Poin</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tx.points > 0 ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                <Star className={`h-5 w-5 ${tx.points > 0 ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getTypeLabel(tx.type).color}>
                    {getTypeLabel(tx.type).text}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tx.created_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
              <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {tx.points > 0 ? '+' : ''}{tx.points}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada riwayat poin</p>
          <p className="text-sm text-muted-foreground mt-1">Mulai belanja untuk mengumpulkan poin!</p>
        </div>
      )}
    </div>
  );
}
