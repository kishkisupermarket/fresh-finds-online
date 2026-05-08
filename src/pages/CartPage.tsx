import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const categoryEmoji: Record<string, string> = { meats: '🥩', grocery: '🛒', vegetables: '🥦' };

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm">
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {items.map(({ product, quantity }) => {
              const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
              return (
                <motion.div
                  key={product.id}
                  layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-card border rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                    {categoryEmoji[product.category] || '🛍️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-card-foreground truncate">{product.name}</h3>
                    <p className="text-sm text-primary font-bold">${price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-foreground w-16 text-right">${(price * quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(product.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-lg font-bold text-foreground">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
            <span>Tax (13% HST)</span>
            <span>${(totalPrice * 0.13).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-6 border-t pt-4">
            <span className="font-display font-bold text-lg text-foreground">Total</span>
            <span className="font-display font-bold text-xl text-primary">${(totalPrice * 1.13).toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
            Proceed to Checkout
          </Link>
          <div className="flex justify-between mt-3">
            <Link to="/" className="text-sm text-primary hover:underline">Continue Shopping</Link>
            <button onClick={clearCart} className="text-sm text-destructive hover:underline">Clear Cart</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
