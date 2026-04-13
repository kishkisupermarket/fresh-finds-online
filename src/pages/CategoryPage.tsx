import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { useParams } from 'react-router-dom';
import { Category } from '@/types/product';

const categoryInfo: Record<Category, { title: string; emoji: string; desc: string }> = {
  meats: { title: 'Meats & Seafood', emoji: '🥩', desc: 'Premium cuts, poultry, and fresh seafood' },
  grocery: { title: 'Grocery', emoji: '🛒', desc: 'Pantry staples, oils, rice, and beverages' },
  vegetables: { title: 'Vegetables & Fruits', emoji: '🥦', desc: 'Farm-fresh produce picked at peak ripeness' },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug as Category;
  const info = categoryInfo[category];
  const products = mockProducts.filter(p => p.category === category);

  if (!info) return <Layout><div className="container py-20 text-center text-muted-foreground">Category not found.</div></Layout>;

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{info.emoji} {info.title}</h1>
          <p className="text-muted-foreground mt-1">{info.desc}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {products.length === 0 && <p className="text-center text-muted-foreground py-12">No products in this category yet.</p>}
      </div>
    </Layout>
  );
};

export default CategoryPage;
