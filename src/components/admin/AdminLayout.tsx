import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Droplets, 
  ExternalLink,
  Bell,
  ChevronRight,
  Ticket,
  Coins
} from 'lucide-react';
import { STORE_NAME } from '@/config/constants';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useOrderNotifications } from '@/hooks/use-order-notifications';
import { formatRupiah } from '@/lib/format';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Produk', path: '/admin/produk' },
  { icon: ShoppingCart, label: 'Pesanan', path: '/admin/pesanan' },
  { icon: Ticket, label: 'Diskon', path: '/admin/diskon' },
  { icon: Coins, label: 'Loyalty', path: '/admin/loyalty' },
  { icon: BarChart3, label: 'Laporan', path: '/admin/laporan' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { newOrders, unreadCount, clearUnread, clearNotifications } = useOrderNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const handleNotifOpen = (open: boolean) => {
    setNotifOpen(open);
    if (open) {
      clearUnread();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-sidebar text-sidebar-foreground hidden lg:flex flex-col fixed h-full">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-primary flex items-center justify-center">
              <Droplets className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg block">{STORE_NAME}</span>
              <span className="text-xs text-sidebar-foreground/60">Admin Panel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive(item.path) 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {isActive(item.path) && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-sidebar-foreground/50">Logged in as</p>
            <p className="text-sm truncate">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-sidebar text-sidebar-foreground z-50 border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-bold">{STORE_NAME}</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            
            {/* Mobile Notifications */}
            <Popover open={notifOpen} onOpenChange={handleNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-sidebar-foreground">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notifikasi</h3>
                  {newOrders.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs">
                      Hapus Semua
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {newOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Belum ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {newOrders.map((order) => (
                        <Link
                          key={order.id}
                          to="/admin/pesanan"
                          className="block p-4 hover:bg-muted/50 transition-colors"
                          onClick={() => setNotifOpen(false)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">Pesanan Baru</p>
                              <p className="text-sm text-muted-foreground truncate">{order.customer_name}</p>
                              <p className="text-xs text-secondary font-semibold">{formatRupiah(order.total)}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatTime(order.created_at)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-sidebar-foreground">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="p-4 space-y-1 border-t border-sidebar-border animate-fade-in">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive(item.path) ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold' : 'text-sidebar-foreground/70'}`}>
                <item.icon className="h-5 w-5" /><span>{item.label}</span>
              </Link>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sidebar-foreground/70">
              <LogOut className="h-5 w-5" /><span>Logout</span>
            </button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 hidden lg:flex">
          <h1 className="text-lg font-semibold text-foreground font-display">
            {menuItems.find(item => isActive(item.path))?.label || 'Admin Dashboard'}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Desktop Notifications */}
            <Popover open={notifOpen} onOpenChange={handleNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notifikasi</h3>
                  {newOrders.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs">
                      Hapus Semua
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {newOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Belum ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {newOrders.map((order) => (
                        <Link
                          key={order.id}
                          to="/admin/pesanan"
                          className="block p-4 hover:bg-muted/50 transition-colors"
                          onClick={() => setNotifOpen(false)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">Pesanan Baru</p>
                              <p className="text-sm text-muted-foreground truncate">{order.customer_name}</p>
                              <p className="text-xs text-secondary font-semibold">{formatRupiah(order.total)}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatTime(order.created_at)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1 ml-2">
              <ExternalLink className="h-4 w-4" />Lihat Toko
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 mt-16 lg:mt-0 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
