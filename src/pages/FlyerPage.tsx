import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

const FlyerPage = () => {
  const { data: flyerProducts = [] } = useProducts({ inFlyer: true });

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8 text-center">
          <span className="text-sm font-medium text-secondary uppercase tracking-wider">This Week&apos;s</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">Weekly Deals & Flyer</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Save big on your favourite groceries. Deals valid while supplies last.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {flyerProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {flyerProducts.length === 0 && <p className="text-center text-muted-foreground py-12">No deals this week. Check back soon!</p>}
      </div>
    </Layout>
  );
};

export default FlyerPage;
