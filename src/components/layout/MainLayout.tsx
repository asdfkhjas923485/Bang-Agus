import Header from './Header';
import Footer from './Footer';
import WhatsAppFAB from './WhatsAppFAB';
import { useCustomerOrderNotifications } from '@/hooks/use-customer-order-notifications';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  // Enable real-time order status notifications for logged-in customers
  useCustomerOrderNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-water-pattern">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <WhatsAppFAB />
    </div>
  );
}
