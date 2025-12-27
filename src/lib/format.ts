export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateOrderMessage(
  customerName: string,
  customerPhone: string,
  address: string,
  items: { name: string; qty: number; price: number }[],
  subtotal: number,
  shipping: number,
  total: number
): string {
  const itemLines = items
    .map((item) => `• ${item.qty}x ${item.name} - ${formatRupiah(item.price * item.qty)}`)
    .join('\n');

  return `🛒 *PESANAN BARU - TOKO AGUS*

👤 *Detail Pemesan:*
Nama: ${customerName}
WhatsApp: ${customerPhone}
Alamat: ${address}

📦 *Pesanan:*
${itemLines}

💰 *Ringkasan:*
Subtotal: ${formatRupiah(subtotal)}
Ongkos Kirim: ${formatRupiah(shipping)}
*Total: ${formatRupiah(total)}*

Mohon konfirmasi pesanan saya. Terima kasih! 🙏`;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'air_mineral': 'Air Mineral',
    'galon_air': 'Galon Air',
    'gas_lpg': 'Gas LPG',
  };
  return labels[category] || category;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'baru': 'bg-blue-100 text-blue-800',
    'menunggu_konfirmasi': 'bg-amber-100 text-amber-800',
    'diproses': 'bg-cyan-100 text-cyan-800',
    'dikirim': 'bg-indigo-100 text-indigo-800',
    'selesai': 'bg-emerald-100 text-emerald-800',
    'batal': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
