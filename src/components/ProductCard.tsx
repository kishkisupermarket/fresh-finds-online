import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryColors: Record<string, string> = {
  meats: 'bg-red-100 text-red-700',
  grocery: 'bg-amber-100 text-amber-700',
  vegetables: 'bg-green-100 text-green-700',
};

const categoryEmoji: Record<string, string> = {
  meats: '🥩',
  grocery: '🛒',
  vegetables: '🥦',
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const displayPrice = product.is_on_sale && product.sale_price ? Number(product.sale_price) : Number(product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-6xl">{categoryEmoji[product.category] || '🛍️'}</span>
        )}
        {product.is_on_sale && (
          <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" /> SALE
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${categoryColors[product.category]}`}>
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </span>
        <h3 className="font-display font-semibold text-card-foreground leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">${displayPrice.toFixed(2)}</span>
            {product.is_on_sale && product.sale_price && (
              <span className="text-sm text-muted-foreground line-through">${Number(product.price).toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
