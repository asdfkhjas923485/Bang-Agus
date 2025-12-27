import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Droplets } from 'lucide-react';
import { STORE_NAME, SERVICE_CITY, ADMIN_WA_NUMBER } from '@/config/constants';
import { generateWhatsAppLink } from '@/lib/format';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Droplets className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">{STORE_NAME}</span>
            </div>
            <p className="text-background/70 leading-relaxed max-w-sm">
              Layanan antar air mineral, galon, dan gas LPG terpercaya untuk area {SERVICE_CITY} dan sekitarnya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Navigasi</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/produk" className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Semua Produk
                </Link>
              </li>
              <li>
                <Link to="/produk?category=galon_air" className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Galon Air
                </Link>
              </li>
              <li>
                <Link to="/produk?category=gas_lpg" className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Gas LPG
                </Link>
              </li>
              <li>
                <Link to="/lacak-pesanan" className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Lacak Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href={generateWhatsAppLink(ADMIN_WA_NUMBER, 'Halo, saya ingin bertanya tentang produk.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-background/70 hover:text-background transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>+62 822-9912-1576</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>{SERVICE_CITY}, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <span>08:00 - 21:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {currentYear} {STORE_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-background/50">
            Melayani area {SERVICE_CITY} & sekitarnya
          </p>
        </div>
      </div>
    </footer>
  );
}
