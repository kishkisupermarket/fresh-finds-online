import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';

const OrderConfirmationPage = () => {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!sessionId) { setError('Missing session.'); return; }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
        });
        if (error) throw error;
        if (!data?.order) throw new Error('Order not found');
        setOrder(data.order);
        clearCart();
      } catch (e: any) {
        setError(e.message || 'Failed to verify payment');
      }
    })();
  }, [sessionId, clearCart]);

  if (error) {
    return (
      <Layout>
        <div className="container py-16 max-w-xl text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/"><Button>Back to Home</Button></Link>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Confirming your payment...</p>
        </div>
      </Layout>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <Layout>
      <div className="container py-12 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold">Thank you for your order!</h1>
          <p className="text-muted-foreground mt-2">A confirmation has been sent to {order.customer_email}.</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Method</span>
            <span className="capitalize font-semibold">{order.delivery_method}</span>
          </div>
          {order.delivery_method === 'delivery' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Date</span>
                <span>{order.delivery_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right">{order.delivery_address}, {order.delivery_city}</span>
              </div>
            </>
          )}

          <div className="border-t pt-4">
            <h2 className="font-display font-bold mb-3">Items</h2>
            <ul className="divide-y">
              {items.map((it: any, idx: number) => (
                <li key={idx} className="flex justify-between py-2 text-sm">
                  <span>{it.name} × {it.quantity}</span>
                  <span>${(it.price * it.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4 flex justify-between">
            <span className="font-display font-bold text-lg">Total Paid</span>
            <span className="font-display font-bold text-xl text-primary">
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/"><Button>Continue Shopping</Button></Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;
