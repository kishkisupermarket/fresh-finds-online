import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Leaf } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { label: 'Meats', path: '/category/meats' },
  { label: 'Grocery', path: '/category/grocery' },
  { label: 'Vegetables', path: '/category/vegetables' },
];

const Header = () => {
  const { totalItems } = useCart();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground hidden sm:block">
            Kishki Halal Supermarket
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map(c => (
            <Link key={c.path} to={c.path} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {c.label}
            </Link>
          ))}
          <Link to="/flyer" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors">
            Weekly Deals
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </form>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-bold"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t bg-card"
          >
            <div className="container py-4 flex flex-col gap-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/30"
                />
              </form>
              {categories.map(c => (
                <Link key={c.path} to={c.path} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground py-2 hover:text-primary transition-colors">
                  {c.label}
                </Link>
              ))}
              <Link to="/flyer" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-secondary py-2">
                Weekly Deals
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
