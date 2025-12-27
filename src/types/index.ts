export interface Product {
  id: string;
  name: string;
  description?: string;
  category: 'air_mineral' | 'galon_air' | 'gas_lpg';
  variantLabel?: string;
  unitLabel?: string;
  price: number;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  badges: string[];
  isActive: boolean;
  stock: number;
  sold: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  address: string;
  city?: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  status: 'baru' | 'menunggu_konfirmasi' | 'diproses' | 'dikirim' | 'selesai' | 'batal';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  'air_mineral': 'Air Mineral',
  'galon_air': 'Galon Air',
  'gas_lpg': 'Gas LPG',
};

export const STATUS_LABELS: Record<string, string> = {
  'baru': 'Baru',
  'menunggu_konfirmasi': 'Menunggu Konfirmasi',
  'diproses': 'Diproses',
  'dikirim': 'Dikirim',
  'selesai': 'Selesai',
  'batal': 'Batal',
};
