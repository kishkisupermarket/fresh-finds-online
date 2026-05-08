import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Link, Navigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { items, totalPrice } = useCart();

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const tax = totalPrice * 0.13;
  const total = totalPrice + tax;

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <section className="bg-card border rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Order Summary</h2>

          <ul className="divide-y">
            {items.map(({ product, quantity }) => {
              const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
              return (
                <li key={product.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-card-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {quantity} × ${price.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">${(price * quantity).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (13% HST)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-display font-bold text-lg text-foreground">Total</span>
              <span className="font-display font-bold text-xl text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Delivery options, address, and payment coming soon.
        </p>

        <div className="mt-4 text-center">
          <Link to="/cart" className="text-sm text-primary hover:underline">← Back to Cart</Link>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
