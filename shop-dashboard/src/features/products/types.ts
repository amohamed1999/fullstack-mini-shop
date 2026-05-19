export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  created_at: string;
  categories: ProductCategory;
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image?: File;
}
