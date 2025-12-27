import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'air_mineral', label: 'Air Mineral' },
  { value: 'galon_air', label: 'Galon Air' },
  { value: 'gas_lpg', label: 'Gas LPG' },
];

const BADGES = ['', 'Promo', 'Best Seller'];

export default function AdminProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'air_mineral',
    variant_label: '',
    unit_label: '',
    price: 0,
    image_url: '',
    stock: 0,
    is_active: true,
    badge: '',
  });

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Produk tidak ditemukan');
      navigate('/admin/produk');
    } else if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'air_mineral',
        variant_label: data.variant_label || '',
        unit_label: data.unit_label || '',
        price: data.price || 0,
        image_url: data.image_url || '',
        stock: data.stock || 0,
        is_active: data.is_active ?? true,
        badge: data.badges?.[0] || '',
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Gagal mengupload gambar');
      console.error(uploadError);
    } else {
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Gambar berhasil diupload');
    }

    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('Nama dan harga produk harus diisi');
      return;
    }

    setIsSaving(true);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      variant_label: formData.variant_label || null,
      unit_label: formData.unit_label || null,
      price: formData.price,
      image_url: formData.image_url || null,
      stock: formData.stock,
      is_active: formData.is_active,
      badges: formData.badge ? [formData.badge] : [],
    };

    if (isEditing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) {
        toast.error('Gagal menyimpan produk');
        console.error(error);
      } else {
        toast.success('Produk berhasil diperbarui');
        navigate('/admin/produk');
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        toast.error('Gagal menambahkan produk');
        console.error(error);
      } else {
        toast.success('Produk berhasil ditambahkan');
        navigate('/admin/produk');
      }
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <button
          onClick={() => navigate('/admin/produk')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Produk
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-6">
          <div>
            <label className="block font-medium text-foreground mb-2">Nama Produk *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Contoh: Galon Air 19 Liter"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-2">Deskripsi</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Deskripsi produk..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-foreground mb-2">Kategori *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-2">Badge</label>
              <Select
                value={formData.badge || "none"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, badge: value === "none" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih badge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {BADGES.filter(Boolean).map((badge) => (
                    <SelectItem key={badge} value={badge}>
                      {badge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-foreground mb-2">Varian</label>
              <Input
                name="variant_label"
                value={formData.variant_label}
                onChange={handleInputChange}
                placeholder="Contoh: 12 Botol"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-2">Satuan</label>
              <Input
                name="unit_label"
                value={formData.unit_label}
                onChange={handleInputChange}
                placeholder="Contoh: /pak"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-foreground mb-2">Harga (Rp) *</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="25000"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-2">Stok</label>
              <Input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-2">Gambar Produk</label>
            <div className="flex gap-4 items-start">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover bg-muted"
                />
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isUploading ? 'Mengupload...' : 'Klik untuk upload gambar'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Format: JPG, PNG. Maksimal 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            />
            <label htmlFor="is_active" className="font-medium text-foreground cursor-pointer">
              Produk Aktif
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
