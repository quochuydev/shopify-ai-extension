export type ProductContent = {
  title: string;
  description: string;
  price: string;
  compare_at_price?: string;
  sku: string;
  weight: string;
  variants: Array<{
    price: string;
    compare_at_price?: string;
    sku: string;
    weight: string;
  }>;
  meta_title: string;
  meta_description: string;
  status: string;
  published_scope: string;
  product_type: string;
  vendor: string;
  collections: string[];
  tags: string;
};
