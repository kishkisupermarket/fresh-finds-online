import { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CITY_FEES: Record<string, number> = {
  Waterloo: 15,
  Kitchener: 20,
  Cambridge: 30,
};
const MIN_DELIVERY = 150;

const CheckoutPage = () => {
  const { items, totalPrice } = useCart();

  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const deliveryFee = method === 'delivery' && city ? (CITY_FEES[city] ?? 0) : 0;
  const tax = totalPrice * 0.13;
  const total = totalPrice + tax + deliveryFee;

  const afterCutoff = new Date().getHours() >= 14;
  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (afterCutoff) d.setDate(d.getDate() + 1);
    return d;
  }, [afterCutoff]);

  const cityUnavailable = method === 'delivery' && city && !(city in CITY_FEES);
  const belowMin = method === 'delivery' && totalPrice < MIN_DELIVERY;

  const canSubmit =
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    !loading &&
    (method === 'pickup' ||
      (address.trim() && city && !cityUnavailable && !belowMin && date));

  const handlePay = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload = {
        items: items.map(({ product, quantity }) => ({
          name: product.name,
          quantity,
          price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
        })),
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        delivery_method: method,
        delivery_address: method === 'delivery' ? address : null,
        delivery_city: method === 'delivery' ? city : null,
        delivery_fee: deliveryFee,
        delivery_date: method === 'delivery' && date ? format(date, 'yyyy-MM-dd') : null,
        subtotal: Number(totalPrice.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
      };

      const { data, error } = await supabase.functions.invoke('create-checkout', { body: payload });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

        {/* Method toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            type="button"
            variant={method === 'pickup' ? 'default' : 'outline'}
            onClick={() => setMethod('pickup')}
            className="h-12"
          >
            Pickup
          </Button>
          <Button
            type="button"
            variant={method === 'delivery' ? 'default' : 'outline'}
            onClick={() => setMethod('delivery')}
            className="h-12"
          >
            Delivery
          </Button>
        </div>

        {/* Customer info */}
        <section className="bg-card border rounded-lg p-6 space-y-4 mb-6">
          <h2 className="font-display text-xl font-bold">Customer Info</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Delivery details */}
        {method === 'delivery' && (
          <section className="bg-card border rounded-lg p-6 space-y-4 mb-6">
            <h2 className="font-display text-xl font-bold">Delivery Details</h2>
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div>
              <Label>City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Waterloo">Waterloo — $15</SelectItem>
                  <SelectItem value="Kitchener">Kitchener — $20</SelectItem>
                  <SelectItem value="Cambridge">Cambridge — $30</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {cityUnavailable && (
                <p className="text-sm text-destructive mt-2">
                  Sorry, delivery is not available in your area.
                </p>
              )}
            </div>
            <div>
              <Label>Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < minDate}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              {afterCutoff && (
                <p className="text-xs text-muted-foreground mt-1">
                  After 2:00 PM — earliest delivery is tomorrow.
                </p>
              )}
            </div>
            {belowMin && (
              <p className="text-sm text-destructive">Minimum order for delivery is $150.</p>
            )}
          </section>
        )}

        {/* Order Summary */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Order Summary</h2>
          <ul className="divide-y">
            {items.map(({ product, quantity }) => {
              const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
              return (
                <li key={product.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {quantity} × ${price.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-bold">${(price * quantity).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (13% HST)</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{method === 'pickup' ? 'Free (Pickup)' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-display font-bold text-lg">Total</span>
              <span className="font-display font-bold text-xl text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-6 h-12"
            disabled={!canSubmit}
            onClick={handlePay}
          >
            {loading ? <><Loader2 className="animate-spin" /> Redirecting...</> : 'Proceed to Payment'}
          </Button>
        </section>

        <div className="mt-4 text-center">
          <Link to="/cart" className="text-sm text-primary hover:underline">← Back to Cart</Link>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
