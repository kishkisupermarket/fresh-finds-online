export type Category = 'meats' | 'grocery' | 'vegetables';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number | null;
  category: Category;
  image_url: string;
  is_on_sale: boolean;
  is_in_flyer: boolean;
  is_popular: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
