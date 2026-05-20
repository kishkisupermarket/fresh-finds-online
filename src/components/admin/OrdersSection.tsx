import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const STATUS_FLOW: Record<string, string> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: 'delivered',
};

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  preparing: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
};

export default function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = STATUS_FLOW[currentStatus];
    if (nextStatus === currentStatus) return;
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus as 'pending' | 'preparing' | 'ready' | 'delivered' | 'new' })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Order marked as ${nextStatus}`);
      fetchOrders();
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
  );

  if (orders.length === 0) return (
    <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
  );

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                </TableCell>
                <TableCell className="font-bold">
                  ${Number(order.total).toFixed(2)}
                </TableCell>
                <TableCell className="capitalize text-sm">
                  {order.delivery_method}
                </TableCell>
                <TableCell className="text-sm">
                  {order.delivery_city || '—'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] || ''}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  {order.status !== 'delivered' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(order.id, order.status)}
                    >
                      → {STATUS_FLOW[order.status]}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
