import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Truck, Store } from 'lucide-react';

type OrderStatus = 'new' | 'pending' | 'preparing' | 'ready' | 'delivered';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered'];

const statusColor: Record<string, string> = {
  new: 'bg-muted text-foreground',
  pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  preparing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  ready: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  delivered: 'bg-green-500/15 text-green-700 dark:text-green-400',
};

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_city: string | null;
  status: OrderStatus;
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, customer_name, customer_phone, customer_email, total, delivery_method, delivery_city, status')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const prev = orders;
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      setOrders(prev);
      toast.error(error.message);
    } else {
      toast.success(`Order marked ${status}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead className="hidden lg:table-cell">City</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="text-sm">
                    {new Date(o.created_at).toLocaleDateString()}
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground text-sm">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{o.customer_phone}</TableCell>
                  <TableCell className="font-semibold">${Number(o.total).toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="capitalize gap-1">
                      {o.delivery_method === 'delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                      {o.delivery_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {o.delivery_city || '—'}
                  </TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className={`w-[130px] h-8 text-xs capitalize ${statusColor[o.status] || ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {o.status === 'new' && <SelectItem value="new">New</SelectItem>}
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
