import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/lib/format';
import { toast } from 'sonner';

interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

const initialFormData = {
  code: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 0,
  min_order_amount: 0,
  max_uses: '',
  valid_until: '',
};

export default function AdminDiscountCodesPage() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscountCodes((data || []) as DiscountCode[]);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      toast.error('Gagal memuat kode diskon');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const handleOpenDialog = (code?: DiscountCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        description: code.description || '',
        discount_type: code.discount_type,
        discount_value: code.discount_value,
        min_order_amount: code.min_order_amount,
        max_uses: code.max_uses?.toString() || '',
        valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      });
    } else {
      setEditingCode(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('Kode diskon wajib diisi');
      return;
    }

    if (formData.discount_value <= 0) {
      toast.error('Nilai diskon harus lebih dari 0');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_order_amount: formData.min_order_amount,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until ? `${formData.valid_until}T23:59:59` : null,
      };

      if (editingCode) {
        const { error } = await supabase
          .from('discount_codes')
          .update(payload)
          .eq('id', editingCode.id);
        if (error) throw error;
        toast.success('Kode diskon berhasil diperbarui');
      } else {
        const { error } = await supabase.from('discount_codes').insert(payload);
        if (error) throw error;
        toast.success('Kode diskon berhasil dibuat');
      }

      setIsDialogOpen(false);
      fetchDiscountCodes();
    } catch (error: unknown) {
      console.error('Error saving discount code:', error);
      if ((error as { code?: string })?.code === '23505') {
        toast.error('Kode diskon sudah digunakan');
      } else {
        toast.error('Gagal menyimpan kode diskon');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (code: DiscountCode) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !code.is_active })
        .eq('id', code.id);

      if (error) throw error;
      toast.success(`Kode diskon ${code.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error toggling discount code:', error);
      toast.error('Gagal mengubah status kode diskon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kode diskon ini?')) return;

    try {
      const { error } = await supabase.from('discount_codes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Kode diskon berhasil dihapus');
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast.error('Gagal menghapus kode diskon');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-display">Kode Diskon</h1>
          <p className="text-muted-foreground mt-1">Kelola promo dan kode diskon</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Edit Kode Diskon' : 'Tambah Kode Diskon'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Kode Diskon</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DISKON10"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Deskripsi (opsional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Diskon spesial akhir tahun"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipe Diskon</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(v) => setFormData({ ...formData, discount_type: v as 'percentage' | 'fixed' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nilai Diskon</Label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseInt(e.target.value) || 0 })}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '10000'}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min. Belanja</Label>
                  <Input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: parseInt(e.target.value) || 0 })}
                    placeholder="50000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Maks. Penggunaan</Label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Berlaku Hingga (opsional)</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCode ? 'Simpan Perubahan' : 'Buat Kode Diskon'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : discountCodes.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada kode diskon</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Kode</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Diskon</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Min. Belanja</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Penggunaan</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-muted-foreground text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {discountCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-primary font-mono">{code.code}</p>
                        {code.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{code.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-secondary">
                      {code.discount_type === 'percentage'
                        ? `${code.discount_value}%`
                        : formatRupiah(code.discount_value)}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {code.min_order_amount > 0 ? formatRupiah(code.min_order_amount) : '-'}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {code.used_count} / {code.max_uses || '∞'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(code)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          code.is_active
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {code.is_active ? (
                          <ToggleRight className="h-3.5 w-3.5" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {code.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(code)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(code.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
