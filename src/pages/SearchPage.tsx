import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'react-router-dom';

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const { data: results = [] } = useProducts({ search: query || undefined });

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Search results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-muted-foreground mb-8">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {results.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No products match your search. Try a different term!</p>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
