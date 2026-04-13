import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return true;
  // Simple fuzzy: check if all chars of query appear in order
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return mockProducts.filter(p =>
      fuzzyMatch(p.name, query) || fuzzyMatch(p.description, query) || fuzzyMatch(p.category, query)
    );
  }, [query]);

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
