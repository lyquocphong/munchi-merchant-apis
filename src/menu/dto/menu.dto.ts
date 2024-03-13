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

