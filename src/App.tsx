import { AppProvider, useApp } from './context';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/Toast';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import OrderHistory from './pages/OrderHistory';
import Tracking from './pages/Tracking';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import { TermsPage, PrivacyPage } from './pages/Legal';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';

const NO_FOOTER_PAGES = new Set(['login', 'confirmation', 'admin']);

function AppShell() {
  const { page } = useApp();

  if (page === 'admin') {
    return (
      <>
        <Admin />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5]">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {page === 'home' && <Home />}
        {page === 'catalogue' && <Catalogue />}
        {page === 'product' && <ProductDetail />}
        {page === 'cart' && <CartPage />}
        {page === 'checkout' && <Checkout />}
        {page === 'confirmation' && <Confirmation />}
        {page === 'login' && <Login />}
        {page === 'orders' && <OrderHistory />}
        {page === 'tracking' && <Tracking />}
        {page === 'about' && <About />}
        {page === 'contact' && <Contact />}
        {page === 'faq' && <FAQ />}
        {page === 'terms' && <TermsPage />}
        {page === 'privacy' && <PrivacyPage />}
        {page === 'notfound' && <NotFound />}
      </main>
      {!NO_FOOTER_PAGES.has(page) && <Footer />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
