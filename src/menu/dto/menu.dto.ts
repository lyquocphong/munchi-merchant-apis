export interface OrderingProductCategory {
  id: number;
  business_id: number;
  name: string;
  image: string | null;
  rank: number;
  enabled: boolean;
  external_id: string | null;
  parent_category_id: number | null;
  description: string | null;
}

export interface OrderingCategoryExtraOptionSubOption {
  id: number;
  extra_option_id: number;
  name: string;
  price: number;
  image: string | null;
  rank: number;
  description: string | null;
  enabled: boolean;
  external_id: string | null;
  preselected: boolean;
}

export interface OrderingCategoryExtraOption {
  id: number;
  extra_id: number;
  name: string;
  image: string | null;
  rank: number;
  enabled: boolean;
  external_id: string | null;
  suboptions: OrderingCategoryExtraOptionSubOption[];
}

interface OrderingCategoryExtra {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  enabled: boolean;
  external_id: string | null;
  rank: number;
  options: OrderingCategoryExtraOption[];
  metafields: any[];
}

export interface OrderingCategoryProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string;
  sku: string;
  category_id: number;
  inventoried: boolean;
  quantity: number;
  featured: boolean;
  enabled: boolean;
  upselling: boolean;
  in_offer: boolean;
  offer_price: number;
  rank: number;
  offer_rate: number;
  offer_rate_type: number;
  offer_include_options: boolean;
  external_id: string | null;
  barcode: string | null;
  barcode_alternative: string | null;
  estimated_person: number | null;
  tax_id: number | null;
  fee_id: number | null;
  slug: string | null;
  seo_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  cost_price: number | null;
  cost_offer_price: number | null;
  weight: number | null;
  calories: number | null;
  weight_unit: string | null;
  hide_special_instructions: boolean;
  maximum_per_order: number | null;
  minimum_per_order: number;
  duration: number | null;
  type: string;
  load_type: string;
  updated_at: string; // Ideally use Date type
  created_at: string; // Ideally use Date type
  deleted_at: string | null;
  is_hidden: boolean;
  tags: any[]; // Assuming tag structure is unknown
  gallery: any[]; // Assuming image gallery structure is unknown
  ingredients: any[]; // Assuming ingredient structure is unknown
  tax: any | null; // Assuming tax structure is unknown
  fee: any | null; // Assuming fee structure is unknown
  category: OrderingProductCategory | null;
  extras: OrderingCategoryExtra[];
  metafields: any[];
}

// The Top-Level Data Structure
export type OrderingCategory = {
  id: number;
  business_id: number;
  name: string;
  enabled: boolean;
  description: string | null;
  products: OrderingCategoryProduct[];
  metafields: any[];
};
