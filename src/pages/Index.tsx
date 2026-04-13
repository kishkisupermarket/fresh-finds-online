import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Leaf } from 'lucide-react';

const features = [
  { icon: Leaf, title: 'Farm Fresh', desc: 'Locally sourced produce delivered daily' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Same-day pickup or delivery available' },
  { icon: Shield, title: 'Quality Guaranteed', desc: '100% satisfaction or money back' },
];

const Index = () => {
  const { data: popularProducts = [] } = useProducts({ popular: true });
  const { data: saleProducts = [] } = useProducts({ onSale: true });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'var(--hero-gradient)' }}>
        <div className="container py-16 md:py-24 text-primary-foreground relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
              Fresh Groceries,<br />Delivered to Your Table
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Your neighbourhood Canadian grocery store in Waterloo with the freshest meats, vegetables, and everyday essentials.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/category/meats" className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary-foreground/90 transition-colors">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/flyer" className="inline-flex items-center gap-2 border border-primary-foreground/40 text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary-foreground/10 transition-colors">
                Weekly Deals
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-[12rem] leading-none">🥬</div>
          <div className="absolute bottom-5 right-1/3 text-[8rem] leading-none">🍎</div>
        </div>
      </section>

      {/* Features */}
      <section className="container -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-lg p-5 flex items-center gap-4 border" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-card-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* On Sale */}
      {saleProducts.length > 0 && (
        <section className="container mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">🔥 On Sale Now</h2>
            <Link to="/flyer" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Popular */}
      {popularProducts.length > 0 && (
        <section className="container mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">⭐ Best Sellers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mt-16">
        <div className="rounded-2xl p-8 md:p-12 text-center" style={{ background: 'var(--hero-gradient)' }}>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-3">Visit Us Today!</h2>
          <p className="text-primary-foreground/80 mb-6">468 Albert St, Waterloo, ON · Open 7 days a week</p>
          <a href="tel:5192082025" className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-full font-semibold text-sm">Call 519-208-2025</a>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
