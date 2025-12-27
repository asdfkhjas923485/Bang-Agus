import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "next-themes";

// Public pages
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import LoyaltyHistoryPage from "./pages/LoyaltyHistoryPage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminDiscountCodesPage from "./pages/admin/AdminDiscountCodesPage";
import AdminLoyaltyAlertsPage from "./pages/admin/AdminLoyaltyAlertsPage";

// Auth
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/produk" element={<ProductListPage />} />
                  <Route path="/produk/:id" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/lacak-pesanan" element={<OrderTrackingPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profil" element={<ProfilePage />} />
                  <Route path="/poin" element={<LoyaltyHistoryPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/produk"
                    element={
                      <ProtectedRoute>
                        <AdminProductsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/produk/new"
                    element={
                      <ProtectedRoute>
                        <AdminProductFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/produk/:id/edit"
                    element={
                      <ProtectedRoute>
                        <AdminProductFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pesanan"
                    element={
                      <ProtectedRoute>
                        <AdminOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/laporan"
                    element={
                      <ProtectedRoute>
                        <AdminReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/diskon"
                    element={
                      <ProtectedRoute>
                        <AdminDiscountCodesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/loyalty"
                    element={
                      <ProtectedRoute>
                        <AdminLoyaltyAlertsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
