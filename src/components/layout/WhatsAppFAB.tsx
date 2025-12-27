import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ADMIN_WA_NUMBER } from '@/config/constants';
import { generateWhatsAppLink } from '@/lib/format';

export default function WhatsAppFAB() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const message = 'Halo, saya ingin bertanya tentang produk di Toko Agus.';
  const waLink = generateWhatsAppLink(ADMIN_WA_NUMBER, message);

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
      style={{ boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)' }}
      aria-label="Chat via WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
