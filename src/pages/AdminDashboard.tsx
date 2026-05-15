import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, uploadProductImage } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Plus, Pencil, Trash2, Upload, Package, DollarSign, Tag } from 'lucide-react';
import type { Product, Category } from '@/types/product';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersSection from '@/components/admin/OrdersSection';

const categories: { value: Category; label: string }[] = [
  { value: 'meats', label: 'Meats' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'vegetables', label: 'Vegetables' },
];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  sale_price: string;
  category: Category;
  is_on_sale: boolean;
  is_in_flyer: boolean;
  is_popular: boolean;
}

const emptyForm: ProductFormData = {
  name: '', description: '', price: '', sale_price: '', category: 'grocery',
  is_on_sale: false, is_in_flyer: false, is_popular: false,
};

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md"><CardContent className="p-6 text-center">
        <p className="text-destructive font-semibold mb-2">Access Denied</p>
        <p className="text-muted-foreground text-sm mb-4">Your account does not have admin privileges.</p>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </CardContent></Card>
    </div>
  );

  const filtered = filterCategory === 'all' ? products : products.filter(p => p.category === filterCategory);

  const stats = {
    total: products.length,
    onSale: products.filter(p => p.is_on_sale).length,
    inFlyer: products.filter(p => p.is_in_flyer).length,
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      sale_price: p.sale_price ? String(p.sale_price) : '', category: p.category,
      is_on_sale: p.is_on_sale, is_in_flyer: p.is_in_flyer, is_popular: p.is_popular,
    });
    setImageFile(null);
    setImagePreview(p.image_url || '');
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      let image_url = editingId ? (imagePreview || '') : '';
      if (imageFile) {
        image_url = await uploadProductImage(imageFile);
      }

      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        category: form.category,
        image_url,
        is_on_sale: form.is_on_sale,
        is_in_flyer: form.is_in_flyer,
        is_popular: form.is_popular,
      };

      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...productData });
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(productData as any);
        toast.success('Product created');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const toggleFlyer = async (p: Product) => {
    await updateProduct.mutateAsync({ id: p.id, is_in_flyer: !p.is_in_flyer });
    toast.success(p.is_in_flyer ? 'Removed from flyer' : 'Added to flyer');
  };

  const toggleSale = async (p: Product) => {
    await updateProduct.mutateAsync({ id: p.id, is_on_sale: !p.is_on_sale });
    toast.success(p.is_on_sale ? 'Sale removed' : 'Marked as on sale');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-display text-lg font-bold text-foreground">Kishki Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.total}</p><p className="text-xs text-muted-foreground">Total Products</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.onSale}</p><p className="text-xs text-muted-foreground">On Sale</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center"><Tag className="w-5 h-5 text-secondary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.inFlyer}</p><p className="text-xs text-muted-foreground">In Weekly Flyer</p></div>
          </CardContent></Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
        </div>

        {/* Product Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No products found. Add your first product!</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-lg">
                            {p.category === 'meats' ? '🥩' : p.category === 'vegetables' ? '🥬' : '🛒'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs capitalize">{p.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">${Number(p.price).toFixed(2)}</span>
                        {p.sale_price && <span className="block text-xs text-destructive">${Number(p.sale_price).toFixed(2)}</span>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {p.is_on_sale && <Badge variant="destructive" className="text-xs cursor-pointer" onClick={() => toggleSale(p)}>Sale</Badge>}
                          {p.is_in_flyer && <Badge className="text-xs cursor-pointer bg-secondary" onClick={() => toggleFlyer(p)}>Flyer</Badge>}
                          {p.is_popular && <Badge variant="outline" className="text-xs">Popular</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Price *</label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Sale Price</label>
                <Input type="number" step="0.01" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Product Image</label>
              <div className="mt-1 flex items-center gap-3">
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded object-cover" />}
                <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted text-sm">
                  <Upload className="w-4 h-4" /> Choose File
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">On Sale</label>
                <Switch checked={form.is_on_sale} onCheckedChange={v => setForm({ ...form, is_on_sale: v })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">In Weekly Flyer</label>
                <Switch checked={form.is_in_flyer} onCheckedChange={v => setForm({ ...form, is_in_flyer: v })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Popular / Best Seller</label>
                <Switch checked={form.is_popular} onCheckedChange={v => setForm({ ...form, is_popular: v })} />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
